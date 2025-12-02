import React from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';
import { Plus } from 'lucide-react';

interface WeekViewProps {
  currentDate: Date; // Assuming Tue Dec 2
  events: CalendarEvent[];
  users: User[];
}

export const WeekView: React.FC<WeekViewProps> = ({ currentDate, events, users }) => {
  // Hardcoded structure for the 4x2 grid based on screenshot
  // Row 1: Sun 30, Mon 1, Tue 2, Wed 3
  // Row 2: Thu 4, Fri 5, Sat 6, Next Week
  
  const cells = [
    { dayName: 'Sun', date: 30, isToday: false, isNextWeek: false },
    { dayName: 'Mon', date: 1, isToday: false, isNextWeek: false },
    { dayName: 'Tue', date: 2, isToday: true, isNextWeek: false },
    { dayName: 'Wed', date: 3, isToday: false, isNextWeek: false },
    { dayName: 'Thu', date: 4, isToday: false, isNextWeek: false },
    { dayName: 'Fri', date: 5, isToday: false, isNextWeek: false },
    { dayName: 'Sat', date: 6, isToday: false, isNextWeek: false },
    { dayName: 'Next Week', date: null, isToday: false, isNextWeek: true },
  ];

  const getEventsForDate = (date: number) => {
    return events.filter(e => {
       const d = new Date(e.start);
       // Simple filter for the demo dates (Nov 30 - Dec 6)
       if (date === 30) return d.getDate() === 30 && d.getMonth() === 10; // Nov
       return d.getDate() === date && d.getMonth() === 11; // Dec
    });
  };

  // Helper to generate diagonal striped background (Reused from ScheduleView logic)
  const getEventStyle = (event: CalendarEvent) => {
    // Check if it's a multi-user event
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
         className: 'border border-white/50 text-gray-800'
       };
    }

    // Single User
    const uid = event.userIds ? event.userIds[0] : event.userId;
    const user = users.find(u => u.id === uid);
    const colorKey = user ? user.color : 'calBlue';
    const color = COLORS[colorKey];

    return {
      style: {},
      className: `${color.bg} ${color.text} border border-white/50`
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-white/40 rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60 overflow-hidden">
        {/* 4x2 Grid */}
        <div className="flex-1 grid grid-cols-4 grid-rows-2">
            {cells.map((cell, idx) => {
                const cellEvents = cell.date ? getEventsForDate(cell.date) : [];
                const isNextWeek = cell.isNextWeek;

                // Borders: Right border for all except last column. Bottom border for first row.
                const isLastCol = (idx + 1) % 4 === 0;
                const isFirstRow = idx < 4;
                const borderClasses = `
                  ${!isLastCol ? 'border-r border-gray-200/40' : ''} 
                  ${isFirstRow ? 'border-b border-gray-200/40' : ''}
                `;

                if (isNextWeek) {
                    return (
                        <div key={idx} className={`flex flex-col h-full bg-gray-50/30 ${borderClasses}`}>
                            <div className="p-4 border-b border-gray-200/20">
                                <h3 className="text-lg font-serif text-gray-700">Next Week</h3>
                                <span className="text-xs text-gray-400 font-medium">December 7 - 13</span>
                            </div>
                            <div className="flex-1 flex items-center justify-center">
                                <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition-colors">
                                    <Plus size={16} />
                                    <span className="text-sm font-medium">Add Event</span>
                                </button>
                            </div>
                        </div>
                    );
                }

                return (
                    <div key={idx} className={`flex flex-col h-full group ${borderClasses} ${cell.isToday ? 'bg-white/40' : ''} relative`}>
                        {/* Header */}
                        <div className="p-3 flex flex-col gap-1">
                            <span className={`text-sm font-medium ${cell.isToday ? 'text-gray-800' : 'text-gray-500'}`}>
                                {cell.dayName}
                            </span>
                            <div className="flex items-baseline gap-2">
                                <span className={`
                                    text-2xl font-semibold w-10 h-10 flex items-center justify-center rounded-full -ml-2
                                    ${cell.isToday ? 'bg-red-400 text-white shadow-lg shadow-red-200' : 'text-gray-700'}
                                `}>
                                    {cell.date}
                                </span>
                                {cellEvents.length === 0 && (
                                    <span className="text-xs text-gray-400 font-medium">No events</span>
                                )}
                                {cellEvents.length > 0 && (
                                    <span className="text-xs text-gray-400 font-medium">{cellEvents.length} events</span>
                                )}
                            </div>
                        </div>

                        {/* Events List */}
                        <div className="flex-1 p-2 space-y-1.5 overflow-y-auto">
                            {cellEvents.map((evt) => {
                                const { style, className } = getEventStyle(evt);
                                
                                return (
                                    <div 
                                      key={evt.id} 
                                      className={`rounded-lg p-2 shadow-sm transition-transform hover:scale-[1.02] flex flex-col justify-center min-h-[46px] ${className}`}
                                      style={style}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-bold truncate">{evt.title}</span>
                                            {/* Show user bubbles if multi-user */}
                                            {evt.userIds && evt.userIds.length > 1 && (
                                              <div className="flex -space-x-1">
                                                {evt.userIds.map(uid => {
                                                  const u = users.find(usr => usr.id === uid);
                                                  if(!u) return null;
                                                  return (
                                                    <div key={uid} className="w-3 h-3 rounded-full bg-white/80 flex items-center justify-center text-[8px] border border-white/20">
                                                      {u.name[0]}
                                                    </div>
                                                  )
                                                })}
                                              </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mt-0.5">
                                           {evt.location && <span className="text-[10px] opacity-90 truncate">{evt.location}</span>}
                                           {!evt.location && !evt.isAllDay && (
                                             <span className="text-[10px] opacity-80">3:45 - 4:45 PM</span>
                                           )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Add Event Hover Placeholder */}
                        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                             <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                                 <Plus size={14} />
                                 <span className="text-xs font-medium">Add Event</span>
                             </button>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );
};