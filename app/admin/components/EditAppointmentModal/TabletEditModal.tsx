// src/app/admin/components/EditAppointmentModal/TabletEditModal.tsx
// Tablet form component for editing appointments

'use client';

import React from 'react';
import { Edit, X } from 'lucide-react';
import { DeviceEditModalProps } from './types';

export const TabletEditModal = React.memo(({ 
  editingAppointment,
  editForm, 
  isLoading, 
  onClose, 
  onSave, 
  onFormChange
}: DeviceEditModalProps) => {
  if (!editingAppointment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-8">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Tablet Header */}
        <div className="bg-blue-600 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Edit className="w-7 h-7" />
              <h2 className="text-2xl font-semibold">Edit Appointment</h2>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors"
              style={{ 
                width: '48px', 
                height: '48px',
                minWidth: '48px',
                minHeight: '48px'
              }}
            >
              <X className="w-6 h-6 mx-auto" />
            </button>
          </div>
        </div>

        {/* Tablet Form Content */}
        <div className="p-8">
          <div className="space-y-6">
            {/* Tablet Personal Information Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={editForm.firstName}
                    onChange={(e) => onFormChange('firstName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={editForm.lastName}
                    onChange={(e) => onFormChange('lastName', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => onFormChange('email', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => onFormChange('phone', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                      maxLength={14}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={editForm.company}
                      onChange={(e) => onFormChange('company', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tablet Appointment Details Section */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Appointment Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Interest</label>
                  <select 
                    value={editForm.interest}
                    onChange={(e) => onFormChange('interest', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                  >
                    <option value="general">General Consultation</option>
                    <option value="operations">Operations Consulting</option>
                    <option value="cybersecurity">Cybersecurity Solutions</option>
                    <option value="ai">AI Integration & Automation</option>
                    <option value="digital-transformation">Digital Transformation</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                    <input
                      type="date"
                      value={editForm.date}
                      onChange={(e) => onFormChange('date', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                    <input
                      type="text"
                      value={editForm.time}
                      onChange={(e) => onFormChange('time', e.target.value)}
                      placeholder="e.g., 2:00 PM"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select 
                    value={editForm.status}
                    onChange={(e) => onFormChange('status', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:outline-none focus:border-blue-500"
                  >
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Tablet Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={isLoading}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors text-base ${
                isLoading
                  ? 'bg-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              style={{ minHeight: '48px' }}
            >
              {isLoading ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

TabletEditModal.displayName = 'TabletEditModal';