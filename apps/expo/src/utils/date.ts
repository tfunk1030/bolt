import { format, formatDistance, formatRelative, isValid } from 'date-fns';

export function formatDate(date: Date | number | string, pattern = 'PPpp'): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  return format(dateObj, pattern);
}

export function formatRelativeTime(date: Date | number | string): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

export function formatRelativeToNow(date: Date | number | string): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Date';
  }
  return formatRelative(dateObj, new Date());
}

export function isToday(date: Date | number | string): boolean {
  const dateObj = new Date(date);
  const today = new Date();
  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
}

export function getTimeFromDate(date: Date | number | string): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Time';
  }
  return format(dateObj, 'HH:mm');
}

export function getDayFromDate(date: Date | number | string): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Day';
  }
  return format(dateObj, 'EEEE');
}

export function getShortDayFromDate(date: Date | number | string): string {
  const dateObj = new Date(date);
  if (!isValid(dateObj)) {
    return 'Invalid Day';
  }
  return format(dateObj, 'EEE');
}
