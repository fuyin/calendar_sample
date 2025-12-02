import { CalendarEvent, User } from './types';

export const USERS: User[] = [
  { id: 'u1', name: 'A', color: 'yellow', totalTasks: 3, completedTasks: 0 },
  { id: 'u2', name: 'A1', color: 'calBlue', totalTasks: 4, completedTasks: 0 },
  { id: 'u3', name: 'Test', color: 'mint', totalTasks: 3, completedTasks: 0 },
  { id: 'u4', name: 'Test1', color: 'calBlue', totalTasks: 1, completedTasks: 0 },
  { id: 'u5', name: 'Test2', color: 'pink', totalTasks: 2, completedTasks: 0 },
  { id: 'u6', name: 'Test3', color: 'yellow', totalTasks: 1, completedTasks: 0 },
];

// Helper to create dates relative to "Dec 2025" for the mockup
// Dec 2, 2025 is Tuesday.
const createDate = (day: number, hour: number = 0, minute: number = 0) => {
  return new Date(2025, 11, day, hour, minute);
};

export const MOCK_EVENTS: CalendarEvent[] = [
  // Mon 1 Events (Matching screenshot)
  // Jj updated to 2PM (14:00) as per request, not all-day
  { id: '1', title: 'Jj', start: createDate(1, 14, 0), end: createDate(1, 15, 0), userId: 'u3', location: 'For Dinner' }, // Green (Mint)
  
  { id: '2', title: 'Hh', start: createDate(1, 15, 45), end: createDate(1, 16, 45), userId: 'u2' }, // Blue
  
  // Joint Event "Hn" - Striped (Blue/Pink/Yellow)
  { 
    id: '3', 
    title: 'Hn', 
    start: createDate(1, 15, 45), 
    end: createDate(1, 16, 45), 
    userIds: ['u2', 'u5', 'u1', 'u6'] // Blue, Pink, Yellow, Yellow (Simulating the multi-stripe)
  },

  { id: '4', title: 'Yh', start: createDate(1, 15, 45), end: createDate(1, 16, 45), userId: 'u1' }, // Yellow

  // Holidays
  { id: 'h1', title: 'Christmas', start: createDate(25), end: createDate(25), userId: 'u3', isHoliday: true, isAllDay: true },
  { id: 'h2', title: 'New Year', start: new Date(2026, 0, 1), end: new Date(2026, 0, 1), userId: 'u3', isHoliday: true, isAllDay: true },
];

export const COLORS = {
  mint: { bg: 'bg-mint', text: 'text-mintDark', border: 'border-mintDark' },
  calBlue: { bg: 'bg-calBlue', text: 'text-calBlueDark', border: 'border-calBlueDark' },
  pink: { bg: 'bg-pink', text: 'text-pinkDark', border: 'border-pinkDark' },
  yellow: { bg: 'bg-yellow', text: 'text-yellowDark', border: 'border-yellowDark' },
};

// Hex values for CSS gradients
export const COLOR_HEX = {
  mint: '#B2DFDB',
  mintDark: '#00695C',
  calBlue: '#B3CDE0',
  calBlueDark: '#01579B',
  pink: '#F4B6C2',
  pinkDark: '#880E4F',
  yellow: '#F3E5AB',
  yellowDark: '#F57F17',
};