"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateWCAG = calculateWCAG;
exports.formatColorValue = formatColorValue;
exports.generatePalette = generatePalette;
exports.hexToFigmaRgb = hexToFigmaRgb;
const d3 = __importStar(require("d3"));
// Helper to calculate luminance using WCAG formula
function getLuminance(r, g, b) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}
function calculateWCAG(fgHex, bgHex = '#FFFFFF') {
    var _a, _b;
    const fg = (_a = d3.color(fgHex)) === null || _a === void 0 ? void 0 : _a.rgb();
    const bg = (_b = d3.color(bgHex)) === null || _b === void 0 ? void 0 : _b.rgb();
    if (!fg || !bg) {
        return { ratio: 0, level: 'Fail', isPass: false };
    }
    const lum1 = getLuminance(fg.r, fg.g, fg.b);
    const lum2 = getLuminance(bg.r, bg.g, bg.b);
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    const ratio = (brightest + 0.05) / (darkest + 0.05);
    const roundedRatio = parseFloat(ratio.toFixed(2));
    let level = 'Fail';
    if (roundedRatio >= 7)
        level = 'AAA';
    else if (roundedRatio >= 4.5)
        level = 'AA';
    else if (roundedRatio >= 3)
        level = 'AA+'; // Often used for Large Text
    return {
        ratio: roundedRatio,
        level,
        isPass: roundedRatio >= 4.5
    };
}
function formatColorValue(hex, format) {
    const c = d3.color(hex);
    if (!c)
        return hex;
    switch (format) {
        case 'rgb':
            return c.formatRgb();
        case 'hsl':
            return d3.hsl(c).formatHsl();
        case 'oklch':
            // Using d3's toString() which should output valid CSS color string if supported
            // d3 v7+ supports oklch. Using cast to any to avoid TS error if types are outdated.
            if ('oklch' in d3) {
                return d3.oklch(c).toString();
            }
            return c.formatHex();
        case 'hex':
        default:
            return c.formatHex();
    }
}
function generatePalette(baseColorHex, mode, autoAdjust = false) {
    const baseColor = d3.color(baseColorHex);
    if (!baseColor)
        return [];
    const steps = mode.steps;
    const baseStep = mode.baseStep;
    // Using LCH for perceptual uniformity
    const interpolator = d3.interpolateHcl;
    const maxStep = steps[steps.length - 1];
    const minStep = steps[0];
    // Normalize baseStep to 0-1
    const tBase = (baseStep - minStep) / (maxStep - minStep);
    // Generate scales
    // Light side: White to Base
    const scaleLight = d3.scaleLinear()
        .domain([0, 1])
        .range(['#ffffff', baseColorHex])
        .interpolate(interpolator);
    // Dark side: Base to Black
    const scaleDark = d3.scaleLinear()
        .domain([0, 1])
        .range([baseColorHex, '#000000'])
        .interpolate(interpolator);
    return steps.map((step) => {
        var _a;
        // Normalize current step
        const tCurrent = (step - minStep) / (maxStep - minStep);
        let hex = '';
        if (tCurrent < tBase) {
            // It's lighter than base
            const t = tCurrent / tBase;
            const easedT = Math.pow(t, 0.9);
            hex = scaleLight(easedT);
        }
        else if (tCurrent > tBase) {
            // It's darker than base
            const t = (tCurrent - tBase) / (1 - tBase);
            const easedT = Math.pow(t, 1.1);
            hex = scaleDark(easedT);
        }
        else {
            hex = baseColorHex;
        }
        let finalHex = ((_a = d3.color(hex)) === null || _a === void 0 ? void 0 : _a.formatHex()) || '#000000';
        let contrast = calculateWCAG(finalHex, '#FFFFFF');
        // Auto-adjust logic: If enabled and fails AA, try to fix
        if (autoAdjust && !contrast.isPass) {
            const color = d3.hcl(finalHex);
            let l = color.l;
            for (let i = 0; i < 100; i++) {
                if (l <= 0)
                    break;
                l -= 1;
                const tryHex = d3.hcl(color.h, color.c, l).formatHex();
                const tryContrast = calculateWCAG(tryHex, '#FFFFFF');
                if (tryContrast.isPass) {
                    finalHex = tryHex;
                    contrast = tryContrast;
                    break;
                }
            }
        }
        return {
            step,
            hex: finalHex,
            isBase: step === baseStep,
            locked: step === baseStep,
            contrast
        };
    });
}
// Helper function to convert HEX to Figma RGB (0-1 range)
function hexToFigmaRgb(hex) {
    var _a;
    const color = (_a = d3.color(hex)) === null || _a === void 0 ? void 0 : _a.rgb();
    if (!color)
        return null;
    return {
        r: color.r / 255,
        g: color.g / 255,
        b: color.b / 255
    };
}
