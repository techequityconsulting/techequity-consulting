// src/app/admin/hooks/useSettings/index.ts
// Main settings hook - orchestrates all settings functionality
// FIXED: Added authentication to API calls via apiUtils

import { useState, useCallback } from 'react';
import { AppointmentSettings, Notification } from '../../types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { UseSettingsReturn } from './types';

// Import utilities
import { loadSettingsApi, saveSettingsApi } from './apiUtils';
import { validateSettings } from './validationUtils';
import { processFieldValue } from './validationUtils';
import { applySettingsPreset, resetSettings } from './presetUtils';
import { exportSettings, importSettings } from './importExportUtils';
import {
  getSettingsAnalytics,
  getSettingsRecommendations,
  checkDeviceOptimization,
  compareWithDefaults,
  getSettingsHistory
} from './analyticsUtils';
import {
  getMaxBulkUpdateSize,
  getBulkUpdateLimitMessage,
  getBulkUpdateSuccessMessage,
  getSuccessNotificationDuration,
  getAutoSaveInterval
} from './deviceUtils';

// ============================================================================
// MAIN HOOK
// ============================================================================

export const useSettings = (
  setNotification: (notification: Notification | null) => void
): UseSettingsReturn => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  const [appointmentSettings, setAppointmentSettings] = useState<AppointmentSettings>({
    duration: 45,
    bufferTime: 15,
    advanceNotice: 24,
    maxBookingWindow: 60
  });
  const [isLoading, setIsLoading] = useState(false);

  // ============================================================================
  // LOAD SETTINGS
  // ============================================================================

  const loadAppointmentSettings = useCallback(async () => {
    await loadSettingsApi({
      deviceType,
      isTouchDevice,
      setIsLoading,
      setAppointmentSettings,
      setNotification
    });
  }, [deviceType, isTouchDevice, setNotification]);

  // ============================================================================
  // SAVE SETTINGS
  // ============================================================================

  const saveAppointmentSettings = async () => {
    // Validate before saving
    const validationResult = validateSettings(appointmentSettings, deviceType);
    
    if (!validationResult.isValid) {
      const errorMessages = {
        mobile: validationResult.mobileMessage || 'Invalid settings.',
        tablet: validationResult.tabletMessage || validationResult.message || 'Please check your settings.',
        desktop: validationResult.message || 'Please review your settings and try again.'
      };
      
      setNotification({
        type: 'error',
        message: errorMessages[deviceType]
      });
      
      setTimeout(
        () => setNotification(null), 
        deviceType === 'mobile' ? 4000 : 5000
      );
      
      return;
    }

    // Save via API
    await saveSettingsApi({
      settings: appointmentSettings,
      deviceType,
      isTouchDevice,
      setIsLoading,
      setNotification
    });
  };

  // ============================================================================
  // UPDATE SETTINGS
  // ============================================================================

  const updateSettings = (field: keyof AppointmentSettings, value: number) => {
    // Process value with device-specific rules
    const processedValue = processFieldValue(field, value, deviceType);
    
    // Update with processed value
    setAppointmentSettings(prev => ({ ...prev, [field]: processedValue }));
    
    // Device-specific input feedback
    if (deviceType === 'mobile' && isTouchDevice && processedValue !== value) {
      console.log(`Touch input rounded: ${field} ${value} -> ${processedValue}`);
    } else if (deviceType === 'tablet' && processedValue !== value) {
      console.log(`Input adjusted for tablet: ${field} ${value} -> ${processedValue}`);
    }
  };

  // ============================================================================
  // RESET SETTINGS
  // ============================================================================

  const handleResetSettings = (): void => {
    resetSettings(deviceType, setAppointmentSettings, setNotification);
  };

  // ============================================================================
  // APPLY PRESET
  // ============================================================================

  const handleApplySettingsPreset = (presetName: string): void => {
    applySettingsPreset(presetName, deviceType, setAppointmentSettings, setNotification);
  };

  // ============================================================================
  // EXPORT SETTINGS
  // ============================================================================

  const handleExportSettings = (): void => {
    exportSettings(appointmentSettings, deviceType, setNotification);
  };

  // ============================================================================
  // IMPORT SETTINGS
  // ============================================================================

  const handleImportSettings = (file: File): Promise<void> => {
    return importSettings(file, deviceType, setAppointmentSettings, setNotification);
  };

  // ============================================================================
  // GET ANALYTICS
  // ============================================================================

  const handleGetSettingsAnalytics = () => {
    return getSettingsAnalytics(appointmentSettings, deviceType);
  };

  // ============================================================================
  // GET RECOMMENDATIONS
  // ============================================================================

  const handleGetSettingsRecommendations = (): string[] => {
    return getSettingsRecommendations(appointmentSettings, deviceType);
  };

  // ============================================================================
  // BULK UPDATE SETTINGS
  // ============================================================================

  const bulkUpdateSettings = (updates: Partial<AppointmentSettings>): void => {
    const maxUpdates = getMaxBulkUpdateSize(deviceType);
    const updateKeys = Object.keys(updates) as (keyof AppointmentSettings)[];
    
    if (updateKeys.length > maxUpdates) {
      const message = getBulkUpdateLimitMessage(deviceType, maxUpdates);
      
      setNotification({ type: 'error', message });
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    // Apply updates with device-specific processing
    setAppointmentSettings(prev => {
      const updated = { ...prev };
      
      updateKeys.forEach((key) => {
        const value = updates[key];
        if (value !== undefined) {
          updated[key] = processFieldValue(key, value, deviceType);
        }
      });

      return updated;
    });

    const successMessage = getBulkUpdateSuccessMessage(
      deviceType, 
      updateKeys.length, 
      updateKeys
    );

    setNotification({ type: 'success', message: successMessage });
    setTimeout(
      () => setNotification(null), 
      getSuccessNotificationDuration(deviceType)
    );
    
    console.log(`✅ Bulk settings update completed on ${deviceType}: ${updateKeys.join(', ')}`);
  };

  // ============================================================================
  // COMPARE WITH DEFAULTS
  // ============================================================================

  const handleCompareWithDefaults = () => {
    return compareWithDefaults(appointmentSettings);
  };

  // ============================================================================
  // GET SETTINGS HISTORY
  // ============================================================================

  const handleGetSettingsHistory = () => {
    return getSettingsHistory(appointmentSettings, deviceType);
  };

  // ============================================================================
  // SETUP AUTO-SAVE
  // ============================================================================

  const setupAutoSave = (intervalMinutes: number = 5): (() => void) => {
    const actualInterval = getAutoSaveInterval(deviceType, intervalMinutes);
    const intervalMs = actualInterval * 60 * 1000; // Convert to milliseconds
    
    let lastSettings = JSON.stringify(appointmentSettings);
    
    const intervalId = setInterval(async () => {
      const currentSettings = JSON.stringify(appointmentSettings);
      if (currentSettings !== lastSettings) {
        try {
          await saveAppointmentSettings();
          lastSettings = currentSettings;
          console.log(`✅ Auto-saved settings on ${deviceType}`);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, intervalMs);
    
    console.log(`✅ Auto-save setup for ${deviceType}: every ${actualInterval} minutes`);
    
    // Return cleanup function
    return () => {
      clearInterval(intervalId);
      console.log(`🔄 Auto-save cleared for ${deviceType}`);
    };
  };

  // ============================================================================
  // VALIDATE SETTINGS
  // ============================================================================

  const handleValidateSettings = () => {
    return validateSettings(appointmentSettings, deviceType);
  };

  // ============================================================================
  // CHECK DEVICE OPTIMIZATION
  // ============================================================================

  const handleCheckDeviceOptimization = (): boolean => {
    return checkDeviceOptimization(appointmentSettings, deviceType);
  };

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // Core state
    appointmentSettings,
    isLoading,
    
    // Core actions
    loadAppointmentSettings,
    saveAppointmentSettings,
    updateSettings,
    
    // Device-aware features
    deviceType,
    isTouchDevice,
    resetSettings: handleResetSettings,
    applySettingsPreset: handleApplySettingsPreset,
    exportSettings: handleExportSettings,
    importSettings: handleImportSettings,
    getSettingsAnalytics: handleGetSettingsAnalytics,
    getSettingsRecommendations: handleGetSettingsRecommendations,
    bulkUpdateSettings,
    compareWithDefaults: handleCompareWithDefaults,
    getSettingsHistory: handleGetSettingsHistory,
    setupAutoSave,
    validateSettings: handleValidateSettings,
    checkDeviceOptimization: handleCheckDeviceOptimization
  };
};