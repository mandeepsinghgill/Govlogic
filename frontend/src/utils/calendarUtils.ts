/**
 * Calendar utilities for adding events to various calendar platforms
 * Supports: iOS, macOS, Android, Google Calendar, Outlook
 */

export interface CalendarEvent {
  title: string;
  description: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  url?: string;
}

/**
 * Add event to calendar - detects platform and uses appropriate method
 */
export const addToCalendar = (event: CalendarEvent) => {
  const platform = detectPlatform();
  
  switch (platform) {
    case 'ios':
    case 'macos':
      return addToAppleCalendar(event);
    case 'android':
      return addToAndroidCalendar(event);
    default:
      return addToGoogleCalendar(event);
  }
};

/**
 * Detect user's platform
 */
const detectPlatform = (): 'ios' | 'android' | 'macos' | 'windows' | 'other' => {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  } else if (/android/.test(userAgent)) {
    return 'android';
  } else if (/macintosh|mac os x/.test(userAgent)) {
    return 'macos';
  } else if (/windows/.test(userAgent)) {
    return 'windows';
  }
  
  return 'other';
};

/**
 * Add to Apple Calendar (iOS/macOS)
 * Creates an ICS file that opens in Calendar app
 */
const addToAppleCalendar = (event: CalendarEvent) => {
  const icsContent = generateICSFile(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${event.title.replace(/[^a-z0-9]/gi, '_')}.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Add to Android Calendar
 * Uses Android intent URL
 */
const addToAndroidCalendar = (event: CalendarEvent) => {
  const startTime = event.startDate.getTime();
  const endTime = event.endDate ? event.endDate.getTime() : startTime + (60 * 60 * 1000); // Default 1 hour
  
  const url = `content://com.android.calendar/time/${startTime}?` +
    `title=${encodeURIComponent(event.title)}` +
    `&description=${encodeURIComponent(event.description)}` +
    `&beginTime=${startTime}` +
    `&endTime=${endTime}`;
  
  window.location.href = url;
};

/**
 * Add to Google Calendar
 * Opens Google Calendar in browser
 */
const addToGoogleCalendar = (event: CalendarEvent) => {
  const startDate = formatGoogleDate(event.startDate);
  const endDate = event.endDate ? formatGoogleDate(event.endDate) : formatGoogleDate(new Date(event.startDate.getTime() + 60 * 60 * 1000));
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    details: event.description,
    dates: `${startDate}/${endDate}`,
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  if (event.url) {
    params.append('url', event.url);
  }
  
  window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
};

/**
 * Add to Outlook Calendar
 * Opens Outlook in browser
 */
export const addToOutlookCalendar = (event: CalendarEvent) => {
  const startDate = event.startDate.toISOString();
  const endDate = event.endDate ? event.endDate.toISOString() : new Date(event.startDate.getTime() + 60 * 60 * 1000).toISOString();
  
  const params = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    body: event.description,
    startdt: startDate,
    enddt: endDate,
  });
  
  if (event.location) {
    params.append('location', event.location);
  }
  
  window.open(`https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`, '_blank');
};

/**
 * Generate ICS file content (for Apple Calendar and others)
 */
const generateICSFile = (event: CalendarEvent): string => {
  const startDate = formatICSDate(event.startDate);
  const endDate = event.endDate ? formatICSDate(event.endDate) : formatICSDate(new Date(event.startDate.getTime() + 60 * 60 * 1000));
  
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GovSureAI//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${Date.now()}@govsureai.com`,
    `DTSTAMP:${formatICSDate(new Date())}`,
    `DTSTART:${startDate}`,
    `DTEND:${endDate}`,
    `SUMMARY:${event.title}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    event.location ? `LOCATION:${event.location}` : '',
    event.url ? `URL:${event.url}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');
};

/**
 * Format date for ICS file
 */
const formatICSDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Format date for Google Calendar
 */
const formatGoogleDate = (date: Date): string => {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

/**
 * Get calendar priority color based on due date and priority
 */
export const getCalendarColor = (dueDate: Date | string | undefined | null, priority: string | number = 'medium'): string => {
  if (!dueDate) {
    return 'gray';
  }
  
  // Convert to Date if string
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  // Check if valid date
  if (isNaN(dateObj.getTime())) {
    return 'gray';
  }
  
  const now = new Date();
  const daysUntilDue = Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  // Convert priority to string if number
  const priorityStr = typeof priority === 'number' ? 
    (priority >= 75 ? 'high' : priority >= 50 ? 'medium' : 'low') : 
    priority;
  
  // Critical priority or less than 7 days
  if (priorityStr === 'critical' || daysUntilDue < 7) {
    return 'red';
  }
  
  // High priority or less than 30 days
  if (priorityStr === 'high' || daysUntilDue < 30) {
    return 'orange';
  }
  
  // Medium priority or less than 60 days
  if (priorityStr === 'medium' || daysUntilDue < 60) {
    return 'yellow';
  }
  
  // Low priority or more than 60 days
  return 'gray';
};

/**
 * Get days until due
 */
export const getDaysUntilDue = (dueDate: Date | string | undefined | null): number => {
  if (!dueDate) {
    return 999;
  }
  
  const dateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  if (isNaN(dateObj.getTime())) {
    return 999;
  }
  
  const now = new Date();
  return Math.ceil((dateObj.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Format days until due as human-readable string
 */
export const formatDaysUntilDue = (daysUntilDue: number): string => {
  if (daysUntilDue < 0) {
    return `Overdue by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) !== 1 ? 's' : ''}`;
  } else if (daysUntilDue === 0) {
    return 'Due today';
  } else if (daysUntilDue === 1) {
    return 'Due in 1 day';
  } else if (daysUntilDue < 7) {
    return `Due in ${daysUntilDue} days`;
  } else if (daysUntilDue < 30) {
    const weeks = Math.floor(daysUntilDue / 7);
    return `Due in ${weeks} week${weeks !== 1 ? 's' : ''}`;
  } else {
    const months = Math.floor(daysUntilDue / 30);
    return `Due in ${months} month${months !== 1 ? 's' : ''}`;
  }
};

