// src/app/admin/hooks/useAvailability/index.ts
// Main availability hook - orchestrates all availability functionality

import { useState, useCallback } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { 
  WeeklySchedule, 
  BlackoutDate, 
  Notification,
  UseAvailabilityReturn 
} from './types';
import {
  loadWeeklyScheduleApi,
  saveWeeklyScheduleApi,
  loadBlackoutDatesApi,
  addBlackoutDateApi,
  removeBlackoutDateApi
} from './apiUtils';
import { isValidSchedule } from './validationUtils';
import { processTimeInput } from './validationUtils';

export const useAvailability = (
  setNotification: (notification: Notification | null) => void
): UseAvailabilityReturn => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  // State
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: { enabled: false, start: '09:00', end: '17:00' },
    tuesday: { enabled: false, start: '09:00', end: '17:00' },
    wednesday: { enabled: false, start: '09:00', end: '17:00' },
    thursday: { enabled: false, start: '09:00', end: '17:00' },
    friday: { enabled: false, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '17:00' },
    sunday: { enabled: false, start: '09:00', end: '17:00' }
  });

  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load weekly schedule
  const loadWeeklySchedule = useCallback(async () => {
    await loadWeeklyScheduleApi({
      deviceType,
      isTouchDevice,
      setIsLoading,
      setWeeklySchedule,
      setNotification
    });
  }, [deviceType, isTouchDevice, setNotification]);

  // Save weekly schedule
  const saveWeeklySchedule = useCallback(async () => {
    await saveWeeklyScheduleApi({
      weeklySchedule,
      deviceType,
      setIsLoading,
      setNotification
    });
  }, [weeklySchedule, deviceType, setNotification]);

  // Update a specific day's schedule
  const updateDaySchedule = useCallback((
    day: keyof WeeklySchedule,
    field: string,
    value: string | boolean
  ) => {
    if (field === 'enabled') {
      // Handle toggle
      if (deviceType === 'mobile' && isTouchDevice) {
        console.log(`Touch toggle for ${day}: ${value}`);
      }
      
      setWeeklySchedule(prev => ({
        ...prev,
        [day]: { ...prev[day], [field]: value }
      }));
    } else if (field === 'start' || field === 'end') {
      // Handle time input
      const processedValue = processTimeInput(value as string, deviceType);
      
      if (processedValue === null) {
        return; // Invalid format for device type
      }
      
      setWeeklySchedule(prev => {
        const currentDay = prev[day];
        const updatedDay = { ...currentDay, [field]: processedValue };
        
        // Additional validation: ensure start < end
        if (field === 'start' && updatedDay.end) {
          const startMinutes = parseInt(processedValue.split(':')[0]) * 60 + parseInt(processedValue.split(':')[1]);
          const endMinutes = parseInt(updatedDay.end.split(':')[0]) * 60 + parseInt(updatedDay.end.split(':')[1]);
          
          if (startMinutes >= endMinutes) {
            console.warn(`Start time (${processedValue}) must be before end time (${updatedDay.end})`);
            return prev; // Don't update if invalid
          }
        }
        
        if (field === 'end' && updatedDay.start) {
          const startMinutes = parseInt(updatedDay.start.split(':')[0]) * 60 + parseInt(updatedDay.start.split(':')[1]);
          const endMinutes = parseInt(processedValue.split(':')[0]) * 60 + parseInt(processedValue.split(':')[1]);
          
          if (endMinutes <= startMinutes) {
            console.warn(`End time (${processedValue}) must be after start time (${updatedDay.start})`);
            return prev; // Don't update if invalid
          }
        }
        
        return {
          ...prev,
          [day]: updatedDay
        };
      });
    }
  }, [deviceType, isTouchDevice]);

  // Load blackout dates
  const loadBlackoutDates = useCallback(async () => {
    await loadBlackoutDatesApi({
      deviceType,
      isTouchDevice,
      setIsLoading,
      setBlackoutDates,
      setNotification
    });
  }, [deviceType, isTouchDevice, setNotification]);

  // Add blackout date
  const addBlackoutDate = useCallback(async (date: string, reason: string) => {
    await addBlackoutDateApi({
      date,
      reason,
      deviceType,
      setIsLoading,
      setBlackoutDates,
      setNotification
    });
  }, [deviceType, setNotification]);

  // Remove blackout date
  const removeBlackoutDate = useCallback(async (id: number) => {
    await removeBlackoutDateApi({
      id,
      deviceType,
      setIsLoading,
      setBlackoutDates,
      setNotification
    });
  }, [deviceType, setNotification]);

  // Validation helper
  const isValidScheduleCheck = useCallback((): boolean => {
    return isValidSchedule(weeklySchedule);
  }, [weeklySchedule]);

  return {
    // State
    weeklySchedule,
    blackoutDates,
    isLoading,

    // Schedule actions
    loadWeeklySchedule,
    saveWeeklySchedule,
    updateDaySchedule,

    // Blackout actions
    loadBlackoutDates,
    addBlackoutDate,
    removeBlackoutDate,

    // Utility
    isValidSchedule: isValidScheduleCheck
  };
};

// Re-export types for convenience
export type { UseAvailabilityReturn } from './types';