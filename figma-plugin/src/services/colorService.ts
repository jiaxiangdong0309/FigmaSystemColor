import * as d3 from 'd3';
import { PaletteStep, ColorMode, ContrastStatus, ColorFormat } from '../types';

// Helper to calculate luminance using WCAG formula
function getLuminance(r: number, g: number, b: number): number {
  const a = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateWCAG(fgHex: string, bgHex: string = '#FFFFFF'): ContrastStatus {
  const fg = d3.color(fgHex)?.rgb();
  const bg = d3.color(bgHex)?.rgb();

  if (!fg || !bg) {
    return { ratio: 0, level: 'Fail', isPass: false };
  }

  const lum1 = getLuminance(fg.r, fg.g, fg.b);
  const lum2 = getLuminance(bg.r, bg.g, bg.b);

  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  const ratio = (brightest + 0.05) / (darkest + 0.05);
  const roundedRatio = parseFloat(ratio.toFixed(2));

  let level: 'AAA' | 'AA' | 'AA+' | 'Fail' = 'Fail';

  if (roundedRatio >= 7) level = 'AAA';
  else if (roundedRatio >= 4.5) level = 'AA';
  else if (roundedRatio >= 3) level = 'AA+'; // Often used for Large Text

  return {
    ratio: roundedRatio,
    level,
    isPass: roundedRatio >= 4.5
  };
}

export function formatColorValue(hex: string, format: ColorFormat): string {
  const c = d3.color(hex);
  if (!c) return hex;

  switch (format) {
    case 'rgb':
      return c.formatRgb();
    case 'hsl':
      return d3.hsl(c).formatHsl();
    case 'oklch':
      // Using d3's toString() which should output valid CSS color string if supported
      // d3 v7+ supports oklch. Using cast to any to avoid TS error if types are outdated.
      if ('oklch' in d3) {
        return (d3 as any).oklch(c).toString();
      }
      return c.formatHex();
    case 'hex':
    default:
      return c.formatHex();
  }
}

export function generatePalette(baseColorHex: string, mode: ColorMode, autoAdjust: boolean = false): PaletteStep[] {
  const baseColor = d3.color(baseColorHex);
  if (!baseColor) return [];

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
  const scaleLight = d3.scaleLinear<string>()
    .domain([0, 1])
    .range(['#ffffff', baseColorHex])
    .interpolate(interpolator);

  // Dark side: Base to Black
  const scaleDark = d3.scaleLinear<string>()
    .domain([0, 1])
    .range([baseColorHex, '#000000'])
    .interpolate(interpolator);

  return steps.map((step) => {
    // Normalize current step
    const tCurrent = (step - minStep) / (maxStep - minStep);

    let hex = '';

    if (tCurrent < tBase) {
      // It's lighter than base
      const t = tCurrent / tBase;
      const easedT = Math.pow(t, 0.9);
      hex = scaleLight(easedT);
    } else if (tCurrent > tBase) {
      // It's darker than base
      const t = (tCurrent - tBase) / (1 - tBase);
      const easedT = Math.pow(t, 1.1);
      hex = scaleDark(easedT);
    } else {
      hex = baseColorHex;
    }

    let finalHex = d3.color(hex)?.formatHex() || '#000000';
    let contrast = calculateWCAG(finalHex, '#FFFFFF');

    // Auto-adjust logic: If enabled and fails AA, try to fix
    if (autoAdjust && !contrast.isPass) {
       const color = d3.hcl(finalHex);
       let l = color.l;

       for (let i = 0; i < 100; i++) {
         if (l <= 0) break;
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
export function hexToFigmaRgb(hex: string): { r: number; g: number; b: number } | null {
  const color = d3.color(hex)?.rgb();
  if (!color) return null;

  return {
    r: color.r / 255,
    g: color.g / 255,
    b: color.b / 255
  };
}

