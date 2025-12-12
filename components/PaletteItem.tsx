import React from 'react';
import { PaletteStep } from '../types';
import { Icons } from '../constants';

interface PaletteItemProps {
  item: PaletteStep;
  prefix: string;
  onUpdate: (step: number, hex: string) => void;
  onLockToggle: (step: number) => void;
}

export const PaletteItem: React.FC<PaletteItemProps> = ({ item, prefix, onUpdate, onLockToggle }) => {
  const badgeColor = item.contrast.level === 'AAA' ? 'bg-green-100 text-green-800 border-green-200' 
                   : item.contrast.level === 'AA' ? 'bg-green-50 text-green-700 border-green-200'
                   : item.contrast.level === 'AA+' ? 'bg-green-50 text-green-700 border-green-200'
                   : 'bg-red-50 text-red-700 border-red-100';

  return (
    <div className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col h-full relative">
      
      {/* Color Swatch Area */}
      <div 
        className="relative h-32 w-full flex-shrink-0 group/swatch"
        style={{ backgroundColor: item.hex }}
      >
        {/* Color Input Overlay */}
        <input 
          type="color" 
          value={item.hex}
          disabled={item.locked}
          onChange={(e) => onUpdate(item.step, e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer disabled:cursor-not-allowed z-10"
          title={item.locked ? "Color is locked" : "Click to edit color"}
        />

        {/* Lock Button (Floating) */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onLockToggle(item.step);
          }}
          className={`absolute top-2 right-2 p-1.5 rounded-full bg-white/90 backdrop-blur-sm shadow-sm z-20 transition-all hover:bg-white ${item.locked ? 'text-blue-600' : 'text-gray-400 opacity-0 group-hover/swatch:opacity-100'}`}
        >
          {item.locked ? <Icons.Lock /> : <Icons.Unlock />}
        </button>

        {/* Edit Indicator (Center) */}
        {!item.locked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover/swatch:opacity-100 transition-opacity">
            <div className="bg-black/20 text-white p-2 rounded-full backdrop-blur-sm">
               <Icons.Edit />
            </div>
          </div>
        )}
      </div>

      {/* Details Panel */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <h3 className="font-bold text-gray-900 text-base leading-tight">
            {prefix}-{item.step}
          </h3>
          <div className="flex items-center gap-2 mt-1">
             <span className="font-mono text-sm text-gray-500 uppercase">{item.hex}</span>
             {/* Small Hex Input for manual typing */}
             {!item.locked && (
               <input 
                  type="text"
                  value={item.hex}
                  onChange={(e) => onUpdate(item.step, e.target.value)} 
                  className="w-0 h-0 opacity-0 focus:w-full focus:h-auto focus:opacity-100 absolute bottom-4 right-4 border border-gray-300 p-1 text-xs" 
               />
             )}
          </div>
        </div>

        <div className="mt-auto">
          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-semibold ${badgeColor}`}>
            <span>WCAG {item.contrast.ratio}</span>
            <span className="opacity-60">|</span>
            <span>{item.contrast.level}</span>
          </div>
        </div>
      </div>
    </div>
  );
};