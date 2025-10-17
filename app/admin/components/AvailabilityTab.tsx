// src/app/admin/components/AvailabilityTab.tsx
// UPDATED: Now uses CustomTimePicker instead of native time inputs

'use client';

import { Eye, EyeOff, Save, Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { WeeklySchedule, BlackoutDate } from '../types';
import { BlackoutDateModal } from './BlackoutDateModal';
import { CustomTimePicker } from './CustomTimePicker';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';

interface AvailabilityTabProps {
  weeklySchedule: WeeklySchedule;
  blackoutDates: BlackoutDate[];
  isLoading: boolean;
  onUpdateDaySchedule: (day: keyof WeeklySchedule, field: string, value: string | boolean) => void;
  onSaveSchedule: () => void;
  onAddBlackout: (date: string, reason: string) => void;
  onRemoveBlackout: (id: number) => void;
}

export const AvailabilityTab = ({
  weeklySchedule,
  blackoutDates,
  isLoading,
  onUpdateDaySchedule,
  onSaveSchedule,
  onAddBlackout,
  onRemoveBlackout
}: AvailabilityTabProps) => {
  const [showBlackoutModal, setShowBlackoutModal] = useState(false);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  const handleAddBlackout = (date: string, reason: string) => {
    onAddBlackout(date, reason);
    setShowBlackoutModal(false);
  };

  const toggleDay = (day: string) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  // Mobile: Accordion-style day selector with custom time pickers
  const MobileAvailabilityTab = () => (
    <div className="space-y-6">
      {/* Mobile Weekly Schedule */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="p-4 border-b border-slate-600/50">
          <h2 className="text-lg font-semibold text-white">Weekly Availability</h2>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading schedule...</div>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {Object.entries(weeklySchedule).map(([day, schedule]) => (
              <div key={day} className="border border-slate-600/60 rounded-lg overflow-hidden">
                {/* Mobile Day Header */}
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full p-4 bg-slate-700/60 hover:bg-slate-600/60 transition-colors flex items-center justify-between"
                  style={{ minHeight: touchTargetSize }}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateDaySchedule(day as keyof WeeklySchedule, 'enabled', !schedule.enabled);
                      }}
                      className={`p-2 rounded transition-colors ${
                        schedule.enabled ? 'text-green-400' : 'text-gray-500'
                      }`}
                    >
                      {schedule.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <span className="font-medium text-gray-100 capitalize text-lg">{day}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">
                      {schedule.enabled ? `${schedule.start} - ${schedule.end}` : 'Unavailable'}
                    </span>
                    {expandedDay === day ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* Mobile Time Settings - Accordion Content with CustomTimePicker */}
                {expandedDay === day && schedule.enabled && (
                  <div className="p-4 bg-slate-800/40 border-t border-slate-600/60">
                    <div className="space-y-4">
                      <CustomTimePicker
                        label="Start Time"
                        value={schedule.start}
                        onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'start', value)}
                        minHeight={48}
                      />
                      <CustomTimePicker
                        label="End Time"
                        value={schedule.end}
                        onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'end', value)}
                        minHeight={48}
                      />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Mobile Save Button */}
        <div className="p-4 border-t border-slate-600/50">
          <button
            onClick={onSaveSchedule}
            disabled={isLoading}
            className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white'
            }`}
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Mobile Blackout Dates */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/20 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="p-4 border-b border-slate-600/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Blackout Dates</h2>
          <button
            onClick={() => setShowBlackoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            style={{ minHeight: touchTargetSize }}
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
        
        <div className="p-4">
          {blackoutDates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No blackout dates set
            </div>
          ) : (
            <div className="space-y-3">
              {blackoutDates.map((blackout) => (
                <div
                  key={blackout.id}
                  className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-white">{blackout.date}</div>
                    <div className="text-sm text-gray-400 mt-1">{blackout.reason}</div>
                  </div>
                  <button
                    onClick={() => onRemoveBlackout(blackout.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                    style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Blackout Date Modal */}
      <BlackoutDateModal
        isOpen={showBlackoutModal}
        onClose={() => setShowBlackoutModal(false)}
        onAdd={handleAddBlackout}
      />
    </div>
  );

  // Tablet: Compact grid layout with custom time pickers
  const TabletAvailabilityTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50 p-6">
        <h2 className="text-xl font-semibold text-white mb-6">Weekly Availability</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading schedule...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(weeklySchedule).map(([day, schedule]) => (
              <div key={day} className="bg-slate-700/40 border border-slate-600/60 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onUpdateDaySchedule(day as keyof WeeklySchedule, 'enabled', !schedule.enabled)}
                      className={`p-2 rounded transition-colors ${
                        schedule.enabled ? 'text-green-400' : 'text-gray-500'
                      }`}
                      style={{ minWidth: touchTargetSize, minHeight: touchTargetSize }}
                    >
                      {schedule.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                    <span className="font-medium text-gray-100 capitalize text-lg">{day}</span>
                  </div>
                  <span className="text-sm text-gray-300">
                    {schedule.enabled ? 'Available' : 'Unavailable'}
                  </span>
                </div>

                {schedule.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <CustomTimePicker
                      label="Start"
                      value={schedule.start}
                      onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'start', value)}
                      minHeight={`${touchTargetSize}px`}
                    />
                    <CustomTimePicker
                      label="End"
                      value={schedule.end}
                      onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'end', value)}
                      minHeight={`${touchTargetSize}px`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-6">
          <button
            onClick={onSaveSchedule}
            disabled={isLoading}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 transform'
            }`}
            style={{ minHeight: touchTargetSize }}
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Tablet Blackout Dates - Same as mobile */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/20 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="p-4 border-b border-slate-600/50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Blackout Dates</h2>
          <button
            onClick={() => setShowBlackoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Date</span>
          </button>
        </div>
        
        <div className="p-4">
          {blackoutDates.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              No blackout dates configured
            </div>
          ) : (
            <div className="space-y-2">
              {blackoutDates.map((blackout) => (
                <div
                  key={blackout.id}
                  className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-3 flex items-center justify-between hover:border-red-500/30 transition-colors"
                >
                  <div>
                    <div className="font-medium text-white">{blackout.date}</div>
                    <div className="text-sm text-gray-400">{blackout.reason}</div>
                  </div>
                  <button
                    onClick={() => onRemoveBlackout(blackout.id)}
                    className="text-red-400 hover:text-red-300 p-2 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BlackoutDateModal
        isOpen={showBlackoutModal}
        onClose={() => setShowBlackoutModal(false)}
        onAdd={handleAddBlackout}
      />
    </div>
  );

  // Desktop: Traditional horizontal layout with custom time pickers
  const DesktopAvailabilityTab = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl p-6 border border-slate-600/50 relative z-10">
        <h2 className="text-2xl font-semibold text-white mb-8">Weekly Availability</h2>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-gray-400">Loading schedule...</div>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(weeklySchedule).map(([day, schedule]) => (
              <div key={day} className="flex items-center gap-4 p-4 bg-slate-700/60 border border-slate-600/60 rounded-lg hover:bg-slate-600/60 transition-all duration-300 hover:border-blue-500/30">
                <div className="w-28">
                  <span className="font-medium text-gray-100 capitalize">{day}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onUpdateDaySchedule(day as keyof WeeklySchedule, 'enabled', !schedule.enabled)}
                    className={`p-1 rounded transition-colors ${schedule.enabled ? 'text-green-400 hover:text-green-300' : 'text-gray-500 hover:text-gray-400'}`}
                  >
                    {schedule.enabled ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                  <span className="text-sm text-gray-300 w-24">
                    {schedule.enabled ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                {schedule.enabled && (
                  <div className="flex items-center gap-4 ml-auto">
                    <CustomTimePicker
                      value={schedule.start}
                      onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'start', value)}
                      className="w-40"
                    />
                    <span className="text-gray-400">to</span>
                    <CustomTimePicker
                      value={schedule.end}
                      onChange={(value) => onUpdateDaySchedule(day as keyof WeeklySchedule, 'end', value)}
                      className="w-40"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-center mt-8">
          <button
            onClick={onSaveSchedule}
            disabled={isLoading}
            className={`px-8 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white hover:scale-105 transform shadow-lg hover:shadow-xl'
            }`}
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving Schedule...' : 'Save Schedule'}
          </button>
        </div>
      </div>

      {/* Desktop Blackout Dates */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/20 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">Blackout Dates</h2>
          <button
            onClick={() => setShowBlackoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 hover:scale-105 transform shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            <span>Add Blackout Date</span>
          </button>
        </div>
        
        {blackoutDates.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-lg">No blackout dates configured</p>
            <p className="text-sm mt-2">Add dates when you're unavailable for appointments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {blackoutDates.map((blackout) => (
              <div
                key={blackout.id}
                className="bg-slate-700/60 border border-slate-600/60 rounded-lg p-4 flex items-center justify-between hover:border-red-500/30 transition-colors"
              >
                <div>
                  <div className="font-medium text-white text-lg">{blackout.date}</div>
                  <div className="text-sm text-gray-400 mt-1">{blackout.reason}</div>
                </div>
                <button
                  onClick={() => onRemoveBlackout(blackout.id)}
                  className="text-red-400 hover:text-red-300 hover:bg-red-900/20 p-2 rounded transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <BlackoutDateModal
        isOpen={showBlackoutModal}
        onClose={() => setShowBlackoutModal(false)}
        onAdd={handleAddBlackout}
      />
    </div>
  );

  // Return the responsive wrapper with device-specific components
  return (
    <ResponsiveWrapper
      mobile={<MobileAvailabilityTab />}
      tablet={<TabletAvailabilityTab />}
      desktop={<DesktopAvailabilityTab />}
    />
  );
};