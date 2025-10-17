// src/app/admin/hooks/useAvailability/types.ts
// TypeScript types and interfaces for availability management

import { WeeklySchedule, BlackoutDate, Notification } from '../../types';

// Device type definition
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

// Device-specific configuration for API operations
export interface AvailabilityConfig {
  maxRetries: number;
  timeout: number;
  simplifyData: boolean;
}

// Complete device configuration mapping
export interface DeviceConfigMap {
  mobile: AvailabilityConfig;
  tablet: AvailabilityConfig;
  desktop: AvailabilityConfig;
}

// API operation types
export type AvailabilityAction = 'load' | 'save' | 'delete' | 'add';

// Notification duration configuration
export interface NotificationDurations {
  success: number;
  error: number;
}

// Complete notification duration mapping
export interface NotificationDurationMap {
  mobile: NotificationDurations;
  tablet: NotificationDurations;
  desktop: NotificationDurations;
}

// Parameters for loading weekly schedule
export interface LoadScheduleParams {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setWeeklySchedule: (schedule: WeeklySchedule) => void;
  setNotification: (notification: Notification | null) => void;
}

// Parameters for saving weekly schedule
export interface SaveScheduleParams {
  weeklySchedule: WeeklySchedule;
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
}

// Parameters for loading blackout dates
export interface LoadBlackoutsParams {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setBlackoutDates: (dates: BlackoutDate[]) => void;
  setNotification: (notification: Notification | null) => void;
}

// Parameters for adding blackout date
export interface AddBlackoutParams {
  date: string;
  reason: string;
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setBlackoutDates: (updater: (prev: BlackoutDate[]) => BlackoutDate[]) => void;
  setNotification: (notification: Notification | null) => void;
}

// Parameters for removing blackout date
export interface RemoveBlackoutParams {
  id: number;
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setBlackoutDates: (updater: (prev: BlackoutDate[]) => BlackoutDate[]) => void;
  setNotification: (notification: Notification | null) => void;
}

// Return type for useAvailability hook
export interface UseAvailabilityReturn {
  // State
  weeklySchedule: WeeklySchedule;
  blackoutDates: BlackoutDate[];
  isLoading: boolean;

  // Schedule actions
  loadWeeklySchedule: () => Promise<void>;
  saveWeeklySchedule: () => Promise<void>;
  updateDaySchedule: (day: keyof WeeklySchedule, field: string, value: string | boolean) => void;

  // Blackout actions
  loadBlackoutDates: () => Promise<void>;
  addBlackoutDate: (date: string, reason: string) => Promise<void>;
  removeBlackoutDate: (id: number) => Promise<void>;

  // Utility
  isValidSchedule: () => boolean;
}

// Re-export types from parent for convenience
export type { WeeklySchedule, BlackoutDate, Notification } from '../../types';