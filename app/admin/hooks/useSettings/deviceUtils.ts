// src/app/admin/hooks/useSettings/deviceUtils.ts
// Device-specific configurations and utilities for settings

import { DeviceType } from '@/hooks/useDeviceDetection';
import {
  DeviceLoadConfig,
  DeviceSaveConfig,
  DeviceRetryConfig
} from './types';

// ============================================================================
// LOAD CONFIGURATIONS
// ============================================================================

export const getLoadConfig = (deviceType: DeviceType): DeviceLoadConfig => {
  const configs: Record<DeviceType, DeviceLoadConfig> = {
    mobile: { maxRetries: 2, timeout: 8000, simplifyResponse: true },
    tablet: { maxRetries: 3, timeout: 6000, simplifyResponse: false },
    desktop: { maxRetries: 3, timeout: 5000, simplifyResponse: false }
  };
  
  return configs[deviceType];
};

// ============================================================================
// SAVE CONFIGURATIONS
// ============================================================================

export const getSaveConfig = (deviceType: DeviceType): DeviceSaveConfig => {
  const configs: Record<DeviceType, DeviceSaveConfig> = {
    mobile: { timeout: 12000, showProgress: true },
    tablet: { timeout: 10000, showProgress: false },
    desktop: { timeout: 8000, showProgress: false }
  };
  
  return configs[deviceType];
};

// ============================================================================
// RETRY DELAYS
// ============================================================================

export const getRetryDelays = (): DeviceRetryConfig => ({
  mobile: 1500,
  tablet: 1000,
  desktop: 750
});

// ============================================================================
// NOTIFICATION DURATIONS
// ============================================================================

export const getSuccessNotificationDuration = (deviceType: DeviceType): number => {
  const durations: Record<DeviceType, number> = {
    mobile: 2500,
    tablet: 3000,
    desktop: 3000
  };
  
  return durations[deviceType];
};

export const getErrorNotificationDuration = (deviceType: DeviceType): number => {
  const durations: Record<DeviceType, number> = {
    mobile: 4000,
    tablet: 5000,
    desktop: 5000
  };
  
  return durations[deviceType];
};

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const getLoadErrorMessage = (deviceType: DeviceType, error?: string): string => {
  if (error) {
    const messages: Record<DeviceType, string> = {
      mobile: 'Cannot load settings. Check connection.',
      tablet: `Failed to load settings: ${error}`,
      desktop: `Failed to load settings: ${error}`
    };
    return messages[deviceType];
  }
  
  const genericMessages: Record<DeviceType, string> = {
    mobile: 'Connection error. Try again.',
    tablet: 'Error loading settings. Please try again.',
    desktop: 'Error loading settings. Please try again.'
  };
  
  return genericMessages[deviceType];
};

export const getSaveErrorMessage = (deviceType: DeviceType, error?: string): string => {
  if (error) {
    const messages: Record<DeviceType, string> = {
      mobile: 'Save failed. Try again.',
      tablet: `Failed to save settings: ${error}`,
      desktop: `Failed to save settings: ${error}`
    };
    return messages[deviceType];
  }
  
  const genericMessages: Record<DeviceType, string> = {
    mobile: 'Connection error.',
    tablet: 'Error saving settings. Please try again.',
    desktop: 'Error saving settings. Please try again.'
  };
  
  return genericMessages[deviceType];
};

export const getAppErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'App error. Restart needed.',
    tablet: 'Error loading settings. Please try again.',
    desktop: 'Error loading settings. Please try again.'
  };
  
  return messages[deviceType];
};

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const getLoadSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Settings loaded',
    tablet: 'Settings loaded for tablet',
    desktop: 'Settings loaded for desktop'
  };
  
  return messages[deviceType];
};

export const getSaveSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Saved!',
    tablet: 'Settings saved successfully!',
    desktop: 'Settings saved successfully!'
  };
  
  return messages[deviceType];
};

export const getResetSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Reset complete!',
    tablet: 'Settings reset to defaults.',
    desktop: 'All settings have been reset to default values.'
  };
  
  return messages[deviceType];
};

export const getPresetSuccessMessage = (deviceType: DeviceType, presetName: string): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `${presetName} preset applied!`,
    tablet: `${presetName.charAt(0).toUpperCase() + presetName.slice(1)} preset applied successfully`,
    desktop: `Successfully applied ${presetName} settings preset`
  };
  
  return messages[deviceType];
};

export const getExportSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Settings exported!',
    tablet: 'Settings exported successfully',
    desktop: 'Appointment settings have been exported successfully'
  };
  
  return messages[deviceType];
};

export const getImportSuccessMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Settings imported!',
    tablet: 'Settings imported successfully',
    desktop: 'Appointment settings have been imported successfully'
  };
  
  return messages[deviceType];
};

export const getBulkUpdateSuccessMessage = (deviceType: DeviceType, count: number, keys: string[]): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `Updated ${count} settings!`,
    tablet: `Bulk update completed for ${keys.join(', ')}`,
    desktop: `Successfully updated: ${keys.join(', ')}`
  };
  
  return messages[deviceType];
};

// ============================================================================
// CONFIRMATION MESSAGES
// ============================================================================

export const getResetConfirmMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Reset to defaults?',
    tablet: 'Reset all settings to default values?',
    desktop: 'Are you sure you want to reset all appointment settings to their default values?'
  };
  
  return messages[deviceType];
};

export const getBulkUpdateLimitMessage = (deviceType: DeviceType, limit: number): string => {
  const messages: Record<DeviceType, string> = {
    mobile: `Can only update ${limit} settings at once.`,
    tablet: `Bulk updates limited to ${limit} settings.`,
    desktop: `Bulk updates limited to ${limit} settings at once.`
  };
  
  return messages[deviceType];
};

export const getInvalidFileMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Use JSON files only.',
    tablet: 'Please select a JSON file.',
    desktop: 'Please select a valid JSON settings file.'
  };
  
  return messages[deviceType];
};

export const getImportErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Import failed.',
    tablet: 'Failed to import settings. Invalid file.',
    desktop: 'Failed to import settings. Please check the file format.'
  };
  
  return messages[deviceType];
};

export const getExportErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'Export failed.',
    tablet: 'Export failed. Please try again.',
    desktop: 'Settings export failed. Please try again.'
  };
  
  return messages[deviceType];
};

export const getFileReadErrorMessage = (deviceType: DeviceType): string => {
  const messages: Record<DeviceType, string> = {
    mobile: 'File read error.',
    tablet: 'Error reading file.',
    desktop: 'Error reading the settings file.'
  };
  
  return messages[deviceType];
};

// ============================================================================
// BULK OPERATION LIMITS
// ============================================================================

export const getMaxBulkUpdateSize = (deviceType: DeviceType): number => {
  const limits: Record<DeviceType, number> = {
    mobile: 2,
    tablet: 3,
    desktop: 4
  };
  
  return limits[deviceType];
};

// ============================================================================
// AUTO-SAVE INTERVALS
// ============================================================================

export const getAutoSaveInterval = (deviceType: DeviceType, requestedMinutes: number): number => {
  const minIntervals: Record<DeviceType, number> = {
    mobile: 10,  // Minimum 10 minutes on mobile
    tablet: 5,   // Minimum 5 minutes on tablet
    desktop: 3   // Minimum 3 minutes on desktop
  };
  
  return Math.max(requestedMinutes, minIntervals[deviceType]);
};