import React from 'react';
import { ColorMode } from './types';

export const COLOR_MODES: ColorMode[] = [
  {
    id: 'tailwind',
    name: 'Tailwind CSS',
    description: 'Expertly crafted spacing. 50-950 scale. Optimized for UI.',
    steps: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
    baseStep: 500,
  },
  {
    id: 'material',
    name: 'Material Design 3',
    description: 'Tonal palettes key to MD3 dynamic color.',
    steps: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 99, 100],
    baseStep: 40,
  },
  {
    id: 'ant',
    name: 'Ant Design',
    description: 'Natural algorithms with a 10-step scale.',
    steps: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    baseStep: 6,
  },
  {
    id: 'atlassian',
    name: 'Atlassian Design',
    description: 'Specific scales for enterprise software density.',
    steps: [50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900],
    baseStep: 400,
  }
];

// Simple SVG Icons as components using React.createElement for .ts compatibility
export const Icons = {
  ChevronRight: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "m9 18 6-6-6-6" })
  ),
  ChevronLeft: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "m15 18-6-6 6-6" })
  ),
  Settings: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "3" })
  ),
  Lock: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
    React.createElement("path", { d: "M7 11V7a5 5 0 0 1 10 0v4" })
  ),
  Unlock: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "12", height: "12", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2" }),
    React.createElement("path", { d: "M7 11V7a5 5 0 0 1 9.9-1" })
  ),
  Refresh: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }),
    React.createElement("path", { d: "M3 3v5h5" }),
    React.createElement("path", { d: "M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" }),
    React.createElement("path", { d: "M16 16h5v5" })
  ),
  Check: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M20 6 9 17l-5-5" })
  ),
  Copy: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("rect", { width: "14", height: "14", x: "8", y: "8", rx: "2", ry: "2" }),
    React.createElement("path", { d: "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" })
  ),
  Download: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "16", height: "16", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
    React.createElement("polyline", { points: "7 10 12 15 17 10" }),
    React.createElement("line", { x1: "12", x2: "12", y1: "15", y2: "3" })
  ),
  Eye: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }),
    React.createElement("circle", { cx: "12", cy: "12", r: "3" })
  ),
  Edit: () => React.createElement("svg", { xmlns: "http://www.w3.org/2000/svg", width: "14", height: "14", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, 
    React.createElement("path", { d: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }),
    React.createElement("path", { d: "M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" })
  )
};