// src/app/admin/hooks/useAppointments/types.ts
// Type definitions for appointments management
// FIXED: Updated initiateDeleteAppointment to accept optional callback

import { Appointment, EditAppointmentForm, Notification } from '../../types';
import { DeviceType } from '@/hooks/useDeviceDetection';

// ============================================================================
// API OPERATION PARAMETERS
// ============================================================================

export interface LoadAppointmentsParams {
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setScheduledCalls: (appointments: Appointment[]) => void;
  setNotification: (notification: Notification | null) => void;
}

export interface DeleteAppointmentParams {
  appointmentId: number;
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  onSuccess: () => void;
}

export interface UpdateAppointmentParams {
  appointment: Appointment;
  editForm: EditAppointmentForm;
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  onSuccess: () => void;
  onClose: () => void;
}

export interface UpdateStatusParams {
  appointmentId: number;
  newStatus: string;
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  onSuccess: () => void;
}

export interface BulkDeleteParams {
  appointmentIds: number[];
  deviceType: DeviceType;
  setIsLoading: (loading: boolean) => void;
  setNotification: (notification: Notification | null) => void;
  onSuccess: () => void;
}

// ============================================================================
// DEVICE CONFIGURATIONS
// ============================================================================

export interface DeviceLoadConfig {
  maxRetries: number;
  timeout: number;
  batchSize: number;
}

export interface DeviceDeleteConfig {
  timeout: number;
  showProgress: boolean;
}

export interface DeviceSaveConfig {
  timeout: number;
  showProgress: boolean;
  validateOnSave: boolean;
}

export interface DeviceRetryConfig {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface DeviceNotificationDuration {
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

export interface FieldValidation {
  field: keyof EditAppointmentForm;
  value: string;
  deviceType: DeviceType;
}

// ============================================================================
// SEARCH & FILTER
// ============================================================================

export interface SearchParams {
  query: string;
  appointments: Appointment[];
  deviceType: DeviceType;
}

export interface OptimizedAppointmentsParams {
  appointments: Appointment[];
  startIndex: number;
  batchSize?: number;
  deviceType: DeviceType;
}

// ============================================================================
// FORM HANDLING
// ============================================================================

export interface PrepareEditFormParams {
  appointment: Appointment;
  deviceType: DeviceType;
}

export interface HandleFormChangeParams {
  field: keyof EditAppointmentForm;
  value: string;
  deviceType: DeviceType;
  isTouchDevice: boolean;
  setEditForm: React.Dispatch<React.SetStateAction<EditAppointmentForm>>;
}

// ============================================================================
// HOOK RETURN TYPE
// ============================================================================

export interface UseAppointmentsReturn {
  // Core state
  scheduledCalls: Appointment[];
  editingAppointment: Appointment | null;
  editForm: EditAppointmentForm;
  isLoading: boolean;
  showDeleteConfirmation: boolean;
  appointmentToDelete: number | null;
  
  // Core actions
  loadScheduledCalls: () => Promise<void>;
  initiateDeleteAppointment: (appointmentId: number, onSuccessCallback?: () => void) => void; // FIXED: Added optional callback
  confirmDeleteAppointment: () => Promise<void>;
  cancelDeleteAppointment: () => void;
  openEditModal: (appointment: Appointment) => void;
  closeEditModal: () => void;
  saveEditedAppointment: () => Promise<void>;
  handleEditFormChange: (field: keyof EditAppointmentForm, value: string) => void;
  
  // Device-aware features
  deviceType: DeviceType;
  isTouchDevice: boolean;
  getOptimizedAppointments: (startIndex?: number, batchSize?: number) => Appointment[];
  searchAppointments: (query: string) => Appointment[];
  updateAppointmentStatus: (appointmentId: number, newStatus: string) => Promise<void>;
  bulkDeleteAppointments: (appointmentIds: number[]) => Promise<void>;
  validateEditForm: () => ValidationResult;
  formatPhoneNumber: (value: string) => string;
}

// Re-export types from parent for convenience
export type { Appointment, EditAppointmentForm, Notification };