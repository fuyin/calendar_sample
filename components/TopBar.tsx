import React from 'react';
import { CloudSun, ChevronDown, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { User, ViewMode } from '../types';
import { COLORS } from '../constants';

interface TopBarProps {
  currentDate: Date;
  users: User[];
  activeUserIds: string[];
  toggleUserFilter: (id: string) => void;
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  isViewMenuOpen: boolean;
  setIsViewMenuOpen: (isOpen: boolean) => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
}

export const TopBar: React.FC<TopBarProps> = ({ 
  currentDate, 
  users, 
  activeUserIds, 
  toggleUserFilter,
  currentView,
  onViewChange,
  isViewMenuOpen,
  setIsViewMenuOpen,
  onNavigate
}) => {
  
  // Format: "Tue, Dec 2"
  const dateStr = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(currentDate);
  // Time: Mocked to match screenshot or dynamic
  const timeStr = "11:53 AM"; 

  const viewOptions: ViewMode[] = ['Schedule', 'Day', 'Week', 'Month'];

  return (
    <div className="flex flex-col w-full z-10">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-semibold text-gray-700">{dateStr}</h1>
          <span className="text-lg text-gray-500 font-medium">{timeStr}</span>
          <div className="flex items-center gap-1 ml-4 text-gray-400">
            <CloudSun size={20} />
            <span className="text-sm font-medium">25°</span>
          </div>
        </div>
        
        {/* Right side controls - View Switcher & Actions */}
        <div className="flex items-center gap-4">
          <button className="text-sm font-medium text-gray-600 flex items-center gap-1 hover:bg-white/50 px-3 py-1.5 rounded-lg transition-colors">
            Magic Import <ChevronDown size={14} />
          </button>
          
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setIsViewMenuOpen(!isViewMenuOpen);
              }}
              className="flex items-center gap-2 bg-white/50 hover:bg-white/80 border border-gray-200/50 px-4 py-1.5 rounded-full text-sm font-medium text-gray-700 shadow-sm transition-all w-32 justify-between"
            >
              {currentView}
              <ChevronDown size={14} />
            </button>

            {isViewMenuOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 glass-dropdown rounded-xl overflow-hidden z-50 p-1">
                 <div className="flex flex-col">
                   {viewOptions.map(view => (
                     <button
                        key={view}
                        onClick={() => {
                          onViewChange(view);
                          setIsViewMenuOpen(false);
                        }}
                        className={`flex items-center justify-between px-4 py-2.5 text-sm rounded-lg transition-colors ${currentView === view ? 'bg-gray-100/80 font-medium' : 'hover:bg-gray-50/50 text-gray-600'}`}
                     >
                       {view}
                       {currentView === view && <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </div>

          <button className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700">
             <Filter size={14} /> Filter
          </button>

          <div className="flex items-center gap-1 bg-white/50 rounded-full p-1 shadow-sm">
            <button onClick={() => onNavigate('prev')} className="p-1 hover:bg-white rounded-full text-gray-500"><ChevronLeft size={16} /></button>
            <button onClick={() => onNavigate('today')} className="text-xs font-medium px-2 text-gray-600 hover:text-gray-800 transition-colors">Today</button>
            <button onClick={() => onNavigate('next')} className="p-1 hover:bg-white rounded-full text-gray-500"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center px-6 pb-2 gap-3 overflow-x-auto no-scrollbar">
        {users.map(user => {
          const isActive = activeUserIds.includes(user.id);
          const color = COLORS[user.color];
          
          return (
            <button
              key={user.id}
              onClick={() => toggleUserFilter(user.id)}
              className={`
                flex items-center justify-between gap-3 px-4 py-1.5 rounded-full text-xs font-medium border transition-all min-w-[210px]
                ${isActive 
                  ? `${color.bg} ${color.border} text-gray-700 shadow-sm opacity-100` 
                  : 'bg-gray-200/50 border-transparent text-gray-400 opacity-70'}
              `}
            >
              <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center bg-white/40 text-[9px] font-bold ${color.text}`}>
                  {user.name.charAt(0)}
                </div>
                <span>{user.name}</span>
              </div>
              <span className="opacity-80 font-semibold text-[10px]">{user.completedTasks}/{user.totalTasks}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};