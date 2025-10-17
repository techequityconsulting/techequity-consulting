// src/app/admin/hooks/useSettings/analyticsUtils.ts
// Analytics and recommendations for appointment settings

import { DeviceType } from '@/hooks/useDeviceDetection';
import { AppointmentSettings } from '../../types';
import {
  SettingsAnalytics,
  SettingsComparison,
  SettingsHistoryEntry
} from './types';

// ============================================================================
// SETTINGS ANALYTICS
// ============================================================================

export const getSettingsAnalytics = (
  settings: AppointmentSettings,
  deviceType: DeviceType
): SettingsAnalytics => {
  const totalDurationWithBuffer = settings.duration + settings.bufferTime;
  const dailyAppointmentCapacity = Math.floor(480 / totalDurationWithBuffer); // 8-hour workday
  const weeklyCapacity = dailyAppointmentCapacity * 5; // 5-day work week
  const bufferRatio = Math.round((settings.bufferTime / settings.duration) * 100);
  const isOptimizedForDevice = checkDeviceOptimization(settings, deviceType);
  
  const analytics: SettingsAnalytics = {
    totalDurationWithBuffer,
    dailyAppointmentCapacity,
    weeklyCapacity,
    bufferRatio,
    isOptimizedForDevice
  };
  
  // Device-specific analytics logging
  if (deviceType === 'desktop') {
    console.log('📊 Settings Analytics:', analytics);
  } else if (deviceType === 'mobile') {
    console.log(`📱 Mobile analytics: ${analytics.dailyAppointmentCapacity} daily capacity, ${analytics.bufferRatio}% buffer`);
  }
  
  return analytics;
};

// ============================================================================
// DEVICE OPTIMIZATION CHECK
// ============================================================================

export const checkDeviceOptimization = (
  settings: AppointmentSettings,
  deviceType: DeviceType
): boolean => {
  if (deviceType === 'mobile') {
    // Mobile optimization checks
    return (
      settings.duration >= 15 && settings.duration <= 120 && // Reasonable duration for mobile booking
      settings.bufferTime <= 30 && // Not too much buffer for touch interface
      settings.advanceNotice <= 72 && // Not too far in advance for mobile users
      settings.maxBookingWindow <= 90 // Reasonable booking window for mobile
    );
  } else if (deviceType === 'tablet') {
    // Tablet optimization checks
    return (
      settings.duration >= 15 && settings.duration <= 180 &&
      settings.bufferTime <= 60 &&
      settings.advanceNotice <= 168 &&
      settings.maxBookingWindow <= 180
    );
  } else {
    // Desktop optimization checks - more flexible
    return (
      settings.duration >= 15 && settings.duration <= 240 &&
      settings.bufferTime <= 120 &&
      settings.advanceNotice >= 1 &&
      settings.maxBookingWindow >= 1
    );
  }
};

// ============================================================================
// SETTINGS RECOMMENDATIONS
// ============================================================================

export const getSettingsRecommendations = (
  settings: AppointmentSettings,
  deviceType: DeviceType
): string[] => {
  const recommendations: string[] = [];
  
  // Device-specific recommendations
  if (deviceType === 'mobile') {
    if (settings.duration > 90) {
      recommendations.push('Consider shorter appointments for mobile users');
    }
    if (settings.bufferTime > 20) {
      recommendations.push('Reduce buffer time for mobile efficiency');
    }
    if (settings.maxBookingWindow > 60) {
      recommendations.push('Shorter booking window works better on mobile');
    }
  } else if (deviceType === 'tablet') {
    if (settings.duration < 30) {
      recommendations.push('Consider longer appointments for tablet interface');
    }
    if (settings.bufferTime === 0) {
      recommendations.push('Add small buffer time for tablet scheduling');
    }
  } else {
    // Desktop recommendations
    if (settings.duration > 0 && settings.bufferTime === 0) {
      recommendations.push('Consider adding buffer time between appointments');
    }
    if (settings.advanceNotice < 12) {
      recommendations.push('Increase advance notice for better planning');
    }
    if (settings.maxBookingWindow > 180) {
      recommendations.push('Very long booking windows may reduce urgency');
    }
  }
  
  // Universal recommendations
  const bufferRatio = (settings.bufferTime / settings.duration) * 100;
  if (bufferRatio > 50) {
    recommendations.push('Buffer time seems excessive compared to appointment duration');
  }
  
  const dailyCapacity = Math.floor(480 / (settings.duration + settings.bufferTime));
  if (dailyCapacity < 3) {
    recommendations.push('Current settings allow very few daily appointments');
  } else if (dailyCapacity > 15) {
    recommendations.push('Consider if this many daily appointments is sustainable');
  }
  
  return recommendations;
};

// ============================================================================
// COMPARE WITH DEFAULTS
// ============================================================================

export const compareWithDefaults = (
  settings: AppointmentSettings
): SettingsComparison => {
  const defaults: AppointmentSettings = {
    duration: 45,
    bufferTime: 15,
    advanceNotice: 24,
    maxBookingWindow: 60
  };
  
  const comparison: SettingsComparison = {};
  
  (Object.keys(defaults) as (keyof AppointmentSettings)[]).forEach((key) => {
    comparison[key] = {
      current: settings[key],
      default: defaults[key],
      difference: settings[key] - defaults[key]
    };
  });
  
  return comparison;
};

// ============================================================================
// SETTINGS HISTORY (SIMULATED)
// ============================================================================

export const getSettingsHistory = (
  currentSettings: AppointmentSettings,
  deviceType: DeviceType
): SettingsHistoryEntry[] => {
  // In a real implementation, this would fetch from API
  // For now, return current settings as history
  return [{
    timestamp: new Date().toISOString(),
    settings: { ...currentSettings },
    deviceType: deviceType
  }];
};

// ============================================================================
// CAPACITY CALCULATIONS
// ============================================================================

export const calculateDailyCapacity = (settings: AppointmentSettings): number => {
  const totalSlotTime = settings.duration + settings.bufferTime;
  return Math.floor(480 / totalSlotTime); // 8-hour workday in minutes
};

export const calculateWeeklyCapacity = (settings: AppointmentSettings): number => {
  return calculateDailyCapacity(settings) * 5; // 5-day work week
};

export const calculateMonthlyCapacity = (settings: AppointmentSettings): number => {
  return calculateDailyCapacity(settings) * 22; // ~22 working days per month
};

// ============================================================================
// BUFFER RATIO ANALYSIS
// ============================================================================

export const analyzeBufferRatio = (settings: AppointmentSettings): {
  ratio: number;
  status: 'low' | 'optimal' | 'high' | 'excessive';
  message: string;
} => {
  const ratio = Math.round((settings.bufferTime / settings.duration) * 100);
  
  if (ratio === 0) {
    return {
      ratio,
      status: 'low',
      message: 'No buffer time - appointments are back-to-back'
    };
  } else if (ratio <= 20) {
    return {
      ratio,
      status: 'optimal',
      message: 'Good balance between appointment time and buffer'
    };
  } else if (ratio <= 40) {
    return {
      ratio,
      status: 'high',
      message: 'Moderate buffer time - provides flexibility'
    };
  } else {
    return {
      ratio,
      status: 'excessive',
      message: 'Buffer time is very high compared to appointment duration'
    };
  }
};

// ============================================================================
// BOOKING WINDOW ANALYSIS
// ============================================================================

export const analyzeBookingWindow = (settings: AppointmentSettings): {
  days: number;
  status: 'short' | 'optimal' | 'long' | 'very-long';
  message: string;
} => {
  const days = settings.maxBookingWindow;
  
  if (days <= 14) {
    return {
      days,
      status: 'short',
      message: 'Short booking window - encourages quick decisions'
    };
  } else if (days <= 60) {
    return {
      days,
      status: 'optimal',
      message: 'Good booking window for most businesses'
    };
  } else if (days <= 120) {
    return {
      days,
      status: 'long',
      message: 'Long booking window - allows advance planning'
    };
  } else {
    return {
      days,
      status: 'very-long',
      message: 'Very long booking window - may reduce booking urgency'
    };
  }
};

// ============================================================================
// ADVANCE NOTICE ANALYSIS
// ============================================================================

export const analyzeAdvanceNotice = (settings: AppointmentSettings): {
  hours: number;
  status: 'minimal' | 'short' | 'optimal' | 'long';
  message: string;
} => {
  const hours = settings.advanceNotice;
  
  if (hours <= 4) {
    return {
      hours,
      status: 'minimal',
      message: 'Very short notice - allows last-minute bookings'
    };
  } else if (hours <= 12) {
    return {
      hours,
      status: 'short',
      message: 'Short notice - good for flexible scheduling'
    };
  } else if (hours <= 48) {
    return {
      hours,
      status: 'optimal',
      message: 'Good advance notice for planning'
    };
  } else {
    return {
      hours,
      status: 'long',
      message: 'Long advance notice - ensures preparation time'
    };
  }
};

// ============================================================================
// OVERALL EFFICIENCY SCORE
// ============================================================================

export const calculateEfficiencyScore = (settings: AppointmentSettings): {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  message: string;
} => {
  let score = 100;
  
  // Deduct points for inefficiencies
  const bufferRatio = (settings.bufferTime / settings.duration) * 100;
  if (bufferRatio > 40) {
    score -= 20;
  } else if (bufferRatio > 30) {
    score -= 10;
  }
  
  const dailyCapacity = calculateDailyCapacity(settings);
  if (dailyCapacity < 4) {
    score -= 15;
  } else if (dailyCapacity > 20) {
    score -= 10;
  }
  
  if (settings.advanceNotice < 4) {
    score -= 10;
  }
  
  if (settings.maxBookingWindow > 180) {
    score -= 10;
  }
  
  // Determine grade
  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  let message: string;
  
  if (score >= 90) {
    grade = 'A';
    message = 'Excellent settings - highly efficient';
  } else if (score >= 80) {
    grade = 'B';
    message = 'Good settings - minor improvements possible';
  } else if (score >= 70) {
    grade = 'C';
    message = 'Acceptable settings - consider optimizations';
  } else if (score >= 60) {
    grade = 'D';
    message = 'Settings need improvement';
  } else {
    grade = 'F';
    message = 'Settings are inefficient - review recommended';
  }
  
  return { score, grade, message };
};

// ============================================================================
// GENERATE ANALYTICS REPORT
// ============================================================================

export const generateAnalyticsReport = (
  settings: AppointmentSettings,
  deviceType: DeviceType
): string => {
  const analytics = getSettingsAnalytics(settings, deviceType);
  const bufferAnalysis = analyzeBufferRatio(settings);
  const windowAnalysis = analyzeBookingWindow(settings);
  const noticeAnalysis = analyzeAdvanceNotice(settings);
  const efficiency = calculateEfficiencyScore(settings);
  
  return `
📊 Settings Analytics Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚙️ Current Settings:
  • Duration: ${settings.duration} minutes
  • Buffer Time: ${settings.bufferTime} minutes
  • Advance Notice: ${settings.advanceNotice} hours
  • Booking Window: ${settings.maxBookingWindow} days

📈 Capacity Analysis:
  • Daily Capacity: ${analytics.dailyAppointmentCapacity} appointments
  • Weekly Capacity: ${analytics.weeklyCapacity} appointments
  • Monthly Capacity: ${calculateMonthlyCapacity(settings)} appointments

🎯 Performance Metrics:
  • Buffer Ratio: ${bufferAnalysis.ratio}% (${bufferAnalysis.status})
  • Booking Window: ${windowAnalysis.status}
  • Advance Notice: ${noticeAnalysis.status}
  • Efficiency Score: ${efficiency.score}/100 (Grade: ${efficiency.grade})

💡 ${efficiency.message}
  `.trim();
};