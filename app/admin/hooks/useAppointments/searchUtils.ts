// src/app/admin/hooks/useAppointments/searchUtils.ts
// Search and filtering utilities for appointments

import { DeviceType } from '@/hooks/useDeviceDetection';
import { Appointment } from '../../types';
import { getOptimizedBatchSize } from './deviceUtils';

// ============================================================================
// APPOINTMENT SEARCH
// ============================================================================

export const searchAppointments = (
  query: string,
  appointments: Appointment[],
  deviceType: DeviceType
): Appointment[] => {
  if (!query.trim()) return appointments;
  
  const searchTerm = query.toLowerCase().trim();
  
  return appointments.filter(appointment => {
    const searchFields = [
      `${appointment.firstName} ${appointment.lastName}`.toLowerCase(),
      appointment.email.toLowerCase(),
      appointment.company?.toLowerCase() || '',
      appointment.phone?.replace(/\D/g, '') || ''
    ];
    
    if (deviceType === 'mobile') {
      // Mobile: Simple partial matching for performance
      return searchFields.some(field => field.includes(searchTerm));
    } else if (deviceType === 'tablet') {
      // Tablet: Balanced search with word matching
      return searchFields.some(field => 
        field.includes(searchTerm) || 
        field.split(' ').some(word => word.startsWith(searchTerm))
      );
    } else {
      // Desktop: Advanced search with fuzzy matching
      return searchFields.some(field => {
        if (field.includes(searchTerm)) return true;
        
        // Word-based search
        const words = field.split(' ');
        if (words.some(word => word.startsWith(searchTerm))) return true;
        
        // Simple fuzzy search for desktop
        if (searchTerm.length > 2) {
          return field.replace(/\s/g, '').includes(searchTerm.replace(/\s/g, ''));
        }
        
        return false;
      });
    }
  });
};

// ============================================================================
// OPTIMIZED APPOINTMENTS (PAGINATION)
// ============================================================================

export const getOptimizedAppointments = (
  appointments: Appointment[],
  startIndex: number = 0,
  batchSize: number | undefined,
  deviceType: DeviceType
): Appointment[] => {
  const size = batchSize || getOptimizedBatchSize(deviceType);
  return appointments.slice(startIndex, startIndex + size);
};

// ============================================================================
// APPOINTMENT SORTING
// ============================================================================

export const sortAppointmentsByDate = (
  appointments: Appointment[],
  deviceType: DeviceType
): Appointment[] => {
  const now = new Date();
  
  if (deviceType === 'mobile') {
    // Mobile: Sort by upcoming first, limit recent data
    return appointments
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        
        // Prioritize upcoming appointments for mobile
        const aIsUpcoming = dateA >= now;
        const bIsUpcoming = dateB >= now;
        
        if (aIsUpcoming && !bIsUpcoming) return -1;
        if (!aIsUpcoming && bIsUpcoming) return 1;
        
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 15); // Limit to 15 most relevant for mobile
  } else if (deviceType === 'tablet') {
    // Tablet: Balanced sorting and reasonable limit
    return appointments
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 30); // Limit to 30 for tablet
  } else {
    // Desktop: Show all data without processing
    return appointments.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });
  }
};

// ============================================================================
// FILTER BY STATUS
// ============================================================================

export const filterByStatus = (
  appointments: Appointment[],
  status: string
): Appointment[] => {
  if (status === 'all') return appointments;
  return appointments.filter(apt => apt.status === status);
};

// ============================================================================
// FILTER BY DATE RANGE
// ============================================================================

export const filterByDateRange = (
  appointments: Appointment[],
  startDate: Date,
  endDate: Date
): Appointment[] => {
  return appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate >= startDate && aptDate <= endDate;
  });
};

// ============================================================================
// GET UPCOMING APPOINTMENTS
// ============================================================================

export const getUpcomingAppointments = (
  appointments: Appointment[],
  deviceType: DeviceType
): Appointment[] => {
  const now = new Date();
  const upcoming = appointments.filter(apt => new Date(apt.date) >= now);
  
  // Device-specific limits
  const limits: Record<DeviceType, number> = {
    mobile: 5,
    tablet: 10,
    desktop: 20
  };
  
  return upcoming.slice(0, limits[deviceType]);
};

// ============================================================================
// GET PAST APPOINTMENTS
// ============================================================================

export const getPastAppointments = (
  appointments: Appointment[],
  deviceType: DeviceType
): Appointment[] => {
  const now = new Date();
  const past = appointments.filter(apt => new Date(apt.date) < now);
  
  // Device-specific limits
  const limits: Record<DeviceType, number> = {
    mobile: 5,
    tablet: 10,
    desktop: 20
  };
  
  return past.slice(0, limits[deviceType]);
};