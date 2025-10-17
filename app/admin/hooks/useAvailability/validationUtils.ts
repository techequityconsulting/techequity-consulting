// src/app/admin/hooks/useAvailability/validationUtils.ts
// Validation utilities for availability schedules

import { WeeklySchedule, DeviceType } from './types';

/**
 * Convert time string (HH:MM) to minutes since midnight
 */
export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes since midnight to time string (HH:MM)
 */
export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Check if a time string is valid (HH:MM format)
 */
export const isValidTimeFormat = (timeStr: string): boolean => {
  if (!timeStr) return false;
  
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
};

/**
 * Validate that end time is after start time
 */
export const isValidTimeRange = (start: string, end: string): boolean => {
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) {
    return false;
  }
  
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  return endMinutes > startMinutes;
};

/**
 * Check if the weekly schedule has at least one enabled day
 */
export const isValidSchedule = (weeklySchedule: WeeklySchedule): boolean => {
  const days = Object.values(weeklySchedule);
  return days.some(day => day.enabled);
};

/**
 * Validate a specific day's schedule
 */
export const isValidDaySchedule = (
  enabled: boolean,
  start: string,
  end: string
): boolean => {
  if (!enabled) return true; // Disabled days don't need valid times
  
  return isValidTimeFormat(start) && 
         isValidTimeFormat(end) && 
         isValidTimeRange(start, end);
};

/**
 * Validate entire weekly schedule structure
 */
export const validateWeeklySchedule = (weeklySchedule: WeeklySchedule): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  // Check if at least one day is enabled
  if (!isValidSchedule(weeklySchedule)) {
    errors.push('At least one day must be enabled');
  }
  
  // Validate each day
  const days: (keyof WeeklySchedule)[] = [
    'monday', 'tuesday', 'wednesday', 'thursday', 
    'friday', 'saturday', 'sunday'
  ];
  
  days.forEach(day => {
    const schedule = weeklySchedule[day];
    
    if (schedule.enabled) {
      if (!isValidTimeFormat(schedule.start)) {
        errors.push(`${day}: Invalid start time format`);
      }
      
      if (!isValidTimeFormat(schedule.end)) {
        errors.push(`${day}: Invalid end time format`);
      }
      
      if (isValidTimeFormat(schedule.start) && isValidTimeFormat(schedule.end)) {
        if (!isValidTimeRange(schedule.start, schedule.end)) {
          errors.push(`${day}: End time must be after start time`);
        }
      }
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate blackout date format (YYYY-MM-DD)
 */
export const isValidBlackoutDate = (dateStr: string): boolean => {
  if (!dateStr) return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) return false;
  
  // Check if it's a valid date
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
};

/**
 * Check if blackout date is in the future
 */
export const isBlackoutDateInFuture = (dateStr: string): boolean => {
  if (!isValidBlackoutDate(dateStr)) return false;
  
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return date >= today;
};

/**
 * Process time input based on device type
 * Returns normalized time string or null if invalid
 */
export const processTimeInput = (
  value: string,
  deviceType: DeviceType
): string | null => {
  if (!value) return null;
  
  if (deviceType === 'mobile') {
    // Mobile: Strict HH:MM format required
    if (!value.match(/^\d{2}:\d{2}$/)) {
      return null;
    }
  } else if (deviceType === 'tablet') {
    // Tablet: Allow H:MM and normalize to HH:MM
    if (!value.match(/^\d{1,2}:\d{2}$/)) {
      return null;
    }
    // Pad single digit hours
    if (value.match(/^\d:\d{2}$/)) {
      return '0' + value;
    }
  }
  // Desktop: Accept various formats and normalize
  
  return value;
};

/**
 * Check if a time falls within a range
 */
export const isTimeInRange = (
  time: string,
  rangeStart: string,
  rangeEnd: string
): boolean => {
  if (!isValidTimeFormat(time) || !isValidTimeFormat(rangeStart) || !isValidTimeFormat(rangeEnd)) {
    return false;
  }
  
  const timeMinutes = timeToMinutes(time);
  const startMinutes = timeToMinutes(rangeStart);
  const endMinutes = timeToMinutes(rangeEnd);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
};

/**
 * Calculate duration between two times in minutes
 */
export const calculateDuration = (start: string, end: string): number => {
  if (!isValidTimeFormat(start) || !isValidTimeFormat(end)) {
    return 0;
  }
  
  const startMinutes = timeToMinutes(start);
  const endMinutes = timeToMinutes(end);
  
  return Math.max(0, endMinutes - startMinutes);
};

/**
 * Format duration in minutes to readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
};