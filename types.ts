export type ViewMode = 'Month' | 'Week' | 'Day' | 'Schedule';

export interface User {
  id: string;
  name: string;
  color: 'mint' | 'calBlue' | 'pink' | 'yellow';
  avatar?: string;
  totalTasks: number;
  completedTasks: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  userId?: string; // Primary user or single user
  userIds?: string[]; // Multiple users for joint events
  isAllDay?: boolean;
  isHoliday?: boolean;
  location?: string;
  isStriped?: boolean; // Deprecated, inferred from userIds length
}

export interface DayColumn {
  date: Date;
  isToday: boolean;
  events: CalendarEvent[];
}