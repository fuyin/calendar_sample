import React from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Star, 
  Utensils, 
  Image, 
  List, 
  Moon, 
  Settings 
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { icon: Calendar, label: 'Calendar', active: true },
    { icon: CheckSquare, label: 'Tasks' },
    { icon: Star, label: 'Rewards' },
    { icon: Utensils, label: 'Meals' },
    { icon: Image, label: 'Photos' },
    { icon: List, label: 'Lists' },
  ];

  const bottomItems = [
    { icon: Moon, label: 'Sleep' },
    { icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="h-full w-20 flex flex-col items-center justify-between py-6 glass-panel border-r-0 border-t-0 border-b-0 rounded-tr-xl rounded-br-xl z-20">
      <div className="flex flex-col gap-8 w-full items-center">
        {/* Logo/Top Area placeholder or just start nav */}
        <div className="h-4" /> 
        
        {navItems.map((item) => (
          <button 
            key={item.label}
            className={`flex flex-col items-center gap-1 group w-full ${item.active ? 'text-gray-800' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <div className={`p-2 rounded-xl transition-all ${item.active ? 'bg-white shadow-sm' : ''}`}>
              <item.icon size={22} strokeWidth={item.active ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-6 w-full items-center pb-4">
        {bottomItems.map((item) => (
          <button 
            key={item.label}
            className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600 group"
          >
            <item.icon size={22} strokeWidth={2} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};