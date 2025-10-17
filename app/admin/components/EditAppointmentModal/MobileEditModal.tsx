// src/app/admin/components/EditAppointmentModal/MobileEditModal.tsx
// Mobile wizard component for editing appointments

'use client';

import React from 'react';
import { Edit, X } from 'lucide-react';
import { DeviceEditModalProps } from './types';

export const MobileEditModal = React.memo(({ 
  editingAppointment,
  editForm, 
  isLoading, 
  onClose, 
  onSave, 
  onFormChange,
  touchTargetSize,
  fieldHeight,
  currentStep = 1,
  setCurrentStep,
  totalSteps = 3
}: DeviceEditModalProps) => {
  if (!editingAppointment) return null;

  const nextStep = () => {
    if (currentStep < totalSteps && setCurrentStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1 && setCurrentStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceedStep1 = editForm.firstName && editForm.lastName && editForm.email;
  const canProceedStep2 = editForm.date && editForm.time;

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      {/* Mobile Header with Progress */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={currentStep === 1 ? onClose : prevStep}
            className="text-blue-100 hover:text-white transition-colors"
            style={{ 
              width: touchTargetSize, 
              height: touchTargetSize,
              minWidth: touchTargetSize,
              minHeight: touchTargetSize
            }}
          >
            <X className="w-6 h-6 mx-auto" />
          </button>
          <h2 className="text-xl font-semibold">Edit Appointment</h2>
          <div style={{ width: touchTargetSize }} /> {/* Spacer */}
        </div>

        {/* Mobile Progress Indicator */}
        <div className="flex items-center justify-center space-x-2 mb-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-3 h-3 rounded-full ${
                step === currentStep ? 'bg-white' : 
                step < currentStep ? 'bg-blue-300' : 'bg-blue-800'
              }`}
            />
          ))}
        </div>
        <p className="text-center text-blue-100 text-sm">
          Step {currentStep} of {totalSteps}
        </p>
      </div>

      {/* Mobile Form Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Step 1: Personal Information */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Personal Information</h3>
              <p className="text-gray-600">Update the client&apos;s contact details</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={editForm.firstName}
                  onChange={(e) => onFormChange('firstName', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                  placeholder="Enter first name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => onFormChange('lastName', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                  placeholder="Enter last name"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => onFormChange('email', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => onFormChange('phone', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                  maxLength={14}
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={editForm.company}
                  onChange={(e) => onFormChange('company', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                  placeholder="Enter company name"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Appointment Details */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Appointment Details</h3>
              <p className="text-gray-600">Update the appointment scheduling information</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Primary Interest</label>
                <select 
                  value={editForm.interest}
                  onChange={(e) => onFormChange('interest', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                >
                  <option value="general">General Consultation</option>
                  <option value="operations">Operations Consulting</option>
                  <option value="cybersecurity">Cybersecurity Solutions</option>
                  <option value="ai">AI Integration & Automation</option>
                  <option value="digital-transformation">Digital Transformation</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  value={editForm.date}
                  onChange={(e) => onFormChange('date', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Time</label>
                <input
                  type="text"
                  value={editForm.time}
                  onChange={(e) => onFormChange('time', e.target.value)}
                  placeholder="e.g., 2:00 PM"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                />
              </div>

              <div>
                <label className="block text-base font-medium text-gray-700 mb-2">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => onFormChange('status', e.target.value)}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 text-gray-900 focus:outline-none focus:border-blue-500 text-lg"
                  style={{ height: fieldHeight }}
                >
                  <option value="confirmed">Confirmed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Review & Confirm */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Edit className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">Review Changes</h3>
              <p className="text-gray-600">Please review all changes before saving</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Contact Information</h4>
                <p className="text-gray-600">{editForm.firstName} {editForm.lastName}</p>
                <p className="text-gray-600">{editForm.email}</p>
                {editForm.phone && <p className="text-gray-600">{editForm.phone}</p>}
                {editForm.company && <p className="text-gray-600">{editForm.company}</p>}
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800 mb-2">Appointment Details</h4>
                <p className="text-gray-600">Interest: {editForm.interest}</p>
                <p className="text-gray-600">Date: {editForm.date}</p>
                <p className="text-gray-600">Time: {editForm.time}</p>
                <p className="text-gray-600">Status: {editForm.status}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Footer Navigation */}
      <div className="p-6 border-t border-gray-200 bg-white">
        {currentStep < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={
              (currentStep === 1 && !canProceedStep1) ||
              (currentStep === 2 && !canProceedStep2)
            }
            className={`w-full py-4 px-4 rounded-lg font-semibold transition-colors text-lg ${
              ((currentStep === 1 && canProceedStep1) || (currentStep === 2 && canProceedStep2))
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            style={{ minHeight: touchTargetSize }}
          >
            Continue
          </button>
        ) : (
          <div className="space-y-3">
            <button
              onClick={onSave}
              disabled={isLoading}
              className={`w-full py-4 px-4 rounded-lg font-semibold transition-colors text-lg ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{ minHeight: touchTargetSize }}
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
            <button
              onClick={onClose}
              className="w-full border-2 border-gray-300 text-gray-700 py-4 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors text-lg"
              style={{ minHeight: touchTargetSize }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

MobileEditModal.displayName = 'MobileEditModal';