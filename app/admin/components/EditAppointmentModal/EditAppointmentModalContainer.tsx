// src/app/admin/components/EditAppointmentModal/EditAppointmentModalContainer.tsx
// Main container that orchestrates device-specific edit modals

'use client';

import React, { useState, useMemo } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { getTouchTargetSize, getFormFieldHeight } from '@/utils/deviceUtils';
import { EditAppointmentModalProps } from './types';
import { MobileEditModal } from './MobileEditModal';
import { TabletEditModal } from './TabletEditModal';
import { DesktopEditModal } from './DesktopEditModal';

export const EditAppointmentModalContainer = React.memo(({ 
  editingAppointment, 
  editForm, 
  isLoading, 
  onClose, 
  onSave, 
  onFormChange 
}: EditAppointmentModalProps) => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);
  const fieldHeight = getFormFieldHeight(deviceType);

  // Mobile wizard state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  if (!editingAppointment) return null;

  // Render based on device type directly
  if (deviceType === 'mobile') {
    return (
      <MobileEditModal
        editingAppointment={editingAppointment}
        editForm={editForm}
        isLoading={isLoading}
        onClose={onClose}
        onSave={onSave}
        onFormChange={onFormChange}
        touchTargetSize={touchTargetSize}
        fieldHeight={fieldHeight}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        totalSteps={totalSteps}
      />
    );
  }

  if (deviceType === 'tablet') {
    return (
      <TabletEditModal
        editingAppointment={editingAppointment}
        editForm={editForm}
        isLoading={isLoading}
        onClose={onClose}
        onSave={onSave}
        onFormChange={onFormChange}
        touchTargetSize={touchTargetSize}
        fieldHeight={fieldHeight}
      />
    );
  }

  return (
    <DesktopEditModal
      editingAppointment={editingAppointment}
      editForm={editForm}
      isLoading={isLoading}
      onClose={onClose}
      onSave={onSave}
      onFormChange={onFormChange}
      touchTargetSize={touchTargetSize}
      fieldHeight={fieldHeight}
    />
  );
});

EditAppointmentModalContainer.displayName = 'EditAppointmentModalContainer';