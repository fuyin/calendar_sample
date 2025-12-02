import React, { useState } from 'react';
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
  const [currentView, setCurrentView] = useState<ViewMode>('Schedule');
  const [activeUserIds, setActiveUserIds] = useState<string[]>(USERS.map(u => u.id));
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  
  // Static date for demo fidelity: Dec 2, 2025
  const currentDate = new Date(2025, 11, 2); 

  const toggleUserFilter = (id: string) => {
    if (activeUserIds.includes(id)) {
      setActiveUserIds(activeUserIds.filter(uid => uid !== id));
    } else {
      setActiveUserIds([...activeUserIds, id]);
    }
  };

  const filteredEvents = MOCK_EVENTS.filter(e => {
    // If event has multiple users, check if ANY of them are active
    if (e.userIds && e.userIds.length > 0) {
      return e.userIds.some(uid => activeUserIds.includes(uid));
    }
    // Fallback to single userId
    return e.userId && activeUserIds.includes(e.userId);
  });

  const renderView = () => {
    switch (currentView) {
      case 'Month':
        return <MonthView currentDate={currentDate} events={filteredEvents} users={USERS} />;
      case 'Schedule':
        return <ScheduleView events={filteredEvents} users={USERS} />;
      case 'Day':
        return <DayView events={filteredEvents} users={USERS} />;
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
          users={USERS}
          activeUserIds={activeUserIds}
          toggleUserFilter={toggleUserFilter}
          currentView={currentView}
          onViewChange={setCurrentView}
          isViewMenuOpen={isViewMenuOpen}
          setIsViewMenuOpen={setIsViewMenuOpen}
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