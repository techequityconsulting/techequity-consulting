// src/app/admin/hooks/useAppointments/validationUtils.ts
// Validation utilities for appointment forms

import { DeviceType } from '@/hooks/useDeviceDetection';
import { EditAppointmentForm } from '../../types';
import { ValidationResult } from './types';

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

export const formatPhoneNumber = (value: string, deviceType: DeviceType): string => {
  const phoneNumber = value.replace(/\D/g, '');
  
  if (deviceType === 'mobile') {
    // Mobile: Simplified formatting for touch typing
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    } else {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  } else if (deviceType === 'tablet') {
    // Tablet: Balanced formatting
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  } else {
    // Desktop: Full formatting
    if (phoneNumber.length <= 3) {
      return phoneNumber;
    } else if (phoneNumber.length <= 6) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    } else {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    }
  }
};

// ============================================================================
// EMAIL VALIDATION
// ============================================================================

export const validateEmail = (email: string, deviceType: DeviceType): boolean => {
  if (deviceType === 'mobile') {
    // Simplified regex for mobile
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  } else {
    // Full regex for tablet/desktop
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(email);
  }
};

// ============================================================================
// PHONE VALIDATION
// ============================================================================

export const validatePhone = (phone: string, deviceType: DeviceType): boolean => {
  if (!phone || !phone.trim()) {
    return true; // Phone is optional
  }
  
  const phoneDigits = phone.replace(/\D/g, '');
  const minLength = deviceType === 'mobile' ? 7 : 10; // More lenient on mobile
  
  return phoneDigits.length >= minLength;
};

export const getPhoneValidationMessage = (deviceType: DeviceType): string => {
  const minLength = deviceType === 'mobile' ? 7 : 10;
  
  const messages: Record<DeviceType, string> = {
    mobile: 'Phone too short',
    tablet: `Phone must have ${minLength}+ digits`,
    desktop: `Phone number must have at least ${minLength} digits`
  };
  
  return messages[deviceType];
};

// ============================================================================
// FULL FORM VALIDATION
// ============================================================================

export const validateEditForm = (
  editForm: EditAppointmentForm,
  deviceType: DeviceType
): ValidationResult => {
  // Check required fields
  const requiredFields = ['firstName', 'lastName', 'email', 'date', 'time'];
  const missingFields = requiredFields.filter(
    field => !editForm[field as keyof EditAppointmentForm]?.trim()
  );
  
  if (missingFields.length > 0) {
    const fieldNames: Record<string, string> = {
      firstName: 'First Name',
      lastName: 'Last Name',
      email: 'Email',
      date: 'Date',
      time: 'Time'
    };
    
    const missingFieldNames = missingFields.map(
      field => fieldNames[field as keyof typeof fieldNames]
    );
    
    return {
      isValid: false,
      message: `Please fill in: ${missingFieldNames.join(', ')}`,
      mobileMessage: `Missing: ${missingFieldNames.slice(0, 2).join(', ')}${missingFieldNames.length > 2 ? '...' : ''}`,
      tabletMessage: `Required fields missing: ${missingFieldNames.join(', ')}`
    };
  }
  
  // Email validation
  if (!validateEmail(editForm.email, deviceType)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address',
      mobileMessage: 'Invalid email',
      tabletMessage: 'Please enter a valid email address'
    };
  }
  
  // Phone validation (if provided)
  if (!validatePhone(editForm.phone, deviceType)) {
    return {
      isValid: false,
      message: getPhoneValidationMessage(deviceType),
      mobileMessage: 'Phone too short',
      tabletMessage: getPhoneValidationMessage(deviceType)
    };
  }
  
  return { isValid: true };
};

// ============================================================================
// REAL-TIME FIELD VALIDATION
// ============================================================================

export const validateFieldRealTime = (
  field: keyof EditAppointmentForm,
  value: string,
  deviceType: DeviceType
): boolean => {
  if (field === 'email' && value.length > 3) {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    if (!isValid && deviceType === 'desktop') {
      console.log('Desktop: Real-time email validation failed');
    }
    return isValid;
  } else if (field === 'phone' && value.length > 5) {
    const phoneDigits = value.replace(/\D/g, '');
    const isValid = phoneDigits.length >= 10;
    if (!isValid && deviceType === 'desktop') {
      console.log('Desktop: Real-time phone validation warning');
    }
    return isValid;
  }
  
  return true;
};

// ============================================================================
// NAME PROCESSING
// ============================================================================

export const processNameField = (value: string, deviceType: DeviceType): string => {
  if (deviceType === 'mobile') {
    // Mobile: Restrict characters and length
    return value.replace(/[^a-zA-Z\s'-]/g, '').slice(0, 25);
  } else {
    // Tablet/Desktop: Just length limit
    return value.slice(0, 50);
  }
};

// ============================================================================
// EMAIL PROCESSING
// ============================================================================

export const processEmailField = (value: string, deviceType: DeviceType): string => {
  if (deviceType === 'mobile') {
    // Mobile: Auto-lowercase and trim
    return value.toLowerCase().trim();
  } else {
    // Tablet/Desktop: Just trim
    return value.trim();
  }
};

// ============================================================================
// DEBOUNCED VALIDATION
// ============================================================================

let validationTimeout: NodeJS.Timeout;

export const debounceValidation = (
  field: keyof EditAppointmentForm,
  value: string,
  deviceType: DeviceType,
  callback: (field: keyof EditAppointmentForm, value: string) => void
): void => {
  clearTimeout(validationTimeout);
  validationTimeout = setTimeout(() => {
    callback(field, value);
  }, 500);
};