// src/app/admin/hooks/useAppointments/formUtils.ts
// Form handling utilities for appointments

import { DeviceType } from '@/hooks/useDeviceDetection';
import { Appointment, EditAppointmentForm } from '../../types';
import {
  formatPhoneNumber,
  processNameField,
  processEmailField,
  validateFieldRealTime,
  debounceValidation
} from './validationUtils';

// ============================================================================
// PREPARE EDIT FORM
// ============================================================================

export const prepareEditForm = (
  appointment: Appointment,
  deviceType: DeviceType
): EditAppointmentForm => {
  const baseForm: EditAppointmentForm = {
    firstName: appointment.firstName,
    lastName: appointment.lastName,
    email: appointment.email,
    phone: appointment.phone || '',
    company: appointment.company || '',
    interest: appointment.interest || 'general',
    date: appointment.date,
    time: appointment.time,
    status: appointment.status
  };
  
  if (deviceType === 'mobile') {
    // Mobile: Pre-validate critical fields
    return {
      ...baseForm,
      firstName: baseForm.firstName.trim(),
      lastName: baseForm.lastName.trim(),
      email: baseForm.email.trim().toLowerCase()
    };
  } else if (deviceType === 'tablet') {
    // Tablet: Standard preparation with formatting
    return {
      ...baseForm,
      phone: baseForm.phone ? formatPhoneNumber(baseForm.phone, deviceType) : ''
    };
  } else {
    // Desktop: Full form preparation
    return baseForm;
  }
};

// ============================================================================
// HANDLE FORM CHANGE
// ============================================================================

export const handleFormChange = (
  field: keyof EditAppointmentForm,
  value: string,
  deviceType: DeviceType,
  isTouchDevice: boolean,
  setEditForm: React.Dispatch<React.SetStateAction<EditAppointmentForm>>
): void => {
  if (field === 'phone') {
    const formattedPhone = formatPhoneNumber(value, deviceType);
    setEditForm(prev => ({ ...prev, [field]: formattedPhone }));
    
    // Device-specific input tracking
    if (deviceType === 'mobile' && isTouchDevice) {
      console.log('Touch phone input recorded');
    }
  } else if (field === 'email') {
    // Device-specific email processing
    const processedEmail = processEmailField(value, deviceType);
    setEditForm(prev => ({ ...prev, [field]: processedEmail }));
  } else if (field === 'firstName' || field === 'lastName') {
    // Device-specific name processing
    const processedName = processNameField(value, deviceType);
    setEditForm(prev => ({ ...prev, [field]: processedName }));
  } else {
    // Standard field processing
    setEditForm(prev => ({ ...prev, [field]: value }));
  }
  
  // Device-specific real-time validation feedback
  if (deviceType === 'mobile') {
    // Mobile: Minimal validation during typing for performance
    if (field === 'email' && value.includes('@') && !value.includes('.')) {
      console.log('Mobile: Email validation hint needed');
    }
  } else if (deviceType === 'tablet') {
    // Tablet: Balanced validation
    debounceValidation(field, value, deviceType, (f, v) => {
      validateFieldRealTime(f, v, deviceType);
    });
  } else {
    // Desktop: Real-time validation
    validateFieldRealTime(field, value, deviceType);
  }
};

// ============================================================================
// RESET EDIT FORM
// ============================================================================

export const resetEditForm = (
  deviceType: DeviceType,
  setEditForm: React.Dispatch<React.SetStateAction<EditAppointmentForm>>
): void => {
  const emptyForm: EditAppointmentForm = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    interest: '',
    date: '',
    time: '',
    status: 'confirmed'
  };
  
  if (deviceType === 'mobile') {
    // Mobile: Immediate reset for better performance
    setEditForm(emptyForm);
    console.log('Mobile edit modal closed with immediate reset');
  } else {
    // Tablet/Desktop: Delayed reset to allow for potential re-opening
    const delay = deviceType === 'tablet' ? 500 : 1000;
    setTimeout(() => {
      setEditForm(emptyForm);
    }, delay);
    console.log(`${deviceType} edit modal closed with delayed reset`);
  }
};

// ============================================================================
// PREPARE MODAL OPENING
// ============================================================================

export const prepareModalOpening = (
  appointment: Appointment,
  deviceType: DeviceType,
  isTouchDevice: boolean
): void => {
  // Device-specific modal behavior tracking
  if (isTouchDevice) {
    console.log(`Touch edit initiated for appointment ${appointment.id}`);
  }
  
  if (deviceType === 'mobile') {
    console.log('Mobile edit modal opened with pre-validation');
  } else if (deviceType === 'tablet') {
    console.log('Tablet edit modal opened with formatting');
  } else {
    console.log('Desktop edit modal opened');
  }
};