// src/app/admin/hooks/useSettings/types.ts
// Type definitions for settings management

import { AppointmentSettings, Notification } from '../../types';
import { DeviceType } from '@/hooks/useDeviceDetection';

// ============================================================================
// API OPERATION PARAMETERS
// ============================================================================

export interface LoadSettingsParams {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setAppointmentSettings: (settings: AppointmentSettings) => void;
  setNotification: (notification: Notification | null) => void;
}

export interface SaveSettingsParams {
  settings: AppointmentSettings;
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
}

// ============================================================================
// DEVICE CONFIGURATIONS
// ============================================================================

export interface DeviceLoadConfig {
  maxRetries: number;
  timeout: number;
  simplifyResponse: boolean;
}

export interface DeviceSaveConfig {
  timeout: number;
  showProgress: boolean;
}

export interface DeviceRetryConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

// ============================================================================
// VALIDATION
// ============================================================================

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  mobileMessage?: string;
  tabletMessage?: string;
}

export interface FieldValidationRules {
  min: number;
  max: number;
  roundTo?: number; // For mobile/tablet rounding
}

export interface DeviceValidationRules {
  duration: FieldValidationRules;
  bufferTime: FieldValidationRules;
  advanceNotice: FieldValidationRules;
  maxBookingWindow: FieldValidationRules;
}

// ============================================================================
// PRESETS
// ============================================================================

export type SettingsPresetName = 'quick' | 'standard' | 'extended' | 'flexible';

export interface SettingsPreset {
  name: SettingsPresetName;
  settings: AppointmentSettings;
  description: string;
}

// ============================================================================
// ANALYTICS
// ============================================================================

export interface SettingsAnalytics {
  totalDurationWithBuffer: number;
  dailyAppointmentCapacity: number;
  weeklyCapacity: number;
  bufferRatio: number;
  isOptimizedForDevice: boolean;
}

export interface SettingsComparison {
  [key: string]: {
    current: number;
    default: number;
    difference: number;
  };
}

export interface SettingsHistoryEntry {
  timestamp: string;
  settings: AppointmentSettings;
  deviceType: string;
}

// ============================================================================
// IMPORT/EXPORT
// ============================================================================

export interface ExportedSettingsData {
  appointmentSettings: AppointmentSettings;
  deviceType: DeviceType;
  exportedAt: string;
  version: string;
}

export interface ImportSettingsParams {
  file: File;
  deviceType: DeviceType;
  setAppointmentSettings: (settings: AppointmentSettings) => void;
  setNotification: (notification: Notification | null) => void;
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseSettingsReturn {
  // Core state
  appointmentSettings: AppointmentSettings;
  isLoading: boolean;
  
  // Core actions
  loadAppointmentSettings: () => Promise<void>;
  saveAppointmentSettings: () => Promise<void>;
  updateSettings: (field: keyof AppointmentSettings, value: number) => void;
  
  // Device-aware features
  deviceType: DeviceType;
  isTouchDevice: boolean;
  resetSettings: () => void;
  applySettingsPreset: (presetName: string) => void;
  exportSettings: () => void;
  importSettings: (file: File) => Promise<void>;
  getSettingsAnalytics: () => SettingsAnalytics;
  getSettingsRecommendations: () => string[];
  bulkUpdateSettings: (updates: Partial<AppointmentSettings>) => void;
  compareWithDefaults: () => SettingsComparison;
  getSettingsHistory: () => SettingsHistoryEntry[];
  setupAutoSave: (intervalMinutes?: number) => () => void;
  validateSettings: () => ValidationResult;
  checkDeviceOptimization: () => boolean;
}

// Re-export types from parent for convenience
export type { AppointmentSettings, Notification };