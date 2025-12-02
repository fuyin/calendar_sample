import React, { useState } from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayViewProps {
  events: CalendarEvent[];
  users: User[];
}

export const DayView: React.FC<DayViewProps> = ({ events, users }) => {
  // State for the selected date, defaulting to Dec 1, 2025 to match demo data
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 11, 1));

  // Filter events based on the selected date
  const daysEvents = events.filter(e => 
    e.start.getDate() === selectedDate.getDate() && 
    e.start.getMonth() === selectedDate.getMonth() &&
    e.start.getFullYear() === selectedDate.getFullYear()
  ).sort((a, b) => {
    // Sort by All Day first, then by time
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.start.getTime() - b.start.getTime();
  });

  // --- Helper Functions ---

  // Generate diagonal striped background for multi-user events
  const getEventStyle = (event: CalendarEvent) => {
    // Multi-user Striped Background
    if (event.userIds && event.userIds.length > 1) {
       const participantColors = event.userIds.map(uid => {
          const user = users.find(u => u.id === uid);
          return user ? COLOR_HEX[user.color] : COLOR_HEX['calBlue'];
       });

       const step = 100 / participantColors.length;
       let gradientStops = '';
       
       participantColors.forEach((color, index) => {
         const start = index * step;
         const end = (index + 1) * step;
         gradientStops += `${color} ${start}%, ${color} ${end}%${index < participantColors.length - 1 ? ', ' : ''}`;
       });

       return {
         style: { background: `linear-gradient(135deg, ${gradientStops})` },
         className: 'text-gray-800' // Darker text for visibility on stripes
       };
    }

    // Single User Solid Background
    const uid = event.userIds ? event.userIds[0] : event.userId;
    const user = users.find(u => u.id === uid);
    const colorKey = user ? user.color : 'calBlue';
    const color = COLORS[colorKey];

    return {
      style: {},
      className: `${color.bg} ${color.text}`
    };
  };

  const formatTimeRange = (event: CalendarEvent) => {
    if (event.isAllDay) return 'All Day';
    const start = event.start.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    const end = event.end.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    return `${start} - ${end}`;
  };

  // Date Header Format
  const dayName = selectedDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = selectedDate.getDate();

  return (
    <div className="flex h-full bg-white/40 rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60 overflow-hidden">
      
      {/* Left Sidebar: Mini Calendar - Scaled up 50% (w-64 -> w-96) */}
      <div className="w-96 border-r border-gray-200/50 flex flex-col p-8 bg-white/50 backdrop-blur-sm z-10 hidden md:flex">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-600">December 2025</h3>
            <div className="flex gap-2">
                <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
                <button className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400"><ChevronRight size={20} /></button>
            </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-sm font-medium text-gray-400 py-1">{d}</div>
            ))}
        </div>
        
        {/* Calendar Days (Mocking Dec 2025) */}
        <div className="grid grid-cols-7 gap-y-5">
            {/* Nov padding (Nov 30 - Sunday) */}
            <div className="flex justify-center">
                 <button 
                    onClick={() => setSelectedDate(new Date(2025, 10, 30))}
                    className={`text-center text-sm w-10 h-10 flex items-center justify-center rounded-full transition-all ${
                        selectedDate.getMonth() === 10 && selectedDate.getDate() === 30 
                        ? 'bg-[#FF7F50] text-white font-bold shadow-md' 
                        : 'text-gray-300 hover:bg-white'
                    }`}
                >
                    30
                </button>
            </div>
            {/* Dec 1 - 31 */}
            {Array.from({length: 31}, (_, i) => i + 1).map(day => {
                const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === 11;
                return (
                    <div key={day} className="flex justify-center">
                        <button 
                            onClick={() => setSelectedDate(new Date(2025, 11, day))}
                            className={`
                                w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all
                                ${isSelected ? 'bg-[#FF7F50] text-white font-bold shadow-md transform scale-105' : 'text-gray-600 hover:bg-white'}
                            `}
                        >
                            {day}
                        </button>
                    </div>
                )
            })}
        </div>
      </div>

      {/* Right Content: Event List View */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-100 flex-shrink-0 bg-white z-10 px-6 py-5">
             <h2 className="text-3xl font-serif text-gray-400">
               {dayName} <span className="text-gray-800">{dayNumber}</span>
             </h2>
          </div>

          {/* List Container - Reduced spacing */}
          <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
            {daysEvents.map((evt) => {
              const { style, className } = getEventStyle(evt);
              const isStriped = evt.userIds && evt.userIds.length > 1;

              return (
                <div 
                  key={evt.id}
                  className={`
                    w-full rounded-lg min-h-[48px] flex items-center px-4 py-2 shadow-sm relative overflow-hidden transition-transform hover:scale-[1.005]
                    ${className}
                  `}
                  style={style}
                >
                  {/* Content Container */}
                  <div className="flex items-center w-full z-10 gap-4">
                    
                    {/* Time Column (or All Day Label) */}
                    <div className="w-24 flex-shrink-0 flex flex-col justify-center border-r border-black/5 pr-4">
                      {evt.isAllDay ? (
                        <span className="text-xs font-semibold opacity-90">All Day</span>
                      ) : (
                        <span className="text-xs font-medium opacity-80">{formatTimeRange(evt)}</span>
                      )}
                    </div>

                    {/* Title & Location */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                       <h3 className="text-sm font-bold opacity-95 truncate">{evt.title}</h3>
                       {evt.location && <span className="text-[10px] opacity-75 mt-0.5 truncate">{evt.location}</span>}
                    </div>

                    {/* Users / Avatars */}
                    <div className="flex -space-x-1.5">
                      {(evt.userIds || [evt.userId]).map((uid, idx) => {
                         if (!uid) return null;
                         const u = users.find(usr => usr.id === uid);
                         if (!u) return null;
                         return (
                           <div 
                             key={idx} 
                             className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-md border border-white/60 flex items-center justify-center text-[10px] font-bold shadow-sm text-gray-800"
                             title={u.name}
                           >
                             {u.name.charAt(0)}
                           </div>
                         );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Empty State spacer */}
            {daysEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                  <span className="text-2xl">📅</span>
                </div>
                <p>No events for this day</p>
                <button 
                  onClick={() => {/* Mock add event */}}
                  className="text-sm text-blue-500 font-medium hover:underline"
                >
                  Add Event
                </button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};