import React, { useState, useEffect } from 'react';
import { ColorMode, PaletteStep, TokenMappingConfig } from './types';
import { COLOR_MODES, Icons } from './constants';
import { generatePalette, calculateWCAG } from './services/colorService';
import { Button } from './components/Button';
import { PaletteItem } from './components/PaletteItem';
import { ExportModal } from './components/ExportModal';
import { Toggle } from './components/Toggle';

const App: React.FC = () => {
  // State
  const [selectedMode, setSelectedMode] = useState<ColorMode>(COLOR_MODES[0]); // Default to Tailwind
  const [baseColor, setBaseColor] = useState<string>('#3B82F6'); // Default Blue
  const [palette, setPalette] = useState<PaletteStep[]>([]);
  const [tokenConfig, setTokenConfig] = useState<TokenMappingConfig>({ prefix: 'primary', casing: 'kebab' });
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [autoAdjust, setAutoAdjust] = useState(false);

  // Initial Generation
  useEffect(() => {
    const newPalette = generatePalette(baseColor, selectedMode, autoAdjust);
    setPalette(newPalette);
  }, [baseColor, selectedMode, autoAdjust]); // Re-generate when mode, base color, or auto-adjust changes

  // Handlers
  const handleColorUpdate = (step: number, newHex: string) => {
    setPalette(prev => prev.map(p => {
      if (p.step === step) {
        const contrast = calculateWCAG(newHex);
        return { ...p, hex: newHex, contrast };
      }
      return p;
    }));
  };

  const handleLockToggle = (step: number) => {
    setPalette(prev => prev.map(p => p.step === step ? { ...p, locked: !p.locked } : p));
  };

  const handleRandomize = () => {
    const randomColor = `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase()}`;
    setBaseColor(randomColor);
  };

  // Stats
  const passCount = palette.filter(p => p.contrast.level !== 'Fail').length;
  const failCount = palette.filter(p => p.contrast.level === 'Fail').length;

  return (
    <div className="flex h-screen w-screen bg-gray-50 text-slate-800 font-sans overflow-hidden">
      
      {/* ---------------- Sidebar (Config) ---------------- */}
      <aside className="w-80 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center text-white">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>
            </div>
            System Color
          </h1>
          <p className="text-xs text-gray-400 mt-1">Engineering-grade generator</p>
        </div>

        {/* Controls Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          
          {/* Section 1: System */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Color System</label>
            <div className="relative">
              <select 
                value={selectedMode.id}
                onChange={(e) => {
                  const mode = COLOR_MODES.find(m => m.id === e.target.value);
                  if (mode) setSelectedMode(mode);
                }}
                className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 pr-8 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              >
                {COLOR_MODES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-tight">
              {selectedMode.description}
            </p>
          </div>

          {/* Section 2: Key Color */}
          <div className="space-y-3">
             <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Base Color</label>
                <button onClick={handleRandomize} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1">
                  <Icons.Refresh /> Random
                </button>
             </div>
             
             <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 flex-shrink-0 rounded-lg shadow-sm border border-gray-200 overflow-hidden group">
                   <input 
                      type="color" 
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] cursor-pointer p-0 m-0"
                   />
                </div>
                <div className="flex-1">
                   <input 
                      type="text" 
                      value={baseColor.toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if(val.length <= 7) setBaseColor(val);
                      }}
                      maxLength={7}
                      className="w-full font-mono text-sm border-gray-200 border rounded-md px-3 py-2 uppercase focus:ring-blue-500 focus:border-blue-500"
                   />
                </div>
             </div>
             <p className="text-xs text-gray-400">Mapped to step <b>{selectedMode.baseStep}</b></p>
          </div>

          {/* Section 3: Naming */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Token Config</label>
            <input 
               type="text" 
               value={tokenConfig.prefix}
               onChange={(e) => setTokenConfig({...tokenConfig, prefix: e.target.value})}
               placeholder="e.g. primary"
               className="w-full border-gray-200 border rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t border-gray-200">
           <Button className="w-full" onClick={() => setIsExportOpen(true)} icon={<Icons.Download />}>
             Export
           </Button>
           <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
              <a href="#" className="hover:text-gray-600">Documentation</a>
              <a href="#" className="hover:text-gray-600">Report Issue</a>
           </div>
        </div>
      </aside>

      {/* ---------------- Main Content (Preview) ---------------- */}
      <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        
        {/* Top Bar Stats */}
        <header className="h-16 bg-white border-b border-gray-200 px-8 flex items-center justify-between shadow-sm z-10">
           <div className="flex items-center gap-6">
              <h2 className="text-base font-semibold text-gray-800">Palette Preview</h2>
              <div className="h-4 w-px bg-gray-200"></div>
              <div className="flex gap-4 text-sm">
                 <span className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                   <span className="w-2 h-2 rounded-full bg-green-500"></span>
                   <b>{passCount}</b> Pass
                 </span>
                 {failCount > 0 && (
                   <span className="flex items-center gap-1.5 text-gray-600 bg-red-50 px-2 py-0.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                    <b>{failCount}</b> Fail
                   </span>
                 )}
              </div>
           </div>
           
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3">
                <Toggle 
                  label="Auto-fix Contrast" 
                  checked={autoAdjust} 
                  onChange={setAutoAdjust} 
                />
             </div>
             <div className="h-4 w-px bg-gray-200"></div>
             <div className="text-xs text-gray-400 flex items-center gap-2">
               <span>WCAG vs White</span>
               <Icons.Eye />
             </div>
           </div>
        </header>

        {/* Palette List - Changed to Grid Layout */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
           <div className="max-w-7xl mx-auto">
              {/* Grid Container */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                  {palette.map((item) => (
                    <PaletteItem 
                      key={item.step}
                      item={item}
                      prefix={tokenConfig.prefix}
                      onUpdate={handleColorUpdate}
                      onLockToggle={handleLockToggle}
                    />
                  ))}
              </div>
              
              <div className="mt-8 text-center text-xs text-gray-400">
                Calculated using <b>{selectedMode.name}</b> interpolation curves. <br/>
                WCAG 2.0/2.1 Contrast Ratio calculated against pure white.
              </div>
           </div>
        </div>

      </main>

      <ExportModal 
        isOpen={isExportOpen} 
        onClose={() => setIsExportOpen(false)} 
        palette={palette}
        mode={selectedMode}
        config={tokenConfig}
      />

    </div>
  );
};

export default App;