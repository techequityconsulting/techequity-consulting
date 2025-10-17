// src/app/admin/hooks/useAppointments/index.ts
// Main appointments hook - orchestrates all appointment functionality
// FIXED: Added callback support to clear parent modal state after deletion

import { useState, useCallback } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { Appointment, EditAppointmentForm, Notification } from '../../types';
import { UseAppointmentsReturn } from './types';

// Import API utilities
import {
  loadAppointmentsApi,
  deleteAppointmentApi,
  updateAppointmentApi,
  updateStatusApi,
  bulkDeleteAppointmentsApi
} from './apiUtils';

// Import device utilities
import {
  getDeleteConfirmMessage,
  getBulkDeleteConfirmMessage,
  getBulkDeleteLimitMessage,
  getMaxBulkSize
} from './deviceUtils';

// Import validation utilities
import { validateEditForm, formatPhoneNumber } from './validationUtils';

// Import search utilities
import { searchAppointments, getOptimizedAppointments } from './searchUtils';

// Import form utilities
import { prepareEditForm, handleFormChange, resetEditForm, prepareModalOpening } from './formUtils';

export const useAppointments = (
  setNotification: (notification: Notification | null) => void
): UseAppointmentsReturn => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  const [scheduledCalls, setScheduledCalls] = useState<Appointment[]>([]);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editForm, setEditForm] = useState<EditAppointmentForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    interest: '',
    date: '',
    time: '',
    status: 'confirmed'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<number | null>(null);
  
  // FIXED: Add callback storage for post-deletion cleanup
  const [onDeleteSuccessCallback, setOnDeleteSuccessCallback] = useState<(() => void) | null>(null);

  // ============================================================================
  // CORE ACTIONS
  // ============================================================================

  // Load appointments
  const loadScheduledCalls = useCallback(async () => {
    await loadAppointmentsApi({
      deviceType,
      isTouchDevice,
      setIsLoading,
      setScheduledCalls,
      setNotification
    });
  }, [deviceType, isTouchDevice, setNotification]);

  // Initiate delete
  // FIXED: Accept optional callback to run after successful deletion
  const initiateDeleteAppointment = (appointmentId: number, onSuccessCallback?: () => void) => {
    setAppointmentToDelete(appointmentId);
    setShowDeleteConfirmation(true);
    
    // FIXED: Store the callback for later use
    if (onSuccessCallback) {
      setOnDeleteSuccessCallback(() => onSuccessCallback);
    }
    
    console.log(`Delete initiated on ${deviceType} for appointment ${appointmentId}`);
    
    if (deviceType === 'mobile' && isTouchDevice) {
      console.log('Touch delete interaction recorded');
    }
  };

  // Confirm delete
  // FIXED: Execute callback after successful deletion to clear parent modal state
  const confirmDeleteAppointment = async () => {
    if (!appointmentToDelete) return;

    await deleteAppointmentApi({
      appointmentId: appointmentToDelete,
      deviceType,
      setIsLoading,
      setNotification,
      onSuccess: loadScheduledCalls
    });

    setShowDeleteConfirmation(false);
    setAppointmentToDelete(null);
    
    // FIXED: Execute the callback if it exists to clear parent component state
    if (onDeleteSuccessCallback) {
      console.log('🧹 Executing post-deletion cleanup callback...');
      onDeleteSuccessCallback();
      setOnDeleteSuccessCallback(null); // Clear the callback after use
    }
  };

  // Cancel delete
  const cancelDeleteAppointment = () => {
    setShowDeleteConfirmation(false);
    setAppointmentToDelete(null);
    
    // FIXED: Clear the callback when canceling
    setOnDeleteSuccessCallback(null);
    
    if (deviceType === 'mobile' && isTouchDevice) {
      console.log('Touch cancel interaction recorded');
    } else if (deviceType === 'tablet') {
      console.log('Hybrid cancel interaction recorded');
    } else {
      console.log('Click cancel interaction recorded');
    }
  };

  // Open edit modal
  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    const preparedForm = prepareEditForm(appointment, deviceType);
    setEditForm(preparedForm);
    prepareModalOpening(appointment, deviceType, isTouchDevice);
  };

  // Close edit modal
  const closeEditModal = () => {
    setEditingAppointment(null);
    resetEditForm(deviceType, setEditForm);
  };

  // Save edited appointment
  const saveEditedAppointment = async () => {
    if (!editingAppointment) return;

    // Validate form
    const validationResult = validateEditForm(editForm, deviceType);
    if (!validationResult.isValid) {
      const errorMessage = 
        deviceType === 'mobile' ? validationResult.mobileMessage || 'Please check your input.' :
        deviceType === 'tablet' ? validationResult.tabletMessage || validationResult.message || 'Please check all required fields.' :
        validationResult.message || 'Please check all required fields and try again.';
      
      setNotification({
        type: 'error',
        message: errorMessage
      });
      setTimeout(() => setNotification(null), deviceType === 'mobile' ? 3000 : 4000);
      return;
    }

    await updateAppointmentApi({
      appointment: editingAppointment,
      editForm,
      deviceType,
      isTouchDevice,
      setIsLoading,
      setNotification,
      onSuccess: loadScheduledCalls,
      onClose: closeEditModal
    });
  };

  // Handle form change - memoized to prevent input focus loss
  const handleEditFormChange = useCallback((field: keyof EditAppointmentForm, value: string) => {
    handleFormChange(field, value, deviceType, isTouchDevice, setEditForm);
  }, [deviceType, isTouchDevice]);

  // ============================================================================
  // DEVICE-AWARE FEATURES
  // ============================================================================

  // Get optimized appointments (pagination)
  const getOptimizedAppointmentsWrapper = (startIndex: number = 0, batchSize?: number): Appointment[] => {
    return getOptimizedAppointments(scheduledCalls, startIndex, batchSize, deviceType);
  };

  // Search appointments
  const searchAppointmentsWrapper = (query: string): Appointment[] => {
    return searchAppointments(query, scheduledCalls, deviceType);
  };

  // Update appointment status
  const updateAppointmentStatus = async (appointmentId: number, newStatus: string): Promise<void> => {
    // Device-specific confirmation requirements
    const confirmationRequired = {
      mobile: ['cancelled'],
      tablet: ['cancelled', 'completed'],
      desktop: ['cancelled', 'completed']
    };
    
    const requiresConfirmation = confirmationRequired[deviceType].includes(newStatus);
    
    if (requiresConfirmation) {
      const confirmMessage = getDeleteConfirmMessage(deviceType, newStatus);
      const confirmed = confirm(confirmMessage);
      if (!confirmed) return;
    }
    
    await updateStatusApi({
      appointmentId,
      newStatus,
      deviceType,
      setIsLoading,
      setNotification,
      onSuccess: loadScheduledCalls
    });
  };

  // Bulk delete appointments
  const bulkDeleteAppointments = async (appointmentIds: number[]): Promise<void> => {
    if (appointmentIds.length === 0) return;
    
    const maxBulkSize = getMaxBulkSize(deviceType);
    
    if (appointmentIds.length > maxBulkSize) {
      setNotification({ 
        type: 'error', 
        message: getBulkDeleteLimitMessage(deviceType, maxBulkSize)
      });
      setTimeout(() => setNotification(null), 4000);
      return;
    }
    
    const confirmMessage = getBulkDeleteConfirmMessage(deviceType, appointmentIds.length);
    const confirmed = confirm(confirmMessage);
    if (!confirmed) return;
    
    await bulkDeleteAppointmentsApi({
      appointmentIds,
      deviceType,
      setIsLoading,
      setNotification,
      onSuccess: loadScheduledCalls
    });
  };

  // Validate edit form wrapper
  const validateEditFormWrapper = () => {
    return validateEditForm(editForm, deviceType);
  };

  // Format phone number wrapper
  const formatPhoneNumberWrapper = (value: string): string => {
    return formatPhoneNumber(value, deviceType);
  };

  // ============================================================================
  // RETURN ALL FUNCTIONALITY
  // ============================================================================

  return {
    // Core state
    scheduledCalls,
    editingAppointment,
    editForm,
    isLoading,
    showDeleteConfirmation,
    appointmentToDelete,
    
    // Core actions
    loadScheduledCalls,
    initiateDeleteAppointment,
    confirmDeleteAppointment,
    cancelDeleteAppointment,
    openEditModal,
    closeEditModal,
    saveEditedAppointment,
    handleEditFormChange,
    
    // Device-aware features
    deviceType,
    isTouchDevice,
    getOptimizedAppointments: getOptimizedAppointmentsWrapper,
    searchAppointments: searchAppointmentsWrapper,
    updateAppointmentStatus,
    bulkDeleteAppointments,
    validateEditForm: validateEditFormWrapper,
    formatPhoneNumber: formatPhoneNumberWrapper
  };
};