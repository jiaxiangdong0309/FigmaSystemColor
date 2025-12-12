
export interface ColorMode {
  id: string;
  name: string;
  description: string;
  steps: number[]; // e.g., [50, 100, ... 900]
  baseStep: number; // The step the user's input color maps to (e.g. 500)
}

export interface ContrastStatus {
  ratio: number;
  level: 'AAA' | 'AA' | 'AA+' | 'Fail';
  isPass: boolean;
}

export interface PaletteStep {
  step: number;
  hex: string;
  isBase: boolean;
  locked: boolean;
  contrast: ContrastStatus;
}

export interface TokenMappingConfig {
  prefix: string; // e.g., "blue" or "primary"
  casing: 'kebab' | 'camel' | 'snake';
}

export type ExportFormat = 'tailwind3' | 'tailwind4' | 'css' | 'scss' | 'svg' | 'json' | 'figma-tokens' | 'figma-api';

export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'oklch';

