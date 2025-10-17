// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/configUtils.ts
// Device-specific processing configurations
// FIXED: Removed appointmentDetectionSensitivity (now database-driven)

import { 
  ProcessingConfig, 
  DeviceType, 
  PerformanceThresholdsMap,
  BatchSizes,
  DisplayLimits,
  ProcessingRates
} from './types';

/**
 * Get device-specific processing configuration
 * Each device type has optimized settings for performance
 */
export const getProcessingConfig = (deviceType: DeviceType): ProcessingConfig => {
  switch (deviceType) {
    case 'mobile':
      return {
        maxMessagesForProcessing: 500,      // Lower limit for mobile performance
        enableDeepMessageAnalysis: false,   // Skip complex analysis on mobile
        nameExtractionComplexity: 'simple',
        durationCalculationPrecision: 'approximate'
      };
    
    case 'tablet':
      return {
        maxMessagesForProcessing: 1000,     // Moderate limit for tablet
        enableDeepMessageAnalysis: true,    // Enable some analysis
        nameExtractionComplexity: 'simple',
        durationCalculationPrecision: 'approximate'
      };
    
    case 'desktop':
      return {
        maxMessagesForProcessing: 5000,     // Higher limit for desktop
        enableDeepMessageAnalysis: true,    // Full analysis capabilities
        nameExtractionComplexity: 'advanced',
        durationCalculationPrecision: 'precise'
      };
    
    default:
      // Fallback to conservative settings
      return {
        maxMessagesForProcessing: 1000,
        enableDeepMessageAnalysis: false,
        nameExtractionComplexity: 'simple',
        durationCalculationPrecision: 'approximate'
      };
  }
};

/**
 * Performance thresholds by device type
 * Used to determine when to warn about performance issues
 */
export const PERFORMANCE_THRESHOLDS: PerformanceThresholdsMap = {
  mobile: { 
    warning: 200,    // Warn when processing > 200 logs
    critical: 500    // Critical when processing > 500 logs
  },
  tablet: { 
    warning: 500,    // Warn when processing > 500 logs
    critical: 1000   // Critical when processing > 1000 logs
  },
  desktop: { 
    warning: 1000,   // Warn when processing > 1000 logs
    critical: 2500   // Critical when processing > 2500 logs
  }
};

/**
 * Batch sizes for processing by device
 * Smaller batches prevent UI freezing on mobile
 */
export const BATCH_SIZES: BatchSizes = {
  mobile: 50,     // Process 50 logs at a time
  tablet: 100,    // Process 100 logs at a time
  desktop: 200    // Process 200 logs at a time
};

/**
 * Display limits for conversations by device
 * Prevents rendering too many items and slowing down UI
 */
export const DISPLAY_LIMITS: DisplayLimits = {
  mobile: 50,     // Show max 50 conversations
  tablet: 100,    // Show max 100 conversations
  desktop: 500    // Show max 500 conversations
};

/**
 * Processing rates per second by device
 * Used to estimate processing time
 */
export const PROCESSING_RATES: ProcessingRates = {
  mobile: 50,     // Can process ~50 logs/second
  tablet: 100,    // Can process ~100 logs/second
  desktop: 200    // Can process ~200 logs/second
};

/**
 * Get performance threshold for specific device
 */
export const getPerformanceThreshold = (deviceType: DeviceType) => {
  return PERFORMANCE_THRESHOLDS[deviceType];
};

/**
 * Get batch size for specific device
 */
export const getBatchSize = (deviceType: DeviceType): number => {
  return BATCH_SIZES[deviceType];
};

/**
 * Get display limit for specific device
 */
export const getDisplayLimit = (deviceType: DeviceType): number => {
  return DISPLAY_LIMITS[deviceType];
};

/**
 * Get processing rate for specific device
 */
export const getProcessingRate = (deviceType: DeviceType): number => {
  return PROCESSING_RATES[deviceType];
};

/**
 * Check if deep analysis should be enabled for device
 */
export const shouldEnableDeepAnalysis = (deviceType: DeviceType): boolean => {
  const config = getProcessingConfig(deviceType);
  return config.enableDeepMessageAnalysis;
};

/**
 * Check if advanced name extraction should be used
 */
export const shouldUseAdvancedNameExtraction = (deviceType: DeviceType): boolean => {
  const config = getProcessingConfig(deviceType);
  return config.nameExtractionComplexity === 'advanced';
};

/**
 * Check if precise duration calculation should be used
 */
export const shouldUsePreciseDuration = (deviceType: DeviceType): boolean => {
  const config = getProcessingConfig(deviceType);
  return config.durationCalculationPrecision === 'precise';
};

/**
 * Get maximum messages that can be processed for device
 */
export const getMaxMessagesForDevice = (deviceType: DeviceType): number => {
  const config = getProcessingConfig(deviceType);
  return config.maxMessagesForProcessing;
};