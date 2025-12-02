import React, { useRef, useEffect } from 'react';
import { CalendarEvent, User } from '../../types';
import { COLORS, COLOR_HEX } from '../../constants';

interface ScheduleViewProps {
  currentDate: Date;
  events: CalendarEvent[];
  users: User[];
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ currentDate, events, users }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Filter events for specific current date
  const allEvents = events.filter(e => 
    e.start.getDate() === currentDate.getDate() && 
    e.start.getMonth() === currentDate.getMonth() &&
    e.start.getFullYear() === currentDate.getFullYear()
  );
  
  const allDayEvents = allEvents.filter(e => e.isAllDay);
  const timeEvents = allEvents.filter(e => !e.isAllDay).sort((a, b) => a.start.getTime() - b.start.getTime());

  // Scroll to 1 PM (13:00) on mount/change
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 1560; // 13 * 120
    }
  }, []);

  // --- Helper Functions ---
  const getEventBackground = (event: CalendarEvent) => {
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

  const getEventPosition = (event: CalendarEvent) => {
    const HOUR_HEIGHT = 120;
    const startHour = event.start.getHours() + event.start.getMinutes() / 60;
    const endHour = event.end.getHours() + event.end.getMinutes() / 60;
    const duration = endHour - startHour;
    const top = startHour * HOUR_HEIGHT;
    const height = duration * HOUR_HEIGHT;

    const overlaps = timeEvents.filter(e => 
      e.id !== event.id && 
      e.start < event.end && 
      e.end > event.start
    );

    let width = '100%';
    let left = '0%';

    if (overlaps.length > 0) {
      const cluster = [...overlaps, event].sort((a, b) => a.id.localeCompare(b.id)); 
      const total = cluster.length;
      const index = cluster.findIndex(e => e.id === event.id);
      width = `${100 / total}%`;
      left = `${(index * 100) / total}%`;
    }

    return { top, height, width, left };
  };

  const dayLabel = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex h-full bg-white rounded-tl-2xl ml-4 mt-2 shadow-inner border border-white/60 overflow-hidden">
      
      {/* Right Content: Time Grid */}
      <div className="flex-1 flex flex-col bg-white">
          {/* Day Header */}
          <div className="border-b border-gray-100 flex-shrink-0 bg-white z-10">
             <div className="px-6 py-4 flex items-baseline gap-2">
                 <h2 className="text-xl font-medium text-gray-500">{dayLabel}</h2>
             </div>
             
             {/* All Day Row */}
             {allDayEvents.length > 0 && (
                 <div className="flex border-t border-gray-50 py-1 px-4">
                     <div className="w-16 text-xs text-gray-400 font-medium py-2 pr-4 text-right">
                         All Day
                     </div>
                     <div className="flex-1 flex flex-col gap-1">
                         {allDayEvents.map(evt => {
                             const bgClass = getEventBackground(evt);
                             return (
                                 <div 
                                    key={evt.id} 
                                    className={`w-full rounded-md px-3 py-1.5 text-xs font-medium ${bgClass.className}`}
                                    style={bgClass.style}
                                 >
                                     {evt.title}
                                     {evt.location && <span className="opacity-70 ml-2 font-normal">{evt.location}</span>}
                                 </div>
                             )
                         })}
                     </div>
                 </div>
             )}
          </div>

          {/* Scrollable Timeline Grid */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 overflow-y-auto relative custom-scrollbar"
          >
              <div className="relative min-h-[2880px] w-full bg-white"> 
                  {/* Grid Lines */}
                  {Array.from({ length: 24 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-full flex" 
                        style={{ top: i * 120, height: 120 }}
                      >
                          <div className="w-16 flex-shrink-0 text-right pr-4 text-xs font-medium text-gray-400 relative -top-2">
                             {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i-12} PM`}
                          </div>
                          <div className="flex-1 border-t border-gray-100/80"></div>
                      </div>
                  ))}

                  {/* Events */}
                  <div className="absolute top-0 left-16 right-4 bottom-0">
                      {timeEvents.map(evt => {
                          const { top, height, width, left } = getEventPosition(evt);
                          const { style, className } = getEventBackground(evt);

                          return (
                              <div
                                  key={evt.id}
                                  className={`absolute rounded-lg p-3 shadow-sm transition-all hover:z-20 hover:scale-[1.01] overflow-hidden ${className}`}
                                  style={{
                                      top: `${top}px`,
                                      height: `${height}px`,
                                      width: width,
                                      left: left,
                                      ...style
                                  }}
                              >
                                  <div className="flex flex-col h-full relative z-10">
                                      <div className="text-sm font-bold leading-tight mb-1">{evt.title}</div>
                                      <div className="text-[10px] opacity-80 font-medium">
                                          {evt.start.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})} - 
                                          {evt.end.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'})}
                                      </div>
                                      {evt.location && <div className="text-[10px] opacity-70 mt-1">{evt.location}</div>}

                                      <div className="absolute bottom-1 right-1 flex -space-x-1">
                                          {(evt.userIds || [evt.userId]).map((uid, idx) => {
                                              if(!uid) return null;
                                              const u = users.find(usr => usr.id === uid);
                                              if(!u) return null;
                                              return (
                                                  <div key={idx} className="w-5 h-5 rounded-full bg-white/80 backdrop-blur-sm border border-white/40 flex items-center justify-center text-[9px] font-bold text-gray-700 shadow-sm">
                                                      {u.name.charAt(0)}
                                                  </div>
                                              )
                                          })}
                                      </div>
                                  </div>
                              </div>
                          );
                      })}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};