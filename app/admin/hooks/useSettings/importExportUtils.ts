// src/app/admin/hooks/useSettings/importExportUtils.ts
// Import and export functionality for appointment settings

import { DeviceType } from '@/hooks/useDeviceDetection';
import { AppointmentSettings, Notification } from '../../types';
import { ExportedSettingsData } from './types';
import { validateImportedSettings } from './validationUtils';
import {
  getExportSuccessMessage,
  getImportSuccessMessage,
  getInvalidFileMessage,
  getImportErrorMessage,
  getExportErrorMessage,
  getFileReadErrorMessage,
  getErrorNotificationDuration
} from './deviceUtils';

// ============================================================================
// EXPORT SETTINGS
// ============================================================================

export const exportSettings = (
  appointmentSettings: AppointmentSettings,
  deviceType: DeviceType,
  setNotification: (notification: Notification | null) => void
): void => {
  try {
    const settingsData: ExportedSettingsData = {
      appointmentSettings: appointmentSettings,
      deviceType: deviceType,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    
    // Device-specific formatting (mobile: compact, desktop: formatted)
    const jsonString = JSON.stringify(
      settingsData, 
      null, 
      deviceType === 'mobile' ? 0 : 2
    );
    
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `appointment-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const successMessage = getExportSuccessMessage(deviceType);

    setNotification({ 
      type: 'success', 
      message: successMessage 
    });
    
    setTimeout(() => setNotification(null), 3000);
    
    console.log(`✅ Settings exported on ${deviceType}`);
  } catch (error) {
    console.error('Export error:', error);
    
    const errorMessage = getExportErrorMessage(deviceType);
    
    setNotification({ 
      type: 'error', 
      message: errorMessage 
    });
    
    setTimeout(() => setNotification(null), 4000);
  }
};

// ============================================================================
// IMPORT SETTINGS
// ============================================================================

export const importSettings = (
  file: File,
  deviceType: DeviceType,
  setAppointmentSettings: (settings: AppointmentSettings) => void,
  setNotification: (notification: Notification | null) => void
): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.name.endsWith('.json')) {
      const errorMessage = getInvalidFileMessage(deviceType);
      
      setNotification({ 
        type: 'error', 
        message: errorMessage 
      });
      
      setTimeout(
        () => setNotification(null), 
        getErrorNotificationDuration(deviceType)
      );
      
      reject(new Error('Invalid file type'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        // Validate that it has the appointmentSettings field
        if (!jsonData.appointmentSettings) {
          throw new Error('Invalid settings file format');
        }
        
        // Validate imported settings
        const importedSettings = jsonData.appointmentSettings;
        const validationResult = validateImportedSettings(importedSettings);
        
        if (!validationResult.isValid) {
          const errorMessages = {
            mobile: validationResult.mobileMessage || 'Invalid settings file.',
            tablet: validationResult.tabletMessage || validationResult.message || 'Invalid settings in file.',
            desktop: validationResult.message || 'The imported settings file contains invalid values.'
          };
          
          setNotification({ 
            type: 'error', 
            message: errorMessages[deviceType] 
          });
          
          setTimeout(
            () => setNotification(null), 
            getErrorNotificationDuration(deviceType)
          );
          
          reject(new Error(validationResult.message));
          return;
        }
        
        // Apply imported settings
        setAppointmentSettings(importedSettings);
        
        const successMessage = getImportSuccessMessage(deviceType);

        setNotification({ 
          type: 'success', 
          message: successMessage 
        });
        
        setTimeout(() => setNotification(null), 3000);
        
        console.log(`✅ Settings imported on ${deviceType}`);
        resolve();
      } catch (error) {
        console.error('Import error:', error);
        
        const errorMessage = getImportErrorMessage(deviceType);
        
        setNotification({ 
          type: 'error', 
          message: errorMessage 
        });
        
        setTimeout(
          () => setNotification(null), 
          getErrorNotificationDuration(deviceType)
        );
        
        reject(error);
      }
    };
    
    reader.onerror = () => {
      const errorMessage = getFileReadErrorMessage(deviceType);
      
      setNotification({ 
        type: 'error', 
        message: errorMessage 
      });
      
      setTimeout(
        () => setNotification(null), 
        getErrorNotificationDuration(deviceType)
      );
      
      reject(new Error('File read error'));
    };
    
    reader.readAsText(file);
  });
};

// ============================================================================
// VALIDATE EXPORT DATA
// ============================================================================

export const validateExportData = (data: ExportedSettingsData): boolean => {
  try {
    // Check version compatibility
    if (data.version !== '1.0') {
      console.warn(`Export version mismatch: expected 1.0, got ${data.version}`);
      return false;
    }
    
    // Check required fields
    if (!data.appointmentSettings || !data.exportedAt || !data.deviceType) {
      console.warn('Export data missing required fields');
      return false;
    }
    
    // Validate settings structure
    const settings = data.appointmentSettings;
    const requiredFields: (keyof AppointmentSettings)[] = [
      'duration',
      'bufferTime',
      'advanceNotice',
      'maxBookingWindow'
    ];
    
    for (const field of requiredFields) {
      if (typeof settings[field] !== 'number') {
        console.warn(`Invalid field type in export: ${field}`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error validating export data:', error);
    return false;
  }
};

// ============================================================================
// CREATE EXPORT FILENAME
// ============================================================================

export const createExportFilename = (deviceType: DeviceType): string => {
  const date = new Date().toISOString().split('T')[0];
  const time = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
  
  if (deviceType === 'mobile') {
    // Shorter filename for mobile
    return `settings-${date}.json`;
  } else {
    // More descriptive filename for tablet/desktop
    return `appointment-settings-${date}-${time}.json`;
  }
};

// ============================================================================
// PARSE IMPORT FILE
// ============================================================================

export const parseImportFile = async (file: File): Promise<ExportedSettingsData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        
        if (!validateExportData(jsonData)) {
          throw new Error('Invalid export data format');
        }
        
        resolve(jsonData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
};

// ============================================================================
// GET EXPORT SUMMARY
// ============================================================================

export const getExportSummary = (data: ExportedSettingsData): string => {
  const { appointmentSettings, deviceType, exportedAt } = data;
  const date = new Date(exportedAt).toLocaleDateString();
  const time = new Date(exportedAt).toLocaleTimeString();
  
  return `Settings exported from ${deviceType} device on ${date} at ${time}. ` +
         `Duration: ${appointmentSettings.duration}min, ` +
         `Buffer: ${appointmentSettings.bufferTime}min, ` +
         `Advance: ${appointmentSettings.advanceNotice}hrs, ` +
         `Window: ${appointmentSettings.maxBookingWindow} days`;
};