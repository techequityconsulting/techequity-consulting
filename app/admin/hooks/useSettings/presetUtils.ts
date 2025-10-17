// src/app/admin/hooks/useSettings/presetUtils.ts
// Settings presets and default configurations

import { DeviceType } from '@/hooks/useDeviceDetection';
import { AppointmentSettings, Notification } from '../../types';
import { SettingsPresetName } from './types';
import {
  getResetConfirmMessage,
  getResetSuccessMessage,
  getPresetSuccessMessage,
  getSuccessNotificationDuration
} from './deviceUtils';

// ============================================================================
// DEFAULT SETTINGS
// ============================================================================

export const getDefaultSettings = (deviceType: DeviceType): AppointmentSettings => {
  return {
    duration: deviceType === 'mobile' ? 30 : 45, // Shorter default for mobile
    bufferTime: 15,
    advanceNotice: 24,
    maxBookingWindow: deviceType === 'mobile' ? 30 : 60 // Shorter window for mobile
  };
};

// ============================================================================
// SETTINGS PRESETS
// ============================================================================

export const getPresetSettings = (
  presetName: SettingsPresetName,
  deviceType: DeviceType
): AppointmentSettings | null => {
  switch (presetName) {
    case 'quick':
      return {
        duration: deviceType === 'mobile' ? 15 : 30,
        bufferTime: 5,
        advanceNotice: 2,
        maxBookingWindow: 14
      };
      
    case 'standard':
      return {
        duration: 45,
        bufferTime: 15,
        advanceNotice: 24,
        maxBookingWindow: 60
      };
      
    case 'extended':
      return {
        duration: deviceType === 'mobile' ? 60 : 90,
        bufferTime: deviceType === 'mobile' ? 15 : 30,
        advanceNotice: 48,
        maxBookingWindow: deviceType === 'mobile' ? 90 : 180
      };
      
    case 'flexible':
      return {
        duration: 60,
        bufferTime: 0,
        advanceNotice: 1,
        maxBookingWindow: deviceType === 'mobile' ? 365 : 730
      };
      
    default:
      console.warn(`Unknown preset: ${presetName}`);
      return null;
  }
};

// ============================================================================
// APPLY PRESET
// ============================================================================

export const applySettingsPreset = (
  presetName: string,
  deviceType: DeviceType,
  setAppointmentSettings: (settings: AppointmentSettings) => void,
  setNotification: (notification: Notification | null) => void
): void => {
  const presetSettings = getPresetSettings(presetName as SettingsPresetName, deviceType);
  
  if (!presetSettings) {
    return; // Invalid preset name
  }
  
  setAppointmentSettings(presetSettings);
  
  const successMessage = getPresetSuccessMessage(deviceType, presetName);
  
  setNotification({ 
    type: 'success', 
    message: successMessage 
  });
  
  setTimeout(
    () => setNotification(null), 
    getSuccessNotificationDuration(deviceType)
  );
  
  console.log(`✅ Applied ${presetName} preset on ${deviceType}`);
};

// ============================================================================
// RESET SETTINGS
// ============================================================================

export const resetSettings = (
  deviceType: DeviceType,
  setAppointmentSettings: (settings: AppointmentSettings) => void,
  setNotification: (notification: Notification | null) => void
): void => {
  const confirmMessage = getResetConfirmMessage(deviceType);
  
  const confirmed = confirm(confirmMessage);
  if (!confirmed) return;

  const defaultSettings = getDefaultSettings(deviceType);
  setAppointmentSettings(defaultSettings);

  const successMessage = getResetSuccessMessage(deviceType);
  
  setNotification({ 
    type: 'success', 
    message: successMessage 
  });
  
  setTimeout(
    () => setNotification(null), 
    deviceType === 'mobile' ? 2000 : 3000
  );
  
  console.log(`✅ Settings reset completed on ${deviceType}`);
};

// ============================================================================
// GET PRESET DESCRIPTION
// ============================================================================

export const getPresetDescription = (presetName: SettingsPresetName): string => {
  const descriptions: Record<SettingsPresetName, string> = {
    quick: 'Short appointments with minimal buffer time for high-volume scheduling',
    standard: 'Balanced settings suitable for most business needs',
    extended: 'Longer appointments with generous buffer time for complex consultations',
    flexible: 'Maximum flexibility with minimal restrictions for on-demand scheduling'
  };
  
  return descriptions[presetName];
};

// ============================================================================
// GET ALL PRESETS
// ============================================================================

export const getAllPresets = (deviceType: DeviceType): Array<{
  name: SettingsPresetName;
  description: string;
  settings: AppointmentSettings;
}> => {
  const presetNames: SettingsPresetName[] = ['quick', 'standard', 'extended', 'flexible'];
  
  return presetNames.map(name => ({
    name,
    description: getPresetDescription(name),
    settings: getPresetSettings(name, deviceType)!
  }));
};