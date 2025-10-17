// src/app/admin/components/BookingsTab/components/AppointmentTable.tsx
// FIXED: Added event.stopPropagation() to prevent modal from opening after delete

'use client';

import { Edit, Trash2, Mail, Phone, Building2, MessageSquare, Activity, Crown, Calendar } from 'lucide-react';
import { Appointment } from '../../../types';
import { useAppointmentFormatting } from '../hooks/useAppointmentFormatting';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';

interface AppointmentTableProps {
  appointments: Appointment[];
  isLoading: boolean;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: number) => void;
  onViewConversation?: (sessionId: string) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export const AppointmentTable = ({
  appointments,
  isLoading,
  onEdit,
  onDelete,
  onViewConversation,
  onAppointmentClick
}: AppointmentTableProps) => {
  const { 
    formatSessionId, 
    getStatusStyles, 
    formatDisplayDate,
    formatDisplayTime,
    formatPhoneNumber
  } = useAppointmentFormatting();
  
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  // Mobile: Swipeable cards with action gestures
  const MobileAppointmentTable = () => (
    <div className="space-y-4">
      {appointments.map((call) => (
        <div 
          key={call.id} 
          className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-4 hover:bg-slate-600/60 transition-colors cursor-pointer"
          onClick={() => onAppointmentClick && onAppointmentClick(call)}
        >
          {/* Header with name and status */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-gray-100 text-lg">{call.firstName} {call.lastName}</h3>
              {call.company && (
                <div className="flex items-center gap-1 mt-1">
                  <Building2 className="w-3 h-3 text-gray-400" />
                  <span className="text-sm text-gray-300">{call.company}</span>
                </div>
              )}
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(call.status)}`}>
              {call.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{call.email}</span>
            </div>
            {call.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-300">{formatPhoneNumber(call.phone)}</span>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-200">{formatDisplayDate(call.date)}</span>
            <span className="text-sm text-gray-400">at</span>
            <span className="text-sm text-gray-200">{formatDisplayTime(call.time)}</span>
          </div>

          {call.interest && (
            <div className="text-sm text-gray-300 mb-3">
              <span className="text-gray-400">Interest:</span> {call.interest}
            </div>
          )}

          {/* Chat Session Link */}
          {call.chatSessionId && onViewConversation && (
            <button
              onClick={(e) => {
                e.stopPropagation(); // ✅ FIXED: Stop event propagation
                onViewConversation(call.chatSessionId!);
              }}
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors text-sm mb-3"
              style={{ minHeight: touchTargetSize }}
            >
              <MessageSquare className="w-4 h-4" />
              View Chat ({formatSessionId(call.chatSessionId)})
            </button>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-slate-600/50">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // ✅ FIXED: Stop event propagation
                onEdit(call);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-blue-600/20 text-blue-300 rounded-lg hover:bg-blue-600/30 transition-colors text-sm font-medium"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // ✅ FIXED: Stop event propagation
                onDelete(call.id);
              }}
              className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-red-600/20 text-red-300 rounded-lg hover:bg-red-600/30 transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Tablet: Grid layout with more details
  const TabletAppointmentTable = () => (
    <div className="grid grid-cols-2 gap-4">
      {appointments.map((appointment) => (
        <div 
          key={appointment.id} 
          className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-4 hover:bg-slate-600/60 transition-colors cursor-pointer"
          onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-medium text-gray-100 text-base mb-1">
                {appointment.firstName} {appointment.lastName}
              </h3>
              {appointment.company && (
                <div className="flex items-center gap-1 mb-2">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-sm text-gray-300">{appointment.company}</span>
                </div>
              )}
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${getStatusStyles(appointment.status)}`}>
              {appointment.status}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="text-sm text-gray-300 truncate">{appointment.email}</span>
            </div>
            {appointment.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">{formatPhoneNumber(appointment.phone)}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-xs text-gray-200">{formatDisplayDate(appointment.date)}</span>
            <span className="text-xs text-gray-400">at</span>
            <span className="text-xs text-gray-200">{formatDisplayTime(appointment.time)}</span>
          </div>

          {appointment.interest && (
            <div className="text-xs text-gray-300 mb-3">
              <span className="text-gray-400">Interest:</span> {appointment.interest}
            </div>
          )}

          {/* Chat Session */}
          <div className="mb-3 pb-3 border-b border-slate-600/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Chat Session:</span>
              {appointment.chatSessionId && onViewConversation ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ FIXED: Stop event propagation
                    onViewConversation(appointment.chatSessionId!);
                  }}
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span className="font-mono">{formatSessionId(appointment.chatSessionId)}</span>
                </button>
              ) : (
                <span className="text-gray-400">None</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation(); // ✅ FIXED: Stop event propagation
                onEdit(appointment);
              }}
              className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation(); // ✅ FIXED: Stop event propagation
                onDelete(appointment.id);
              }}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 text-red-400 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Desktop: Full table with all details
  const DesktopAppointmentTable = () => (
    <div className="overflow-hidden bg-slate-800/50 rounded-lg border border-slate-600/50">
      <table className="min-w-full divide-y divide-slate-600/50">
        <thead className="bg-slate-700/30">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Contact</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Company</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Interest</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Date & Time</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Chat Session</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-600/50 bg-slate-800/30">
          {appointments.map((appointment) => (
            <tr 
              key={appointment.id} 
              className="hover:bg-slate-700/40 transition-colors cursor-pointer"
              onClick={() => onAppointmentClick && onAppointmentClick(appointment)}
            >
              {/* Contact */}
              <td className="px-4 py-4">
                <div>
                  <div className="text-sm font-medium text-gray-100">
                    {appointment.firstName} {appointment.lastName}
                  </div>
                  <div className="text-xs text-gray-400">{appointment.email}</div>
                  {appointment.phone && (
                    <div className="text-xs text-gray-400">{formatPhoneNumber(appointment.phone)}</div>
                  )}
                </div>
              </td>

              {/* Company */}
              <td className="px-4 py-4">
                <div className="text-sm text-gray-300">{appointment.company || '-'}</div>
              </td>

              {/* Interest */}
              <td className="px-4 py-4">
                <div className="text-sm text-gray-300">{appointment.interest || '-'}</div>
              </td>

              {/* Date & Time */}
              <td className="px-4 py-4">
                <div className="text-sm text-gray-100">{formatDisplayDate(appointment.date)}</div>
                <div className="text-xs text-gray-400">{formatDisplayTime(appointment.time)}</div>
              </td>

              {/* Chat Session */}
              <td className="px-4 py-4">
                {appointment.chatSessionId && onViewConversation ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIXED: Stop event propagation
                      onViewConversation(appointment.chatSessionId!);
                    }}
                    className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition-colors"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span className="font-mono">{formatSessionId(appointment.chatSessionId)}</span>
                  </button>
                ) : (
                  <span className="text-xs text-gray-500">-</span>
                )}
              </td>

              {/* Status */}
              <td className="px-4 py-4">
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusStyles(appointment.status)}`}>
                  {appointment.status}
                </span>
              </td>

              {/* Actions */}
              <td className="px-4 py-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIXED: Stop event propagation
                      onEdit(appointment);
                    }}
                    className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-600/20 rounded transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // ✅ FIXED: Stop event propagation
                      onDelete(appointment.id);
                    }}
                    className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-600/20 rounded transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileAppointmentTable />}
      tablet={<TabletAppointmentTable />}
      desktop={<DesktopAppointmentTable />}
    />
  );
};