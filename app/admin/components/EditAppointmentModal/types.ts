// src/app/admin/components/EditAppointmentModal/types.ts
// Shared types for EditAppointmentModal components

import { Appointment, EditAppointmentForm } from '../../types';

export interface EditAppointmentModalProps {
  editingAppointment: Appointment | null;
  editForm: EditAppointmentForm;
  isLoading: boolean;
  onClose: () => void;
  onSave: () => void;
  onFormChange: (field: keyof EditAppointmentForm, value: string) => void;
}

export interface DeviceEditModalProps extends EditAppointmentModalProps {
  touchTargetSize: string;
  fieldHeight: string;
  currentStep?: number;
  setCurrentStep?: (step: number) => void;
  totalSteps?: number;
}