// src/app/admin/hooks/useAvailability/deviceUtils.ts
// Device-specific configurations and message builders for availability management

import { 
  DeviceType, 
  DeviceConfigMap, 
  NotificationDurationMap,
  AvailabilityAction 
} from './types';

// Device-specific configuration for loading schedule
export const LOAD_CONFIG: DeviceConfigMap = {
  mobile: { maxRetries: 2, timeout: 8000, simplifyData: true },
  tablet: { maxRetries: 3, timeout: 6000, simplifyData: false },
  desktop: { maxRetries: 3, timeout: 5000, simplifyData: false }
};

// Device-specific configuration for saving schedule
export const SAVE_CONFIG: DeviceConfigMap = {
  mobile: { maxRetries: 2, timeout: 10000, simplifyData: false },
  tablet: { maxRetries: 3, timeout: 8000, simplifyData: false },
  desktop: { maxRetries: 3, timeout: 6000, simplifyData: false }
};

// Device-specific configuration for blackout operations
export const BLACKOUT_CONFIG: DeviceConfigMap = {
  mobile: { maxRetries: 2, timeout: 8000, simplifyData: false },
  tablet: { maxRetries: 3, timeout: 6000, simplifyData: false },
  desktop: { maxRetries: 3, timeout: 5000, simplifyData: false }
};

// Notification display durations by device
export const NOTIFICATION_DURATIONS: NotificationDurationMap = {
  mobile: { success: 2500, error: 4000 },
  tablet: { success: 3000, error: 5000 },
  desktop: { success: 3000, error: 5000 }
};

/**
 * Get device-specific configuration for an action
 */
export const getDeviceConfig = (
  deviceType: DeviceType,
  action: AvailabilityAction
): { maxRetries: number; timeout: number; simplifyData: boolean } => {
  switch (action) {
    case 'load':
      return LOAD_CONFIG[deviceType];
    case 'save':
      return SAVE_CONFIG[deviceType];
    case 'delete':
    case 'add':
      return BLACKOUT_CONFIG[deviceType];
    default:
      return LOAD_CONFIG[deviceType];
  }
};

/**
 * Get device-specific success message
 */
export const getSuccessMessage = (
  deviceType: DeviceType,
  action: AvailabilityAction
): string => {
  const messages = {
    load: {
      mobile: 'Loaded',
      tablet: 'Schedule loaded',
      desktop: 'Schedule loaded successfully'
    },
    save: {
      mobile: 'Saved!',
      tablet: 'Schedule saved successfully!',
      desktop: 'Schedule saved successfully!'
    },
    add: {
      mobile: 'Added',
      tablet: 'Blackout date added',
      desktop: 'Blackout date added successfully'
    },
    delete: {
      mobile: 'Removed',
      tablet: 'Blackout date removed',
      desktop: 'Blackout date removed successfully'
    }
  };

  return messages[action][deviceType];
};

/**
 * Get device-specific error message
 */
export const getErrorMessage = (
  deviceType: DeviceType,
  action: AvailabilityAction,
  specificError?: string
): string => {
  const messages = {
    load: {
      mobile: 'Load failed. Try again.',
      tablet: 'Failed to load schedule. Please try again.',
      desktop: specificError 
        ? `Failed to load schedule: ${specificError}` 
        : 'Failed to load schedule. Please try again.'
    },
    save: {
      mobile: 'Save failed. Try again.',
      tablet: specificError 
        ? `Failed to save schedule: ${specificError}`
        : 'Failed to save schedule. Please try again.',
      desktop: specificError 
        ? `Failed to save schedule: ${specificError}` 
        : 'Failed to save schedule. Please try again.'
    },
    add: {
      mobile: 'Add failed.',
      tablet: 'Failed to add blackout date. Please try again.',
      desktop: specificError 
        ? `Failed to add blackout date: ${specificError}` 
        : 'Failed to add blackout date. Please try again.'
    },
    delete: {
      mobile: 'Delete failed.',
      tablet: 'Failed to remove blackout date. Please try again.',
      desktop: specificError 
        ? `Failed to remove blackout date: ${specificError}` 
        : 'Failed to remove blackout date. Please try again.'
    }
  };

  return messages[action][deviceType];
};

/**
 * Get validation error message
 */
export const getValidationErrorMessage = (deviceType: DeviceType): string => {
  const messages = {
    mobile: 'Check your schedule times.',
    tablet: 'Please check your schedule settings.',
    desktop: 'Please review your schedule settings and try again.'
  };

  return messages[deviceType];
};

/**
 * Get network error message
 */
export const getNetworkErrorMessage = (deviceType: DeviceType): string => {
  const messages = {
    mobile: 'Connection error.',
    tablet: 'Network error. Please check your connection.',
    desktop: 'Network error. Please check your connection and try again.'
  };

  return messages[deviceType];
};

/**
 * Get app error message (for unexpected errors)
 */
export const getAppErrorMessage = (deviceType: DeviceType): string => {
  const messages = {
    mobile: 'App error. Restart needed.',
    tablet: 'An error occurred. Please try again.',
    desktop: 'An unexpected error occurred. Please try again.'
  };

  return messages[deviceType];
};

/**
 * Get notification duration for device and type
 */
export const getNotificationDuration = (
  deviceType: DeviceType,
  type: 'success' | 'error'
): number => {
  return NOTIFICATION_DURATIONS[deviceType][type];
};