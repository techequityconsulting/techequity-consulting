// src/app/admin/hooks/useSettings/apiUtils.ts
// API operations with authentication for settings management
// FIXED: Added getAdminAuthHeaders() to all API calls

import { getAdminApiBaseUrl } from '../../utils/apiConfig';
import { getAdminAuthHeaders } from '../../utils/apiAuth';
import { AppointmentSettings } from '../../types';
import {
  LoadSettingsParams,
  SaveSettingsParams
} from './types';
import {
  getLoadConfig,
  getSaveConfig,
  getRetryDelays,
  getLoadErrorMessage,
  getSaveErrorMessage,
  getAppErrorMessage,
  getSaveSuccessMessage,
  getErrorNotificationDuration,
  getSuccessNotificationDuration
} from './deviceUtils';
import { processSettingsData } from './validationUtils';

// ============================================================================
// LOAD SETTINGS FROM API
// ============================================================================

export const loadSettingsApi = async (params: LoadSettingsParams): Promise<void> => {
  const {
    deviceType,
    isTouchDevice,
    setIsLoading,
    setAppointmentSettings,
    setNotification
  } = params;

  try {
    const { maxRetries, timeout, simplifyResponse } = getLoadConfig(deviceType);
    const retryDelays = getRetryDelays();

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // ✅ FIXED: Check authentication before making request
        const authHeaders = getAdminAuthHeaders();
        if (!authHeaders) {
          console.error('❌ Not authenticated - cannot load settings');
          setIsLoading(false);
          return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Device-specific query parameters
        const queryParams = new URLSearchParams({
          client: process.env.NEXT_PUBLIC_DEFAULT_CLIENT_ID || 'client_techequity_001',
          deviceType: deviceType,
          isTouchDevice: isTouchDevice.toString(),
          ...(simplifyResponse && { simplified: 'true' })
        });

        // ✅ FIXED: Add authentication headers to fetch
        const response = await fetch(`${getAdminApiBaseUrl()}/api/settings?${queryParams}`, {
          headers: authHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (result.success) {
          // Device-specific settings validation and processing
          const settingsData = processSettingsData(result.data, deviceType);
          
          setAppointmentSettings(settingsData);
          console.log(`✅ Settings loaded for ${deviceType}`);
          break; // Success - exit retry loop
          
        } else {
          // ✅ FIXED: Better error handling - result.error might be empty object
          const errorMsg = result.error && typeof result.error === 'string' 
            ? result.error 
            : 'Unknown error';
          
          console.error('Failed to load settings:', errorMsg);
          
          if (attempt === maxRetries - 1) {
            // Last attempt - show error notification
            const errorMessage = getLoadErrorMessage(deviceType, errorMsg);
            
            setNotification({ 
              type: 'error', 
              message: errorMessage
            });
            
            setTimeout(
              () => setNotification(null), 
              getErrorNotificationDuration(deviceType)
            );
          }
        }
      } catch (error: any) {
        console.error(`Settings load attempt ${attempt + 1} failed:`, error);
        
        if (attempt < maxRetries - 1) {
          // Wait before retry
          await new Promise(resolve => 
            setTimeout(resolve, retryDelays[deviceType])
          );
        } else {
          // Final error handling
          const errorMessage = getLoadErrorMessage(deviceType);
          
          setNotification({ 
            type: 'error', 
            message: errorMessage
          });
          
          setTimeout(
            () => setNotification(null), 
            getErrorNotificationDuration(deviceType)
          );
        }
      }
    }
  } catch (error) {
    console.error('Error loading settings:', error);
    
    const errorMessage = getAppErrorMessage(deviceType);
    
    setNotification({ 
      type: 'error', 
      message: errorMessage
    });
    
    setTimeout(
      () => setNotification(null), 
      getErrorNotificationDuration(deviceType)
    );
  }
};

// ============================================================================
// SAVE SETTINGS TO API
// ============================================================================

export const saveSettingsApi = async (params: SaveSettingsParams): Promise<boolean> => {
  const {
    settings,
    deviceType,
    isTouchDevice,
    setIsLoading,
    setNotification
  } = params;

  try {
    setIsLoading(true);
    
    const { timeout, showProgress } = getSaveConfig(deviceType);

    if (showProgress) {
      console.log(`Saving settings on ${deviceType}...`);
    }

    // ✅ FIXED: Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      console.error('❌ Not authenticated - cannot save settings');
      setIsLoading(false);
      
      setNotification({
        type: 'error',
        message: 'Not authenticated. Please log in again.'
      });
      
      setTimeout(
        () => setNotification(null),
        getErrorNotificationDuration(deviceType)
      );
      
      return false;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestPayload = {
      clientId: 'techequity',
      duration: settings.duration,
      bufferTime: settings.bufferTime,
      advanceNotice: settings.advanceNotice,
      maxBookingWindow: settings.maxBookingWindow,
      deviceType: deviceType,
      isTouchDevice: isTouchDevice,
      saveMethod: deviceType === 'mobile' ? 'mobile_touch' : 
                 deviceType === 'tablet' ? 'tablet_hybrid' : 'desktop_keyboard',
      lastModified: new Date().toISOString()
    };

    // ✅ FIXED: Add authentication headers to fetch
    const response = await fetch(`${getAdminApiBaseUrl()}/api/settings`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();
    
    if (result.success) {
      // Device-specific success notifications
      const successMessage = getSaveSuccessMessage(deviceType);
      
      setNotification({ 
        type: 'success', 
        message: successMessage
      });
      
      setTimeout(
        () => setNotification(null), 
        getSuccessNotificationDuration(deviceType)
      );
      
      console.log(`✅ Settings saved successfully on ${deviceType}`);
      return true;
      
    } else {
      // ✅ FIXED: Better error handling - result.error might be empty object
      const errorMsg = result.error && typeof result.error === 'string' 
        ? result.error 
        : 'Unknown error';
      
      console.error('Failed to save settings:', errorMsg);
      
      const errorMessage = getSaveErrorMessage(deviceType, errorMsg);
      
      setNotification({ 
        type: 'error', 
        message: errorMessage
      });
      
      setTimeout(
        () => setNotification(null), 
        getErrorNotificationDuration(deviceType)
      );
      
      return false;
    }
  } catch (error: any) {
    console.error('Error saving settings:', error);
    
    const errorMessage = error.name === 'AbortError'
      ? 'Request timeout - please try again'
      : getSaveErrorMessage(deviceType);
    
    setNotification({ 
      type: 'error', 
      message: errorMessage
    });
    
    setTimeout(
      () => setNotification(null), 
      getErrorNotificationDuration(deviceType)
    );
    
    return false;
  } finally {
    setIsLoading(false);
  }
};