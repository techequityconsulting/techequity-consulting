// src/app/admin/hooks/useAvailability/apiUtils.ts
// API operations for availability management with authentication

import { getAdminApiBaseUrl } from '../../utils/apiConfig';
import { getAdminAuthHeaders } from '../../utils/apiAuth';
import {
  LoadScheduleParams,
  SaveScheduleParams,
  LoadBlackoutsParams,
  AddBlackoutParams,
  RemoveBlackoutParams
} from './types';
import {
  getDeviceConfig,
  getSuccessMessage,
  getErrorMessage,
  getValidationErrorMessage,
  getNetworkErrorMessage,
  getAppErrorMessage,
  getNotificationDuration
} from './deviceUtils';
import { isValidSchedule } from './validationUtils';

/**
 * Load weekly schedule from API
 */
export const loadWeeklyScheduleApi = async (params: LoadScheduleParams): Promise<void> => {
  const {
    deviceType,
    isTouchDevice,
    setIsLoading,
    setWeeklySchedule,
    setNotification
  } = params;

  try {
    setIsLoading(true);
    
    const config = getDeviceConfig(deviceType, 'load');
    const { maxRetries, timeout, simplifyData } = config;

    // Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      console.error('❌ Not authenticated - cannot load schedule');
      setIsLoading(false);
      return;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const queryParams = new URLSearchParams({
          deviceType: deviceType,
          isTouchDevice: isTouchDevice.toString(),
          ...(simplifyData && { simplified: 'true' })
        });

        const response = await fetch(`${getAdminApiBaseUrl()}/api/availability?${queryParams}`, {
          headers: authHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (result.success) {
          setWeeklySchedule(result.data);
          
          console.log(`✅ Loaded schedule on ${deviceType}`);
          return; // Success - exit retry loop
        } else {
          throw new Error(result.error || 'Failed to load schedule');
        }

      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message || error);
        
        if (attempt === maxRetries - 1) {
          throw error; // Last attempt failed
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error: any) {
    console.error('Error loading schedule:', error);
    
    const errorMessage = error.name === 'AbortError' 
      ? getNetworkErrorMessage(deviceType)
      : getAppErrorMessage(deviceType);
    
    setNotification({ 
      type: 'error', 
      message: errorMessage
    });
    
    setTimeout(
      () => setNotification(null), 
      getNotificationDuration(deviceType, 'error')
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Save weekly schedule to API
 */
export const saveWeeklyScheduleApi = async (params: SaveScheduleParams): Promise<void> => {
  const {
    weeklySchedule,
    deviceType,
    setIsLoading,
    setNotification
  } = params;

  try {
    setIsLoading(true);
    
    // Validate schedule before saving
    if (!isValidSchedule(weeklySchedule)) {
      setNotification({
        type: 'error',
        message: getValidationErrorMessage(deviceType)
      });
      setTimeout(
        () => setNotification(null), 
        getNotificationDuration(deviceType, 'error')
      );
      setIsLoading(false);
      return;
    }

    // Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${getAdminApiBaseUrl()}/api/availability`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ schedule: weeklySchedule })
    });

    const result = await response.json();
    
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: getSuccessMessage(deviceType, 'save')
      });
      
      setTimeout(
        () => setNotification(null), 
        getNotificationDuration(deviceType, 'success')
      );
      
      console.log(`✅ Schedule saved successfully on ${deviceType}`);
    } else {
      throw new Error(result.error || 'Failed to save schedule');
    }
  } catch (error: any) {
    console.error('Error saving schedule:', error);
    
    setNotification({ 
      type: 'error', 
      message: getErrorMessage(deviceType, 'save', error.message)
    });
    
    setTimeout(
      () => setNotification(null), 
      getNotificationDuration(deviceType, 'error')
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Load blackout dates from API
 */
export const loadBlackoutDatesApi = async (params: LoadBlackoutsParams): Promise<void> => {
  const {
    deviceType,
    isTouchDevice,
    setIsLoading,
    setBlackoutDates,
    setNotification
  } = params;

  try {
    setIsLoading(true);
    
    const config = getDeviceConfig(deviceType, 'load');
    const { maxRetries, timeout } = config;

    // Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      console.error('❌ Not authenticated - cannot load blackout dates');
      setIsLoading(false);
      return;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const queryParams = new URLSearchParams({
          deviceType: deviceType,
          isTouchDevice: isTouchDevice.toString()
        });

        const response = await fetch(`${getAdminApiBaseUrl()}/api/blackouts?${queryParams}`, {
          headers: authHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (result.success) {
          setBlackoutDates(result.data || []);
          
          console.log(`✅ Loaded ${result.data?.length || 0} blackout dates on ${deviceType}`);
          return; // Success - exit retry loop
        } else {
          throw new Error(result.error || 'Failed to load blackout dates');
        }

      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message || error);
        
        if (attempt === maxRetries - 1) {
          throw error; // Last attempt failed
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

  } catch (error: any) {
    console.error('Error loading blackout dates:', error);
    
    const errorMessage = error.name === 'AbortError' 
      ? getNetworkErrorMessage(deviceType)
      : getErrorMessage(deviceType, 'load', error.message);
    
    setNotification({ 
      type: 'error', 
      message: errorMessage
    });
    
    setTimeout(
      () => setNotification(null), 
      getNotificationDuration(deviceType, 'error')
    );
    
    setBlackoutDates([]);
  } finally {
    setIsLoading(false);
  }
};

/**
 * Add blackout date via API
 */
export const addBlackoutDateApi = async (params: AddBlackoutParams): Promise<void> => {
  const {
    date,
    reason,
    deviceType,
    setIsLoading,
    setBlackoutDates,
    setNotification
  } = params;

  try {
    setIsLoading(true);

    // Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${getAdminApiBaseUrl()}/api/blackouts`, {
      method: 'POST',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date, reason })
    });

    const result = await response.json();
    
    if (result.success) {
      // Add new blackout to local state
      setBlackoutDates(prev => [...prev, result.data]);
      
      setNotification({ 
        type: 'success', 
        message: getSuccessMessage(deviceType, 'add')
      });
      
      setTimeout(
        () => setNotification(null), 
        getNotificationDuration(deviceType, 'success')
      );
      
      console.log(`✅ Added blackout date on ${deviceType}`);
    } else {
      throw new Error(result.error || 'Failed to add blackout date');
    }
  } catch (error: any) {
    console.error('Error adding blackout date:', error);
    
    setNotification({ 
      type: 'error', 
      message: getErrorMessage(deviceType, 'add', error.message)
    });
    
    setTimeout(
      () => setNotification(null), 
      getNotificationDuration(deviceType, 'error')
    );
  } finally {
    setIsLoading(false);
  }
};

/**
 * Remove blackout date via API
 */
export const removeBlackoutDateApi = async (params: RemoveBlackoutParams): Promise<void> => {
  const {
    id,
    deviceType,
    setIsLoading,
    setBlackoutDates,
    setNotification
  } = params;

  try {
    setIsLoading(true);

    // Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${getAdminApiBaseUrl()}/api/blackouts?id=${id}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    const result = await response.json();
    
    if (result.success) {
      // Remove from local state
      setBlackoutDates(prev => prev.filter(blackout => blackout.id !== id));
      
      setNotification({ 
        type: 'success', 
        message: getSuccessMessage(deviceType, 'delete')
      });
      
      setTimeout(
        () => setNotification(null), 
        getNotificationDuration(deviceType, 'success')
      );
      
      console.log(`✅ Removed blackout date on ${deviceType}`);
    } else {
      throw new Error(result.error || 'Failed to remove blackout date');
    }
  } catch (error: any) {
    console.error('Error removing blackout date:', error);
    
    setNotification({ 
      type: 'error', 
      message: getErrorMessage(deviceType, 'delete', error.message)
    });
    
    setTimeout(
      () => setNotification(null), 
      getNotificationDuration(deviceType, 'error')
    );
  } finally {
    setIsLoading(false);
  }
};