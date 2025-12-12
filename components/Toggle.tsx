import React from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, className = '' }) => {
  return (
    <label className={`flex items-center gap-2 cursor-pointer ${className}`}>
      <div className="relative">
        <input 
          type="checkbox" 
          className="sr-only" 
          checked={checked} 
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className={`w-9 h-5 rounded-full shadow-inner transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
        <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
      </div>
      <span className="text-xs font-medium text-gray-600 select-none">{label}</span>
    </label>
  );
};