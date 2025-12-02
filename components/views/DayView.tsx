import React, { useState, useEffect } from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface DayViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  events: CalendarEvent[];
  users: User[];
}

export const DayView: React.FC<DayViewProps> = ({ currentDate, onDateChange, events, users }) => {
  // State for the viewed month in the mini calendar (separate from selected date)
  const [displayDate, setDisplayDate] = useState(new Date(currentDate));

  // Sync display month when currentDate changes significantly (optional, but good UX)
  useEffect(() => {
    if (currentDate.getMonth() !== displayDate.getMonth() || currentDate.getFullYear() !== displayDate.getFullYear()) {
      setDisplayDate(new Date(currentDate));
    }
  }, [currentDate]);

  const handleMonthChange = (offset: number) => {
    const newDate = new Date(displayDate);
    newDate.setMonth(displayDate.getMonth() + offset);
    setDisplayDate(newDate);
  };

  // Filter events based on the passed currentDate (App state)
  const daysEvents = events.filter(e => 
    e.start.getDate() === currentDate.getDate() && 
    e.start.getMonth() === currentDate.getMonth() &&
    e.start.getFullYear() === currentDate.getFullYear()
  ).sort((a, b) => {
    if (a.isAllDay && !b.isAllDay) return -1;
    if (!a.isAllDay && b.isAllDay) return 1;
    return a.start.getTime() - b.start.getTime();
  });

  // Generate Mini Calendar Grid for displayDate
  const year = displayDate.getFullYear();
  const month = displayDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay(); // 0-6 Sun-Sat

  const calendarCells = [];
  // Prev month padding
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({
      date: new Date(year, month - 1, prevMonthLastDay - firstDay + i + 1),
      isCurrentMonth: false
    });
  }
  // Current month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarCells.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }
  // Next month padding (fill to 42 cells for 6 rows)
  const remaining = 42 - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    calendarCells.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  // --- Helper Functions ---
  const getEventStyle = (event: CalendarEvent) => {
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
         className: 'text-gray-800'
       };
    }
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

  const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNumber = currentDate.getDate();
  const displayMonthName = displayDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full bg-white/40 rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60 overflow-hidden">
      
      {/* Left Sidebar: Mini Calendar */}
      <div className="w-96 border-r border-gray-200/50 flex flex-col p-8 bg-white/50 backdrop-blur-sm z-10 hidden md:flex">
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-semibold text-gray-600">{displayMonthName}</h3>
            <div className="flex gap-2">
                <button onClick={() => handleMonthChange(-1)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400"><ChevronLeft size={20} /></button>
                <button onClick={() => handleMonthChange(1)} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400"><ChevronRight size={20} /></button>
            </div>
        </div>

        {/* Calendar Grid Header */}
        <div className="grid grid-cols-7 mb-4">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                <div key={d} className="text-center text-sm font-medium text-gray-400 py-1">{d}</div>
            ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-y-5">
            {calendarCells.map((cell, idx) => {
                const isSelected = cell.date.toDateString() === currentDate.toDateString();
                const isToday = new Date().toDateString() === cell.date.toDateString();

                return (
                    <div key={idx} className="flex justify-center">
                        <button 
                            onClick={() => onDateChange(cell.date)}
                            className={`
                                w-10 h-10 flex items-center justify-center rounded-full text-sm transition-all
                                ${isSelected ? 'bg-[#FF7F50] text-white font-bold shadow-md transform scale-105' : 
                                  cell.isCurrentMonth ? 'text-gray-600 hover:bg-white' : 'text-gray-300 hover:bg-white'}
                                ${!isSelected && isToday ? 'border border-[#FF7F50] text-[#FF7F50]' : ''}
                            `}
                        >
                            {cell.date.getDate()}
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

          {/* List Container */}
          <div className="flex-1 overflow-y-auto p-6 space-y-1 custom-scrollbar">
            {daysEvents.map((evt) => {
              const { style, className } = getEventStyle(evt);
              return (
                <div 
                  key={evt.id}
                  className={`
                    w-full rounded-lg min-h-[48px] flex items-center px-4 py-2 shadow-sm relative overflow-hidden transition-transform hover:scale-[1.005]
                    ${className}
                  `}
                  style={style}
                >
                  <div className="flex items-center w-full z-10 gap-4">
                    {/* Time Column */}
                    <div className="w-24 flex-shrink-0 flex flex-col justify-center border-r border-black/5 pr-4">
                      {evt.isAllDay ? (
                        <span className="text-xs font-semibold opacity-90">All Day</span>
                      ) : (
                        <span className="text-xs font-medium opacity-80">{formatTimeRange(evt)}</span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                       <h3 className="text-sm font-bold opacity-95 truncate">{evt.title}</h3>
                       {evt.location && <span className="text-[10px] opacity-75 mt-0.5 truncate">{evt.location}</span>}
                    </div>

                    {/* Users */}
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
            
            {daysEvents.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 gap-2">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                  <span className="text-2xl">📅</span>
                </div>
                <p>No events for this day</p>
                <button className="text-sm text-blue-500 font-medium hover:underline">Add Event</button>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};