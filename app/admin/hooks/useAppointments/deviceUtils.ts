// src/app/admin/hooks/useAppointments/deviceUtils.ts
// Device-specific configurations and utilities for appointments
// FIXED: Reduced delete timeout from 6-10 seconds to 3-5 seconds

import { DeviceType } from '@/hooks/useDeviceDetection';
import {
  DeviceLoadConfig,
  DeviceDeleteConfig,
  DeviceSaveConfig,
  DeviceRetryConfig,
  DeviceNotificationDuration
} from './types';

// ============================================================================
// LOAD CONFIGURATIONS
// ============================================================================

export const getLoadConfig = (deviceType: DeviceType): DeviceLoadConfig => {
  const configs: Record<DeviceType, DeviceLoadConfig> = {
    mobile: { maxRetries: 2, timeout: 8000, batchSize: 20 },
    tablet: { maxRetries: 3, timeout: 6000, batchSize: 50 },
    desktop: { maxRetries: 3, timeout: 5000, batchSize: 100 }
  };
  
  return configs[deviceType];
};

// ============================================================================
// DELETE CONFIGURATIONS
// ============================================================================

export const getDeleteConfig = (deviceType: DeviceType): DeviceDeleteConfig => {
  // FIXED: Reduced timeouts to eliminate lag
  // Old: mobile: 10000, tablet: 8000, desktop: 6000
  // New: mobile: 5000, tablet: 4000, desktop: 3000
  const configs: Record<DeviceType, DeviceDeleteConfig> = {
    mobile: { timeout: 5000, showProgress: true },
    tablet: { timeout: 4000, showProgress: false },
    desktop: { timeout: 3000, showProgress: false }
  };
  
  return configs[deviceType];
};

// ============================================================================
// SAVE CONFIGURATIONS
// ============================================================================

export const getSaveConfig = (deviceType: DeviceType): DeviceSaveConfig => {
  const configs: Record<DeviceType, DeviceSaveConfig> = {
    mobile: { timeout: 12000, showProgress: true, validateOnSave: true },
    tablet: { timeout: 10000, showProgress: false, validateOnSave: true },
    desktop: { timeout: 8000, showProgress: false, validateOnSave: false }
  };
  
  return configs[deviceType];
};

// ============================================================================
// RETRY DELAYS
// ============================================================================

export const getRetryDelays = (): DeviceRetryConfig => ({
  mobile: 2000,
  tablet: 1500,
  desktop: 1000
});

// ============================================================================
// NOTIFICATION DURATIONS
// ============================================================================

export const getSuccessNotificationDuration = (deviceType: DeviceType): number => {
  const durations: DeviceNotificationDuration = {
    mobile: 2500,
    tablet: 3000,
    desktop: 3000
  };
  
  return durations[deviceType];
};

export const getErrorNotificationDuration = (deviceType: DeviceType): number => {
  const durations: DeviceNotificationDuration = {
    mobile: 4000,
    tablet: 5000,
    desktop: 5000
  };
  
  return durations[deviceType];
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const getLoadErrorMessage = (deviceType: DeviceType, specificError?: string): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Failed to load appointments.',
    tablet: 'Unable to load appointments. Please try again.',
    desktop: specificError 
      ? `Failed to load appointments: ${specificError}` 
      : 'Failed to load appointments. Please check your connection and try again.'
  };
  
  return messages[deviceType];
};

export const getDeleteErrorMessage = (deviceType: DeviceType, specificError?: string): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Delete failed.',
    tablet: 'Failed to delete appointment.',
    desktop: specificError 
      ? `Failed to delete appointment: ${specificError}` 
      : 'Failed to delete appointment. Please try again.'
  };
  
  return messages[deviceType];
};

export const getSaveErrorMessage = (deviceType: DeviceType, specificError?: string): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Save failed.',
    tablet: 'Failed to save appointment.',
    desktop: specificError 
      ? `Failed to save appointment: ${specificError}` 
      : 'Failed to save appointment. Please try again.'
  };
  
  return messages[deviceType];
};

export const getStatusUpdateErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Status update failed.',
    tablet: 'Failed to update appointment status.',
    desktop: 'Failed to update appointment status. Please try again.'
  };
  
  return messages[deviceType];
};

export const getBulkDeleteErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Bulk delete failed.',
    tablet: 'Failed to delete appointments.',
    desktop: 'Failed to delete selected appointments. Please try again.'
  };
  
  return messages[deviceType];
};

export const getNetworkErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Connection error.',
    tablet: 'Network error. Please try again.',
    desktop: 'Network error. Please check your connection and try again.'
  };

  return messages[deviceType];
};

export const getAppErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'App error. Restart needed.',
    tablet: 'An error occurred. Please try again.',
    desktop: 'An unexpected error occurred. Please try again.'
  };

  return messages[deviceType];
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const getLoadSuccessMessage = (deviceType: DeviceType, count: number): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `Loaded ${count} appointments`,
    tablet: `Successfully loaded ${count} appointments`,
    desktop: `✅ Loaded ${count} appointments successfully`
  };
  
  return messages[deviceType];
};

export const getDeleteSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Deleted!',
    tablet: 'Appointment deleted successfully!',
    desktop: 'Appointment deleted successfully!'
  };
  
  return messages[deviceType];
};

export const getSaveSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Saved!',
    tablet: 'Appointment updated successfully!',
    desktop: 'Appointment updated successfully!'
  };
  
  return messages[deviceType];
};

export const getStatusUpdateSuccessMessage = (deviceType: DeviceType, status: string): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Updated!',
    tablet: `Status updated to ${status}`,
    desktop: `Appointment status successfully updated to ${status}`
  };
  
  return messages[deviceType];
};

export const getBulkDeleteSuccessMessage = (deviceType: DeviceType, count: number): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `${count} deleted!`,
    tablet: `${count} appointments deleted successfully`,
    desktop: `Successfully deleted ${count} appointments`
  };
  
  return messages[deviceType];
};

// ============================================================================
// CONFIRMATION MESSAGES
// ============================================================================

export const getDeleteConfirmMessage = (deviceType: DeviceType, status: string): string => {
  const messages: Record<DeviceType, Record<string, string>> = {
    mobile: {
      cancelled: 'Cancel appointment?',
      completed: 'Complete appointment?',
      default: 'Update status?'
    },
    tablet: {
      cancelled: 'Are you sure you want to mark this appointment as cancelled?',
      completed: 'Are you sure you want to mark this appointment as completed?',
      default: `Are you sure you want to mark this appointment as ${status}?`
    },
    desktop: {
      cancelled: 'Are you sure you want to change the appointment status to cancelled? This action cannot be undone.',
      completed: 'Are you sure you want to change the appointment status to completed? This action cannot be undone.',
      default: `Are you sure you want to change the appointment status to ${status}? This action cannot be undone.`
    }
  };
  
  return messages[deviceType][status] || messages[deviceType].default;
};

export const getBulkDeleteConfirmMessage = (deviceType: DeviceType, count: number): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `Delete ${count} appointments?`,
    tablet: `Delete ${count} selected appointments? This cannot be undone.`,
    desktop: `Are you sure you want to delete ${count} selected appointments? This action cannot be undone.`
  };
  
  return messages[deviceType];
};

export const getBulkDeleteLimitMessage = (deviceType: DeviceType, limit: number): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `Can only delete ${limit} at once.`,
    tablet: `Bulk delete limited to ${limit} appointments at once.`,
    desktop: `Bulk delete operations are limited to ${limit} appointments at once for performance reasons.`
  };
  
  return messages[deviceType];
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const getMaxBulkSize = (deviceType: DeviceType): number => {
  const limits: Record<DeviceType, number> = {
    mobile: 5,
    tablet: 15,
    desktop: 50
  };
  
  return limits[deviceType];
};

export const getOptimizedBatchSize = (deviceType: DeviceType): number => {
  const sizes: Record<DeviceType, number> = {
    mobile: 10,
    tablet: 25,
    desktop: 50
  };
  
  return sizes[deviceType];
};

export const shouldShowProgress = (deviceType: DeviceType, operation: 'load' | 'save' | 'delete'): boolean => {
  if (deviceType === 'mobile') {
    return true; // Always show progress on mobile for user feedback
  } else if (deviceType === 'tablet') {
    return operation === 'save' || operation === 'delete';
  } else {
    return false; // Desktop users typically don't need progress indicators for quick operations
  }
};