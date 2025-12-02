import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { MonthView } from './components/views/MonthView';
import { ScheduleView } from './components/views/ScheduleView';
import { DayView } from './components/views/DayView';
import { WeekView } from './components/views/WeekView';
import { USERS, MOCK_EVENTS } from './constants';
import { ViewMode } from './types';
import { Plus } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewMode>('Day');
  const [activeUserIds, setActiveUserIds] = useState<string[]>(USERS.map(u => u.id));
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  // Dynamic Date State (Initialized to Dec 2, 2025 for demo purposes)
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 2)); 

  const toggleUserFilter = (id: string) => {
    if (activeUserIds.includes(id)) {
      setActiveUserIds(activeUserIds.filter(uid => uid !== id));
    } else {
      setActiveUserIds([...activeUserIds, id]);
    }
  };

  // Filter events for display based on active user toggle
  const filteredEvents = MOCK_EVENTS.filter(e => {
    // If event has multiple users, check if ANY of them are active
    if (e.userIds && e.userIds.length > 0) {
      return e.userIds.some(uid => activeUserIds.includes(uid));
    }
    // Fallback to single userId
    return e.userId && activeUserIds.includes(e.userId);
  });

  // Calculate stats per user based on current view range
  const usersWithDynamicStats = useMemo(() => {
    // 1. Determine Date Range
    let start = new Date(currentDate);
    let end = new Date(currentDate);

    if (currentView === 'Day' || currentView === 'Schedule') {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    } else if (currentView === 'Week') {
      const day = start.getDay(); // 0 is Sunday
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(start);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (currentView === 'Month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      
      end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    }

    // 2. Count events for each user within range
    return USERS.map(user => {
      const userEventsInRange = MOCK_EVENTS.filter(e => {
        // Check date overlap
        if (e.start > end || e.end < start) return false;
        
        // Check user ownership
        const isOwner = e.userId === user.id || (e.userIds && e.userIds.includes(user.id));
        return isOwner;
      });

      return {
        ...user,
        totalTasks: userEventsInRange.length,
        // Assuming completedTasks is 0 for now as it's not in the event model, 
        // or could calculate based on past events if desired.
        completedTasks: 0 
      };
    });
  }, [currentDate, currentView]);

  const handleNavigate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate);

    if (direction === 'today') {
      // Reset to "Demo Today" (Dec 2, 2025) or real today. Using Demo Today for data context.
      setCurrentDate(new Date(2025, 11, 2));
      return;
    }

    const offset = direction === 'next' ? 1 : -1;

    switch (currentView) {
      case 'Day':
      case 'Schedule':
        newDate.setDate(currentDate.getDate() + offset);
        break;
      case 'Week':
        newDate.setDate(currentDate.getDate() + (offset * 7));
        break;
      case 'Month':
        newDate.setMonth(currentDate.getMonth() + offset);
        break;
    }
    setCurrentDate(newDate);
  };

  const renderView = () => {
    switch (currentView) {
      case 'Month':
        return <MonthView currentDate={currentDate} events={filteredEvents} users={USERS} />;
      case 'Schedule':
        return <ScheduleView currentDate={currentDate} events={filteredEvents} users={USERS} />;
      case 'Day':
        return <DayView currentDate={currentDate} onDateChange={setCurrentDate} events={filteredEvents} users={USERS} />;
      case 'Week':
        return <WeekView currentDate={currentDate} events={filteredEvents} users={USERS} />;
      default:
        return <MonthView currentDate={currentDate} events={filteredEvents} users={USERS} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-grayPaper relative font-sans text-gray-800"
         onClick={() => isViewMenuOpen && setIsViewMenuOpen(false)}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <TopBar 
          currentDate={currentDate}
          users={usersWithDynamicStats} // Pass the dynamic users list
          activeUserIds={activeUserIds}
          toggleUserFilter={toggleUserFilter}
          currentView={currentView}
          onViewChange={setCurrentView}
          isViewMenuOpen={isViewMenuOpen}
          setIsViewMenuOpen={setIsViewMenuOpen}
          onNavigate={handleNavigate}
        />

        <div className="flex-1 p-2 pr-4 pb-4 overflow-hidden relative z-0">
          {renderView()}
        </div>
      </div>

      {/* Floating Action Button (FAB) */}
      <button className="absolute bottom-8 right-8 w-14 h-14 bg-[#3B5998] hover:bg-[#2d4373] text-white rounded-full shadow-xl flex items-center justify-center transition-transform hover:scale-110 active:scale-95 z-30">
        <Plus size={28} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default App;