import React from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';

interface MonthViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  users: User[];
}

export const MonthView: React.FC<MonthViewProps> = ({ currentDate, events, users }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0-6 Sun-Sat

  // Generate calendar grid
  const days = [];
  // Previous month padding
  // Calculate how many days from prev month to show. 
  // If firstDay is 0 (Sun), maybe show 0 padding? Or standard calendar often shows prev month.
  // Let's assume standard grid starting Sunday.
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push({ 
      day: prevMonthDays - firstDayOfMonth + i + 1, 
      type: 'prev',
      date: new Date(year, month - 1, prevMonthDays - firstDayOfMonth + i + 1)
    });
  }
  
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ 
      day: i, 
      type: 'current',
      date: new Date(year, month, i)
    });
  }
  
  // Next month padding
  const remainingCells = 42 - days.length; // 6 rows * 7 cols
  for (let i = 1; i <= remainingCells; i++) {
    days.push({ 
      day: i, 
      type: 'next',
      date: new Date(year, month + 1, i)
    });
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(e => {
        return e.start.getDate() === date.getDate() && 
               e.start.getMonth() === date.getMonth() &&
               e.start.getFullYear() === date.getFullYear();
    });
  };

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
         className: 'text-gray-800 border border-white/40'
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

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white/40 rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60">
      {/* Month Header */}
      <div className="p-4 border-b border-gray-100/50 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-600">{monthName}</h2>
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
          const isToday = new Date().toDateString() === cell.date.toDateString(); 
          // For demo purposes, let's also highlight the selected "Demo Today"
          const isDemoToday = cell.date.getDate() === 2 && cell.date.getMonth() === 11 && cell.date.getFullYear() === 2025;
          const highlightDay = isDemoToday; 
          
          const cellEvents = getEventsForDay(cell.date);
          const holidays = cellEvents.filter(e => e.isHoliday);
          const isOtherMonth = cell.type !== 'current';

          return (
            <div key={idx} className={`border-r border-b border-gray-200/30 p-1 relative group ${isOtherMonth ? 'bg-gray-50/30' : 'bg-white/20'}`}>
              <div className="flex justify-start p-1.5">
                <span className={`
                  text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-all
                  ${highlightDay 
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