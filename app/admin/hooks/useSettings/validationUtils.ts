// src/app/admin/hooks/useSettings/validationUtils.ts
// Validation utilities for appointment settings

import { DeviceType } from '@/hooks/useDeviceDetection';
import { AppointmentSettings } from '../../types';
import { ValidationResult, DeviceValidationRules, FieldValidationRules } from './types';

// ============================================================================
// DEVICE-SPECIFIC VALIDATION RULES
// ============================================================================

export const getValidationRules = (deviceType: DeviceType): DeviceValidationRules => {
  if (deviceType === 'mobile') {
    return {
      duration: { min: 15, max: 180, roundTo: 15 },
      bufferTime: { min: 0, max: 60, roundTo: 5 },
      advanceNotice: { min: 1, max: 168 },
      maxBookingWindow: { min: 1, max: 365 }
    };
  } else if (deviceType === 'tablet') {
    return {
      duration: { min: 15, max: 240, roundTo: 5 },
      bufferTime: { min: 0, max: 120 },
      advanceNotice: { min: 1, max: 336 },
      maxBookingWindow: { min: 1, max: 730 }
    };
  } else {
    // Desktop
    return {
      duration: { min: 15, max: 480 },
      bufferTime: { min: 0, max: 240 },
      advanceNotice: { min: 1, max: 8760 },
      maxBookingWindow: { min: 1, max: 1095 }
    };
  }
};

// ============================================================================
// VALIDATE SETTINGS
// ============================================================================

export const validateSettings = (
  settings: AppointmentSettings,
  deviceType: DeviceType
): ValidationResult => {
  // Validate duration
  if (settings.duration < 15 || settings.duration > 300) {
    return {
      isValid: false,
      message: 'Duration must be between 15 and 300 minutes',
      mobileMessage: 'Duration: 15-300 minutes',
      tabletMessage: 'Duration must be between 15-300 minutes'
    };
  }
  
  // Validate buffer time
  if (settings.bufferTime < 0 || settings.bufferTime > 120) {
    return {
      isValid: false,
      message: 'Buffer time must be between 0 and 120 minutes',
      mobileMessage: 'Buffer: 0-120 minutes',
      tabletMessage: 'Buffer time must be 0-120 minutes'
    };
  }
  
  // Validate advance notice
  if (settings.advanceNotice < 1 || settings.advanceNotice > 336) {
    return {
      isValid: false,
      message: 'Advance notice must be between 1 and 336 hours',
      mobileMessage: 'Notice: 1-336 hours',
      tabletMessage: 'Advance notice must be 1-336 hours'
    };
  }
  
  // Validate booking window
  if (settings.maxBookingWindow < 1 || settings.maxBookingWindow > 365) {
    return {
      isValid: false,
      message: 'Booking window must be between 1 and 365 days',
      mobileMessage: 'Window: 1-365 days',
      tabletMessage: 'Booking window must be 1-365 days'
    };
  }
  
  // Device-specific logical validation
  if (deviceType !== 'mobile') {
    // More thorough validation for tablet/desktop
    if (settings.bufferTime > settings.duration / 2) {
      return {
        isValid: false,
        message: 'Buffer time should not exceed half the appointment duration',
        tabletMessage: 'Buffer time too long for appointment duration'
      };
    }
  }
  
  return { isValid: true };
};

// ============================================================================
// VALIDATE IMPORTED SETTINGS
// ============================================================================

export const validateImportedSettings = (settings: any): ValidationResult => {
  if (!settings || typeof settings !== 'object') {
    return {
      isValid: false,
      message: 'Invalid settings format',
      mobileMessage: 'Bad file format',
      tabletMessage: 'Invalid settings format'
    };
  }
  
  // Check required fields
  const requiredFields: (keyof AppointmentSettings)[] = [
    'duration',
    'bufferTime',
    'advanceNotice',
    'maxBookingWindow'
  ];
  
  const missingFields = requiredFields.filter(
    (field: keyof AppointmentSettings) => !(field in settings)
  );
  
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing fields: ${missingFields.join(', ')}`,
      mobileMessage: 'Missing settings data',
      tabletMessage: `Missing: ${missingFields.join(', ')}`
    };
  }
  
  // Validate field types and ranges
  for (const field of requiredFields) {
    const value = settings[field];
    if (typeof value !== 'number' || isNaN(value) || value < 0) {
      return {
        isValid: false,
        message: `Invalid value for ${field}: ${value}`,
        mobileMessage: `Bad ${field} value`,
        tabletMessage: `Invalid ${field}: ${value}`
      };
    }
  }
  
  return { isValid: true };
};

// ============================================================================
// PROCESS FIELD VALUE
// ============================================================================

export const processFieldValue = (
  field: keyof AppointmentSettings,
  value: number,
  deviceType: DeviceType
): number => {
  const rules = getValidationRules(deviceType);
  const fieldRules = rules[field];
  
  let processedValue = value;
  
  // Apply min/max bounds
  processedValue = Math.max(fieldRules.min, Math.min(fieldRules.max, processedValue));
  
  // Apply rounding if specified (for mobile/tablet)
  if (fieldRules.roundTo) {
    processedValue = Math.round(processedValue / fieldRules.roundTo) * fieldRules.roundTo;
  } else {
    processedValue = Math.round(processedValue);
  }
  
  return processedValue;
};

// ============================================================================
// VALIDATE FIELD RANGE
// ============================================================================

export const validateFieldRange = (
  field: keyof AppointmentSettings,
  value: number,
  deviceType: DeviceType
): boolean => {
  const rules = getValidationRules(deviceType);
  const fieldRules = rules[field];
  
  return value >= fieldRules.min && value <= fieldRules.max;
};

// ============================================================================
// PROCESS SETTINGS DATA (for load)
// ============================================================================

export const processSettingsData = (
  settingsData: AppointmentSettings,
  deviceType: DeviceType
): AppointmentSettings => {
  if (deviceType === 'mobile') {
    // Mobile: Validate and use sensible defaults for touch interface
    return {
      duration: Math.max(15, Math.min(180, settingsData.duration || 45)),
      bufferTime: Math.max(0, Math.min(60, settingsData.bufferTime || 15)),
      advanceNotice: Math.max(1, Math.min(168, settingsData.advanceNotice || 24)),
      maxBookingWindow: Math.max(1, Math.min(365, settingsData.maxBookingWindow || 60))
    };
  } else if (deviceType === 'tablet') {
    // Tablet: More flexible validation for hybrid interface
    return {
      duration: Math.max(15, Math.min(240, settingsData.duration || 45)),
      bufferTime: Math.max(0, Math.min(120, settingsData.bufferTime || 15)),
      advanceNotice: Math.max(1, Math.min(336, settingsData.advanceNotice || 24)),
      maxBookingWindow: Math.max(1, Math.min(730, settingsData.maxBookingWindow || 60))
    };
  }
  
  // Desktop: Use full range validation without restrictions
  return settingsData;
};