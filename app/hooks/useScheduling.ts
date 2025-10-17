// src/app/techequity-demo/hooks/useScheduling.ts
// Device-aware scheduling hook with API authentication

import { useState } from 'react';
import { FormData, AvailableSlots, DateSlot, TimeSlot } from '../types';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

// Helper to get API key from widget config (multi-tenant)
const getApiKey = (): string => {
  if (typeof window !== 'undefined' && (window as any).AutoAssistProConfig) {
    return (window as any).AutoAssistProConfig.apiKey;
  }
  throw new Error('AutoAssistPro widget config not found');
};

// Helper to get API base URL (same as widget)
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).AutoAssistProConfig) {
    return (window as any).AutoAssistProConfig.apiBaseUrl || window.location.origin;
  }
  return window.location.origin;
};

export const useScheduling = () => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  const [showSchedulingModal, setShowSchedulingModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedTime, setSelectedTime] = useState<number>(0);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState<boolean>(false);
  const [isBooking, setIsBooking] = useState<boolean>(false);

  // Load available slots with authentication
  const loadAvailableSlots = async (): Promise<void> => {
    try {
      setIsLoadingSlots(true);
      
      const retryConfig = {
        mobile: { maxRetries: 2, delay: 1000, timeout: 8000 },
        tablet: { maxRetries: 3, delay: 750, timeout: 6000 },
        desktop: { maxRetries: 3, delay: 500, timeout: 5000 }
      };

      const { maxRetries, delay, timeout } = retryConfig[deviceType];

      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);

          const slotLimits = {
            mobile: 7,
            tablet: 10,
            desktop: 14
          };

          const days = slotLimits[deviceType];
          
          // Get API key and base URL dynamically from widget config
          const apiKey = getApiKey();
          const apiBaseUrl = getApiBaseUrl();
          
          const response = await fetch(`${apiBaseUrl}/api/availability/check?days=${days}`, {
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          const result = await response.json();
          
          if (result.success) {
            let processedSlots = result.data.availableSlots;
            
            if (deviceType === 'mobile') {
              processedSlots = processedSlots.map((dateSlot: DateSlot) => ({
                ...dateSlot,
                slots: dateSlot.slots.slice(0, 3)
              }));
            } else if (deviceType === 'tablet') {
              processedSlots = processedSlots.map((dateSlot: DateSlot) => ({
                ...dateSlot,
                slots: dateSlot.slots.slice(0, 5)
              }));
            }
            
            setAvailableSlots(processedSlots);
            console.log(`✅ Loaded slots for ${deviceType}: ${processedSlots.length} days`);
            break;
          } else {
            console.error('Failed to load available slots:', result.error);
            if (attempt === maxRetries - 1) {
              setAvailableSlots([]);
              alert('Unable to load available time slots. Please try again later.');
            }
          }
        } catch (error) {
          console.error(`Failed to load slots (attempt ${attempt + 1}):`, error);
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            setAvailableSlots([]);
            alert('Connection error while loading time slots. Please check your internet and try again.');
          }
        }
      }
    } catch (error) {
      console.error('Error loading available slots:', error);
      setAvailableSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  // Save appointment with authentication
  const saveAppointment = async (
    selectedDateSlot: DateSlot, 
    selectedTimeSlot: TimeSlot, 
    formData: FormData, 
    sessionId?: string
  ): Promise<boolean> => {
    try {
      const saveConfig = {
        mobile: { timeout: 10000, showProgress: true },
        tablet: { timeout: 8000, showProgress: false },
        desktop: { timeout: 6000, showProgress: false }
      };

      const { timeout, showProgress } = saveConfig[deviceType];
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      if (showProgress) {
        console.log(`Saving appointment on ${deviceType}...`);
      }

      const requestPayload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        interest: formData.interest,
        date: selectedDateSlot.date,
        time: selectedTimeSlot.time,
        chatSessionId: sessionId || null,
        deviceType: deviceType,
        isTouchDevice: isTouchDevice,
        bookingMethod: deviceType === 'mobile' ? 'mobile_wizard' : 
                      deviceType === 'tablet' ? 'tablet_form' : 'desktop_form'
      };

      // Get API key and base URL dynamically from widget config
      const apiKey = getApiKey();
      const apiBaseUrl = getApiBaseUrl();

      const response = await fetch(`${apiBaseUrl}/api/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      
      if (result.success) {
        console.log(`✅ Appointment saved successfully on ${deviceType}`);
        return true;
      } else {
        console.error('Failed to save appointment:', result.error);
        
        const errorMessages = {
          mobile: 'Unable to save appointment. Please try again.',
          tablet: 'Failed to save appointment: ' + result.error,
          desktop: 'Failed to save appointment: ' + result.error
        };
        
        alert(errorMessages[deviceType]);
        return false;
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
      
      const errorMessages = {
        mobile: 'Connection error. Please try again.',
        tablet: 'Error saving appointment. Please try again.',
        desktop: 'Error saving appointment. Please try again.'
      };
      
      alert(errorMessages[deviceType]);
      return false;
    }
  };

  // Initialize scheduling modal
  const handleScheduleCall = (): void => {
    setShowSchedulingModal(true);
    
    if (deviceType === 'mobile') {
      loadAvailableSlots();
      console.log('Initiating mobile booking wizard');
    } else if (deviceType === 'tablet') {
      setTimeout(() => {
        loadAvailableSlots();
      }, 150);
      console.log('Initiating tablet booking form');
    } else {
      loadAvailableSlots();
      console.log('Initiating desktop booking form');
    }
  };

  // Handle booking confirmation
  const handleBookingConfirmation = async (
    formData: FormData,
    sessionId: string,
    onSuccess?: (dayName: string, time: string, email: string) => void
  ): Promise<void> => {
    if (availableSlots.length === 0 || selectedDate < 0 || selectedTime < 0) {
      const errorMessages = {
        mobile: 'Please select a date and time.',
        tablet: 'Please select both a date and time for your appointment.',
        desktop: 'Please select a date and time slot for your appointment.'
      };
      
      alert(errorMessages[deviceType]);
      return;
    }

    const selectedDateSlot = availableSlots[selectedDate];
    const selectedTimeSlot = selectedDateSlot.slots[selectedTime];

    setIsBooking(true);

    try {
      const success = await saveAppointment(selectedDateSlot, selectedTimeSlot, formData, sessionId);
      
      if (success) {
        const dateStr = selectedDateSlot.date;
        const [year, month, day] = dateStr.split('-').map(Number);
        const localDate = new Date(year, month - 1, day);
        
        const dayName = localDate.toLocaleDateString('en-US', { 
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        console.log(`✅ Appointment confirmed: ${dayName} at ${selectedTimeSlot.time}`);

        if (onSuccess) {
          onSuccess(dayName, selectedTimeSlot.time, formData.email);
        }

        if (deviceType === 'mobile') {
          setShowSchedulingModal(false);
          setSelectedDate(0);
          setSelectedTime(0);
        } else if (deviceType === 'tablet') {
          setTimeout(() => {
            setShowSchedulingModal(false);
            setSelectedDate(0);
            setSelectedTime(0);
          }, 1000);
        } else {
          setTimeout(() => {
            setShowSchedulingModal(false);
            setSelectedDate(0);
            setSelectedTime(0);
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Booking confirmation error:', error);
    } finally {
      setIsBooking(false);
    }
  };

  // Close scheduling modal
  const closeSchedulingModal = (): void => {
    setShowSchedulingModal(false);
    
    if (deviceType === 'mobile') {
      setSelectedDate(0);
      setSelectedTime(0);
    } else {
      setTimeout(() => {
        if (!showSchedulingModal) {
          setSelectedDate(0);
          setSelectedTime(0);
        }
      }, 2000);
    }
  };

  // Device-aware date selection
  const handleDateSelection = (index: number): void => {
    setSelectedDate(index);
    setSelectedTime(0);
    
    if (deviceType === 'mobile' && isTouchDevice) {
      console.log('Date selected via touch');
    }
    
    console.log(`Date selected on ${deviceType}: ${availableSlots[index]?.date}`);
  };

  // Device-aware time selection
  const handleTimeSelection = (index: number): void => {
    setSelectedTime(index);
    
    if (deviceType === 'mobile' && isTouchDevice) {
      console.log('Time selected via touch');
    }
    
    const selectedDateSlot = availableSlots[selectedDate];
    const timeSlot = selectedDateSlot?.slots[index];
    console.log(`Time selected on ${deviceType}: ${timeSlot?.time}`);
  };

  // Device performance optimization
  const getOptimizedSlots = (startIndex: number = 0, batchSize?: number): AvailableSlots => {
    const batchSizes = {
      mobile: 3,
      tablet: 5,
      desktop: 7
    };
    
    const size = batchSize || batchSizes[deviceType];
    return availableSlots.slice(startIndex, startIndex + size);
  };

  // Device-specific booking flow validation
  const validateBookingFlow = (): { isValid: boolean; message?: string } => {
    const validationMessages = {
      mobile: {
        noSlots: 'No time slots available. Please try again later.',
        noSelection: 'Please select a time slot.'
      },
      tablet: {
        noSlots: 'No available appointment slots found. Please check back later.',
        noSelection: 'Please select both a date and time for your appointment.'
      },
      desktop: {
        noSlots: 'No available appointment slots found. Please contact us directly or check back later.',
        noSelection: 'Please select a date and time slot from the available options.'
      }
    };

    const messages = validationMessages[deviceType];

    if (availableSlots.length === 0) {
      return { isValid: false, message: messages.noSlots };
    }

    if (selectedDate < 0 || selectedTime < 0) {
      return { isValid: false, message: messages.noSelection };
    }

    return { isValid: true };
  };

  return {
    // Core state
    showSchedulingModal,
    selectedDate,
    selectedTime,
    availableSlots,
    isLoadingSlots,
    isBooking,
    
    // Core actions
    setShowSchedulingModal,
    setSelectedDate,
    setSelectedTime,
    loadAvailableSlots,
    saveAppointment,
    handleScheduleCall,
    handleBookingConfirmation,
    
    // Device-aware features
    deviceType,
    isTouchDevice,
    closeSchedulingModal,
    handleDateSelection,
    handleTimeSelection,
    getOptimizedSlots,
    validateBookingFlow
  };
};