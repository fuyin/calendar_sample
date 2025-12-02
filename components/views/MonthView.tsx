import React from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  users: User[];
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, users }) => {
  const daysInMonth = 31; // Dec 2025
  const startDayOfWeek = 1; // Dec 1st 2025 is Monday

  // Generate calendar grid
  const days = [];
  // Previous month padding
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ day: 30 - startDayOfWeek + i + 1, type: 'prev' });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, type: 'current' });
  }
  // Next month padding
  const remainingCells = 42 - days.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ day: i, type: 'next' });
  }

  const getEventsForDay = (day: number) => {
    return events.filter(e => {
        const d = new Date(e.start);
        return d.getDate() === day && d.getMonth() === 11; // Hardcoded for Dec demo
    });
  };

  const getHolidaysForDay = (day: number) => {
    return events.filter(e => e.isHoliday && e.start.getDate() === day && e.start.getMonth() === 11); // Hardcoded Dec
  }

  // Next month holidays
  const getNextMonthHolidays = (day: number) => {
     return events.filter(e => e.isHoliday && e.start.getDate() === day && e.start.getMonth() === 0);
  }

  // Helper to generate diagonal striped background
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
         className: 'text-gray-800 border border-white/40' // Darker text for visibility on stripes
       };
    }

    // Single User Solid Background
    const uid = event.userIds ? event.userIds[0] : event.userId;
    const user = users.find(u => u.id === uid);
    const colorKey = user ? user.color : 'calBlue';
    const color = COLORS[colorKey];

    return {
      style: {},
      className: `${color.bg} ${color.text} border border-white/20`
    };
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/40 rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60">
      {/* Month Header */}
      <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-600">December 2025</h2>
      </div>

      {/* Days Header */}
      <div className="grid grid-cols-7 border-b border-gray-200/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-2 text-center text-sm font-serif font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6">
        {days.map((cell, idx) => {
          const isToday = cell.type === 'current' && cell.day === 2; // Dec 2 is current in demo
          
          // Get content based on cell type
          const cellEvents = cell.type === 'current' ? getEventsForDay(cell.day) : [];
          const holidays = cell.type === 'current' 
            ? getHolidaysForDay(cell.day) 
            : (cell.type === 'next' ? getNextMonthHolidays(cell.day) : []);
            
          const isOtherMonth = cell.type !== 'current';

          return (
            <div key={idx} className={`border-r border-b border-gray-200/30 p-1 relative group ${isOtherMonth ? 'bg-gray-50/30' : 'bg-white/20'}`}>
              <div className="flex justify-start p-1.5">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all
                  ${isToday 
                    ? 'bg-[#FF7F50] text-white shadow-lg shadow-red-200 scale-110' 
                    : isOtherMonth ? 'text-gray-300' : 'text-gray-600'}
                `}>
                  {cell.day}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-1 px-1">
                {holidays.map(h => (
                   <div key={h.id} className="bg-[#B2DFDB] text-[#00695C] text-[11px] px-2 py-0.5 rounded-full truncate font-medium w-max max-w-full shadow-sm">
                     {h.title}
                   </div>
                ))}
                
                {cellEvents.filter(e => !e.isHoliday).slice(0, 4).map(e => {
                  const { style, className } = getEventStyle(e);
                  
                  return (
                    <div 
                      key={e.id} 
                      className={`text-[10px] px-2 py-1 rounded-md truncate font-medium shadow-sm transition-transform hover:scale-105 ${className}`}
                      style={style}
                    >
                      {e.title}
                      {e.start.getHours() > 0 && !e.isAllDay && (
                         <span className="opacity-75 ml-1 font-normal">
                           {e.start.getHours() > 12 ? e.start.getHours() - 12 : e.start.getHours()}pm
                         </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
