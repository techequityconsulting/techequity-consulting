// src/app/admin/hooks/useAppointments/apiUtils.ts
// API operations for appointments with authentication

import { getAdminApiBaseUrl } from '../../utils/apiConfig';
import { getAdminAuthHeaders } from '../../utils/apiAuth';
import { Appointment, EditAppointmentForm } from '../../types';
import {
  LoadAppointmentsParams,
  DeleteAppointmentParams,
  UpdateAppointmentParams,
  UpdateStatusParams,
  BulkDeleteParams
} from './types';
import {
  getLoadConfig,
  getDeleteConfig,
  getSaveConfig,
  getRetryDelays,
  getLoadErrorMessage,
  getDeleteErrorMessage,
  getSaveErrorMessage,
  getStatusUpdateErrorMessage,
  getBulkDeleteErrorMessage,
  getAppErrorMessage,
  getLoadSuccessMessage,
  getDeleteSuccessMessage,
  getSaveSuccessMessage,
  getStatusUpdateSuccessMessage,
  getBulkDeleteSuccessMessage,
  getSuccessNotificationDuration,
  getErrorNotificationDuration
} from './deviceUtils';
import { sortAppointmentsByDate } from './searchUtils';

// ============================================================================
// LOAD APPOINTMENTS
// ============================================================================

export const loadAppointmentsApi = async (params: LoadAppointmentsParams): Promise<void> => {
  const {
    deviceType,
    isTouchDevice,
    setIsLoading,
    setScheduledCalls,
    setNotification
  } = params;

  try {
    const { maxRetries, timeout, batchSize } = getLoadConfig(deviceType);
    const retryDelays = getRetryDelays();

    // ✅ CRITICAL FIX: Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      console.error('❌ Not authenticated - cannot load appointments');
      setIsLoading(false);
      return;
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const queryParams = new URLSearchParams({
          limit: batchSize.toString(),
          deviceType: deviceType,
          isTouchDevice: isTouchDevice.toString()
        });

        // ✅ CRITICAL FIX: Add authentication headers
        const response = await fetch(`${getAdminApiBaseUrl()}/api/appointments?${queryParams}`, {
          headers: authHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (result.success) {
          const processedData = sortAppointmentsByDate(result.data, deviceType);
          setScheduledCalls(processedData);
          console.log(getLoadSuccessMessage(deviceType, processedData.length));
          return; // Success - exit retry loop
        } else {
          console.error('Failed to load appointments:', result.error);
          if (attempt === maxRetries - 1) {
            setNotification({ 
              type: 'error', 
              message: getLoadErrorMessage(deviceType, result.error)
            });
            setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
          }
        }
      } catch (error: any) {
        console.error(`Load attempt ${attempt + 1} failed:`, error);
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelays[deviceType]));
        } else {
          setNotification({ 
            type: 'error', 
            message: getLoadErrorMessage(deviceType)
          });
          setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
        }
      }
    }
  } catch (error) {
    console.error('Error loading appointments:', error);
    setNotification({ 
      type: 'error', 
      message: getAppErrorMessage(deviceType)
    });
    setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
  }
};

// ============================================================================
// DELETE APPOINTMENT
// ============================================================================

export const deleteAppointmentApi = async (params: DeleteAppointmentParams): Promise<void> => {
  const {
    appointmentId,
    deviceType,
    setIsLoading,
    setNotification,
    onSuccess
  } = params;

  try {
    setIsLoading(true);
    const { timeout, showProgress } = getDeleteConfig(deviceType);

    // ✅ CRITICAL FIX: Check authentication
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    if (showProgress) {
      console.log(`Deleting appointment on ${deviceType}...`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // ✅ CRITICAL FIX: Add authentication headers
    const response = await fetch(
      `${getAdminApiBaseUrl()}/api/appointments?id=${appointmentId}&deviceType=${deviceType}`, 
      {
        method: 'DELETE',
        headers: authHeaders,
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId);
    const result = await response.json();
    
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: getDeleteSuccessMessage(deviceType)
      });
      setTimeout(() => setNotification(null), getSuccessNotificationDuration(deviceType));
      onSuccess();
    } else {
      throw new Error(result.error || 'Failed to delete appointment');
    }
  } catch (error: any) {
    console.error('Error deleting appointment:', error);
    setNotification({ 
      type: 'error', 
      message: getDeleteErrorMessage(deviceType, error.message)
    });
    setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
  } finally {
    setIsLoading(false);
  }
};

// ============================================================================
// UPDATE APPOINTMENT
// ============================================================================

export const updateAppointmentApi = async (params: UpdateAppointmentParams): Promise<void> => {
  const {
    appointment,
    editForm,
    deviceType,
    isTouchDevice,
    setIsLoading,
    setNotification,
    onSuccess,
    onClose
  } = params;

  try {
    setIsLoading(true);
    const { timeout, showProgress } = getSaveConfig(deviceType);

    // ✅ CRITICAL FIX: Check authentication
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    if (showProgress) {
      console.log(`Saving appointment on ${deviceType}...`);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    // ✅ CRITICAL FIX: Preserve chatSessionId from original appointment
    const requestPayload = {
      id: appointment.id,
      ...editForm,
      chatSessionId: appointment.chatSessionId || null,  // ← ADDED THIS LINE
      deviceType: deviceType,
      isTouchDevice: isTouchDevice,
      editMethod: deviceType === 'mobile' ? 'mobile_wizard' : 
                 deviceType === 'tablet' ? 'tablet_form' : 'desktop_form',
      lastModified: new Date().toISOString()
    };

    console.log('🔗 Preserving chatSessionId in update:', appointment.chatSessionId);

    // ✅ CRITICAL FIX: Add authentication headers
    const response = await fetch(`${getAdminApiBaseUrl()}/api/appointments`, {
      method: 'PUT',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();
    
    if (result.success) {
      console.log('✅ Appointment updated with preserved chatSessionId');
      
      setNotification({ 
        type: 'success', 
        message: getSaveSuccessMessage(deviceType)
      });
      
      const successDuration = getSuccessNotificationDuration(deviceType);
      setTimeout(() => setNotification(null), successDuration);
      
      // Device-specific modal closing behavior
      if (deviceType === 'mobile') {
        onClose();
        onSuccess();
      } else if (deviceType === 'tablet') {
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1000);
      } else {
        setTimeout(() => {
          onClose();
          onSuccess();
        }, 1500);
      }
    } else {
      throw new Error(result.error || 'Failed to update appointment');
    }
  } catch (error: any) {
    console.error('Error updating appointment:', error);
    setNotification({ 
      type: 'error', 
      message: getSaveErrorMessage(deviceType, error.message)
    });
    setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
  } finally {
    setIsLoading(false);
  }
};

// ============================================================================
// UPDATE APPOINTMENT STATUS
// ============================================================================

export const updateStatusApi = async (params: UpdateStatusParams): Promise<void> => {
  const {
    appointmentId,
    newStatus,
    deviceType,
    setIsLoading,
    setNotification,
    onSuccess
  } = params;

  try {
    setIsLoading(true);

    // ✅ CRITICAL FIX: Check authentication
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    // ✅ CRITICAL FIX: Add authentication headers
    const response = await fetch(`${getAdminApiBaseUrl()}/api/appointments`, {
      method: 'PATCH',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: appointmentId,
        status: newStatus,
        deviceType: deviceType,
        updateMethod: 'status_only'
      })
    });

    const result = await response.json();
    
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: getStatusUpdateSuccessMessage(deviceType, newStatus)
      });
      setTimeout(() => setNotification(null), getSuccessNotificationDuration(deviceType));
      onSuccess();
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    console.error('Error updating appointment status:', error);
    setNotification({ 
      type: 'error', 
      message: getStatusUpdateErrorMessage(deviceType)
    });
    setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
  } finally {
    setIsLoading(false);
  }
};

// ============================================================================
// BULK DELETE APPOINTMENTS
// ============================================================================

export const bulkDeleteAppointmentsApi = async (params: BulkDeleteParams): Promise<void> => {
  const {
    appointmentIds,
    deviceType,
    setIsLoading,
    setNotification,
    onSuccess
  } = params;

  try {
    setIsLoading(true);

    // ✅ CRITICAL FIX: Check authentication
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    // ✅ CRITICAL FIX: Add authentication headers
    const response = await fetch(`${getAdminApiBaseUrl()}/api/appointments/bulk-delete`, {
      method: 'DELETE',
      headers: {
        ...authHeaders,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ids: appointmentIds,
        deviceType: deviceType
      })
    });

    const result = await response.json();
    
    if (result.success) {
      setNotification({ 
        type: 'success', 
        message: getBulkDeleteSuccessMessage(deviceType, appointmentIds.length)
      });
      
      const successDuration = deviceType === 'mobile' ? 2500 : 3500;
      setTimeout(() => setNotification(null), successDuration);
      onSuccess();
    } else {
      throw new Error(result.error);
    }
  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    setNotification({ 
      type: 'error', 
      message: getBulkDeleteErrorMessage(deviceType)
    });
    setTimeout(() => setNotification(null), getErrorNotificationDuration(deviceType));
  } finally {
    setIsLoading(false);
  }
};