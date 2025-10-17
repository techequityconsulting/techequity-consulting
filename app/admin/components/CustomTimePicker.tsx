// src/app/admin/components/CustomTimePicker.tsx
// Professional custom time picker with separate hour/minute/period controls
// Solves the issue of native time pickers closing before AM/PM selection

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

interface CustomTimePickerProps {
  value: string; // Format: "HH:MM" (24-hour)
  onChange: (value: string) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: number | string; // Accept both number (px) and string (with unit)
}

export const CustomTimePicker: React.FC<CustomTimePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  className = '',
  minHeight = 44
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempHour, setTempHour] = useState('09');
  const [tempMinute, setTempMinute] = useState('00');
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>('AM');
  const [displayHour, setDisplayHour] = useState('09');
  const [displayMinute, setDisplayMinute] = useState('00');
  const [displayPeriod, setDisplayPeriod] = useState<'AM' | 'PM'>('AM');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse the 24-hour value into 12-hour format for display
  useEffect(() => {
    if (value) {
      const [hours, minutes] = value.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const period = hour24 >= 12 ? 'PM' : 'AM';
      
      const formattedHour = hour12.toString().padStart(2, '0');
      
      setDisplayHour(formattedHour);
      setDisplayMinute(minutes);
      setDisplayPeriod(period);
      
      // Also update temp values when picker is closed
      if (!isOpen) {
        setTempHour(formattedHour);
        setTempMinute(minutes);
        setTempPeriod(period);
      }
    }
  }, [value, isOpen]);

  // When opening the picker, initialize temp values from display values
  const handleOpen = () => {
    setTempHour(displayHour);
    setTempMinute(displayMinute);
    setTempPeriod(displayPeriod);
    setIsOpen(true);
  };

  // Convert 12-hour format to 24-hour format and call onChange
  const applyTimeChange = () => {
    let hour24 = parseInt(tempHour, 10);
    
    if (tempPeriod === 'AM') {
      if (hour24 === 12) hour24 = 0;
    } else {
      if (hour24 !== 12) hour24 += 12;
    }
    
    const timeString = `${hour24.toString().padStart(2, '0')}:${tempMinute}`;
    onChange(timeString);
    setIsOpen(false);
  };

  // Handle Done button - apply changes and close
  const handleDone = () => {
    applyTimeChange();
  };

  // Handle Cancel (click outside) - revert to original values
  const handleCancel = () => {
    setTempHour(displayHour);
    setTempMinute(displayMinute);
    setTempPeriod(displayPeriod);
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        handleCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, displayHour, displayMinute, displayPeriod]);

  // Generate hour options (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => {
    const h = i + 1;
    return h.toString().padStart(2, '0');
  });

  // Generate minute options (00, 05, 10, ..., 55)
  const minutes = Array.from({ length: 12 }, (_, i) => {
    const m = i * 5;
    return m.toString().padStart(2, '0');
  });

  // Format display value
  const displayValue = `${displayHour}:${displayMinute} ${displayPeriod}`;

  // Format minHeight for style attribute
  const styleMinHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-2">
          {label}
        </label>
      )}
      
      {/* Time Display Button */}
      <button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={`w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors flex items-center justify-between ${
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-slate-500'
        }`}
        style={{ minHeight: styleMinHeight }}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="font-medium">{displayValue}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Panel - Using inline style for z-index to override everything */}
      {isOpen && (
        <div 
          className="absolute mt-2 left-1/2 transform -translate-x-1/2 bg-slate-700 border border-slate-600 rounded-lg shadow-2xl overflow-hidden" 
          style={{ width: '240px', zIndex: 9999 }}
        >
          <div className="p-3">
            <div className="text-center mb-2 text-sm font-medium text-gray-300">
              Select Time
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              {/* Hour Column */}
              <div className="flex flex-col">
                <div className="text-xs text-gray-400 mb-1.5 text-center font-medium">Hour</div>
                <div 
                  className="h-44 overflow-y-auto bg-slate-800 rounded-lg border border-slate-600"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}
                >
                  {hours.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setTempHour(h)}
                      className={`w-full px-1.5 py-2 text-center transition-colors text-sm whitespace-nowrap ${
                        h === tempHour
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-200 hover:bg-slate-700'
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              {/* Minute Column */}
              <div className="flex flex-col">
                <div className="text-xs text-gray-400 mb-1.5 text-center font-medium">Minute</div>
                <div 
                  className="h-44 overflow-y-auto bg-slate-800 rounded-lg border border-slate-600"
                  style={{
                    scrollbarWidth: 'thin',
                    scrollbarColor: '#475569 #1e293b'
                  }}
                >
                  {minutes.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMinute(m)}
                      className={`w-full px-1.5 py-2 text-center transition-colors text-sm whitespace-nowrap ${
                        m === tempMinute
                          ? 'bg-blue-600 text-white font-semibold'
                          : 'text-gray-200 hover:bg-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* AM/PM Column */}
              <div className="flex flex-col">
                <div className="text-xs text-gray-400 mb-1.5 text-center font-medium">Period</div>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setTempPeriod('AM')}
                    className={`w-full px-1.5 py-2.5 text-center rounded-lg font-semibold transition-colors text-sm whitespace-nowrap ${
                      tempPeriod === 'AM'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-gray-200 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setTempPeriod('PM')}
                    className={`w-full px-1.5 py-2.5 text-center rounded-lg font-semibold transition-colors text-sm whitespace-nowrap ${
                      tempPeriod === 'PM'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-800 text-gray-200 hover:bg-slate-700 border border-slate-600'
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <button
              type="button"
              onClick={handleDone}
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};