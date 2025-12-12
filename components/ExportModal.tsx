import React, { useState } from 'react';
import * as d3 from 'd3';
import { PaletteStep, TokenMappingConfig, ExportFormat, ColorMode, ColorFormat } from '../types';
import { formatColorValue } from '../services/colorService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  palette: PaletteStep[];
  mode: ColorMode | null;
  config: TokenMappingConfig;
}

const SIDEBAR_ITEMS: { id: ExportFormat; label: string; badge?: string }[] = [
  { id: 'tailwind3', label: 'Tailwind 3', badge: 'free' },
  { id: 'tailwind4', label: 'Tailwind 4', badge: 'free' },
  { id: 'css', label: 'CSS' },
  { id: 'scss', label: 'SCSS' },
  { id: 'svg', label: 'SVG / Figma' },
  { id: 'figma-tokens', label: 'Figma Tokens', badge: 'json' },
  { id: 'figma-api', label: 'Figma Variables', badge: 'js' },
  { id: 'json', label: 'Simple JSON' },
];

const COLOR_FORMATS: { id: ColorFormat; label: string; badge?: string }[] = [
  { id: 'hex', label: 'Hex code', badge: 'free' },
  { id: 'oklch', label: 'OKLCH' },
  { id: 'hsl', label: 'HSL' },
  { id: 'rgb', label: 'RGB' },
];

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, palette, mode, config }) => {
  const [format, setFormat] = useState<ExportFormat>('tailwind3');
  const [colorFormat, setColorFormat] = useState<ColorFormat>('hex');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const generateCode = () => {
    // Helper to get formatted value
    const val = (hex: string) => formatColorValue(hex, colorFormat);

    if (format === 'json') {
      const colorsObj = palette.reduce((acc, curr) => {
        acc[curr.step] = val(curr.hex);
        return acc;
      }, {} as Record<string, string>);
      
      return JSON.stringify({
        name: config.prefix,
        system: mode?.name,
        colors: colorsObj
      }, null, 2);
    }
    
    if (format === 'tailwind3') {
      const entries = palette.map(p => `        '${config.prefix}-${p.step}': '${val(p.hex)}',`).join('\n');
      return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
${entries}
      }
    }
  }
}`;
    }

    if (format === 'tailwind4') {
        const entries = palette.map(p => `  --color-${config.prefix}-${p.step}: ${val(p.hex)};`).join('\n');
        return `@theme {
${entries}
}`;
    }

    if (format === 'css') {
      return `:root {
  /* ${mode?.name} Scale - Base: ${config.prefix} */
${palette.map(p => `  --${config.prefix}-${p.step}: ${val(p.hex)};`).join('\n')}
}`;
    }

    if (format === 'scss') {
        return `// ${mode?.name} Scale
${palette.map(p => `$${config.prefix}-${p.step}: ${val(p.hex)};`).join('\n')}`;
    }

    if (format === 'svg') {
        // Detailed SVG representation of the palette
        const stepWidth = 100;
        const height = 150;
        const width = palette.length * stepWidth;
        
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <style>
      .label { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 14px; font-weight: 600; fill: #111827; }
      .hex { font-family: "JetBrains Mono", monospace; font-size: 12px; fill: #6B7280; }
      .bg { fill: #ffffff; }
    </style>
  </defs>
  <rect width="${width}" height="${height}" class="bg" />
  <g>
    ${palette.map((p, i) => `
    <g transform="translate(${i * stepWidth}, 0)">
      <rect width="${stepWidth}" height="100" fill="${p.hex}" />
      <text x="10" y="125" class="label">${p.step}</text>
      <text x="10" y="142" class="hex">${val(p.hex).toUpperCase()}</text>
    </g>`).join('')}
  </g>
</svg>`;
    }

    if (format === 'figma-tokens') {
      // W3C Design Tokens Format (compatible with Tokens Studio)
      const tokens = {
        [config.prefix]: palette.reduce((acc, curr) => {
          acc[curr.step.toString()] = {
            $value: curr.hex,
            $type: "color"
          };
          return acc;
        }, {} as Record<string, any>)
      };
      return JSON.stringify(tokens, null, 2);
    }

    if (format === 'figma-api') {
      // Generate JavaScript code compatible with Figma Plugin API
      const collectionName = `${config.prefix.charAt(0).toUpperCase() + config.prefix.slice(1)} Scale`;
      
      const vars = palette.map(p => {
        const c = d3.color(p.hex)?.rgb();
        if (!c) return null;
        // Figma requires 0-1 range for RGB
        return `    { name: "${config.prefix}/${p.step}", value: { r: ${c.r/255}, g: ${c.g/255}, b: ${c.b/255} } }`;
      }).filter(Boolean).join(',\n');

      return `// Run this in Figma Console or Scripter Plugin
(async () => {
  const collection = figma.variables.createVariableCollection("${collectionName}");
  const modeId = collection.modes[0].modeId;

  const colors = [
${vars}
  ];

  for (const c of colors) {
    const variable = figma.variables.createVariable(c.name, collection.id, "COLOR");
    variable.setValueForMode(modeId, c.value);
  }
  
  figma.notify("Created " + colors.length + " variables");
})();`;
    }

    return '';
  };

  const code = generateCode();

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show color format selector only for CSS/Code-based formats, not JSON structures that enforce specific formats
  const showColorFormatSelect = !['svg', 'figma-tokens', 'figma-api', 'json'].includes(format);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Container */}
      <div className="relative bg-white rounded-xl shadow-2xl w-[900px] h-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-gray-200 shrink-0">
          <h3 className="text-lg font-bold text-gray-900">Export code</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex flex-1 overflow-hidden">
            
            {/* Sidebar */}
            <div className="w-56 bg-gray-50 border-r border-gray-200 py-6 overflow-y-auto shrink-0">
                <div className="flex flex-col gap-1 px-3">
                    {SIDEBAR_ITEMS.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFormat(item.id)}
                            className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                                format === item.id 
                                ? 'bg-white text-gray-900 shadow-sm ring-1 ring-gray-200' 
                                : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-700'
                            }`}
                        >
                            <span>{item.label}</span>
                            {item.badge && (
                                <span className="text-[10px] font-medium bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-300">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                
                {/* Color Format Toolbar */}
                {showColorFormatSelect && (
                  <div className="flex items-center gap-6 px-8 py-4 border-b border-gray-100">
                      {COLOR_FORMATS.map((fmt) => (
                          <button
                            key={fmt.id}
                            onClick={() => setColorFormat(fmt.id)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                                colorFormat === fmt.id ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
                            }`}
                          >
                              {fmt.label}
                              {fmt.badge && (
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full border border-gray-200">
                                      {fmt.badge}
                                  </span>
                              )}
                          </button>
                      ))}
                  </div>
                )}

                {/* Code Preview */}
                <div className="flex-1 relative bg-white overflow-hidden flex flex-col">
                    <div className="absolute top-6 right-8 z-10">
                        <button 
                            onClick={handleCopy}
                            className="bg-gray-900 text-white hover:bg-gray-800 text-xs font-medium px-4 py-2 rounded-full transition-all shadow-lg flex items-center gap-2"
                        >
                            {copied ? 'Copied!' : 'Copy to clipboard'}
                        </button>
                    </div>

                    <pre className="flex-1 p-8 overflow-auto font-mono text-sm leading-relaxed text-gray-800 selection:bg-blue-100">
                        <code>{code}</code>
                    </pre>
                </div>

            </div>
        </div>

      </div>
    </div>
  );
};