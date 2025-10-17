// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/metricsUtils.ts
// Performance metrics and processing statistics utilities

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';
import { 
  ProcessingConfig, 
  ProcessingMetrics, 
  ProcessingStats,
  DeviceType 
} from './types';
import { getPerformanceThreshold, getProcessingRate } from './configUtils';

/**
 * Get processing performance metrics
 * Analyzes efficiency and provides recommendations
 */
export const getProcessingMetrics = (
  totalLogs: number,
  config: ProcessingConfig,
  deviceType: DeviceType
): ProcessingMetrics => {
  const processedLogs = Math.min(totalLogs, config.maxMessagesForProcessing);
  const skippedLogs = totalLogs - processedLogs;
  const processingRatio = totalLogs > 0 ? processedLogs / totalLogs : 1;
  
  // Get device-specific thresholds
  const threshold = getPerformanceThreshold(deviceType);
  
  // Determine performance status
  let performanceStatus: 'good' | 'warning' | 'critical' = 'good';
  if (totalLogs > threshold.critical) {
    performanceStatus = 'critical';
  } else if (totalLogs > threshold.warning) {
    performanceStatus = 'warning';
  }
  
  // Estimate processing time
  const estimatedTime = calculateEstimatedProcessingTime(totalLogs, deviceType);
  
  // Should recommend virtualization for large datasets
  const recommendVirtualization = totalLogs > threshold.warning;
  
  return {
    totalLogs,
    processedLogs,
    skippedLogs,
    processingRatio: Math.round(processingRatio * 100),
    performanceStatus,
    deviceOptimized: true,
    recommendVirtualization,
    estimatedProcessingTime: estimatedTime
  };
};

/**
 * Calculate estimated processing time in seconds
 * Based on device capabilities and data volume
 */
export const calculateEstimatedProcessingTime = (
  logCount: number,
  deviceType: DeviceType
): number => {
  const rate = getProcessingRate(deviceType);
  return Math.ceil(logCount / rate);
};

/**
 * Get comprehensive processing statistics
 */
export const getProcessingStats = (
  chatLogs: ChatLog[],
  conversations: ConversationBox[],
  deviceType: DeviceType,
  config: ProcessingConfig,
  getMetricsFn: () => ProcessingMetrics
): ProcessingStats => {
  const uniqueSessions = new Set(chatLogs.map(log => log.sessionId)).size;
  const totalMessages = chatLogs.length;
  const processedConversations = conversations.length;
  
  const processingEfficiency = processedConversations / Math.max(uniqueSessions, 1);
  const averageMessagesPerConversation = totalMessages / Math.max(processedConversations, 1);
  
  const metrics = getMetricsFn();
  
  return {
    totalMessages,
    uniqueSessions,
    processedConversations,
    processingEfficiency: Math.round(processingEfficiency * 100) / 100,
    averageMessagesPerConversation: Math.round(averageMessagesPerConversation * 10) / 10,
    deviceType,
    processingConfig: config,
    metrics
  };
};

/**
 * Calculate conversation processing rate
 * Returns conversations processed per second
 */
export const calculateProcessingRate = (
  conversationsProcessed: number,
  elapsedTimeMs: number
): number => {
  if (elapsedTimeMs === 0) return 0;
  
  const seconds = elapsedTimeMs / 1000;
  return Math.round((conversationsProcessed / seconds) * 100) / 100;
};

/**
 * Get memory usage estimate for conversations
 * Returns estimated memory in MB
 */
export const estimateMemoryUsage = (conversations: ConversationBox[]): number => {
  if (conversations.length === 0) return 0;
  
  // Rough estimate: average conversation size in bytes
  const sampleConv = conversations[0];
  const sampleSize = JSON.stringify(sampleConv).length;
  
  const totalBytes = sampleSize * conversations.length;
  const megabytes = totalBytes / (1024 * 1024);
  
  return Math.round(megabytes * 100) / 100;
};

/**
 * Benchmark processing performance
 * Useful for optimization testing
 */
export const benchmarkProcessing = (
  processFunc: () => void,
  iterations: number = 1
): {
  averageTime: number;
  minTime: number;
  maxTime: number;
  totalTime: number;
} => {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    processFunc();
    const end = performance.now();
    times.push(end - start);
  }
  
  const totalTime = times.reduce((sum, time) => sum + time, 0);
  const averageTime = totalTime / iterations;
  const minTime = Math.min(...times);
  const maxTime = Math.max(...times);
  
  return {
    averageTime: Math.round(averageTime * 100) / 100,
    minTime: Math.round(minTime * 100) / 100,
    maxTime: Math.round(maxTime * 100) / 100,
    totalTime: Math.round(totalTime * 100) / 100
  };
};

/**
 * Get data quality metrics
 */
export const getDataQualityMetrics = (conversations: ConversationBox[]): {
  completenessScore: number;
  validityScore: number;
  consistencyScore: number;
  overallQuality: number;
} => {
  if (conversations.length === 0) {
    return {
      completenessScore: 0,
      validityScore: 0,
      consistencyScore: 0,
      overallQuality: 0
    };
  }
  
  // Completeness: % of conversations with all required fields
  const completeConversations = conversations.filter(conv => 
    conv.sessionId &&
    conv.userName &&
    conv.messageCount > 0 &&
    conv.firstMessage &&
    conv.lastActivity &&
    conv.duration &&
    conv.messages.length > 0
  ).length;
  const completenessScore = (completeConversations / conversations.length) * 100;
  
  // Validity: % of conversations with valid data types and formats
  const validConversations = conversations.filter(conv => {
    const hasValidTimestamp = !isNaN(new Date(conv.lastActivity).getTime());
    const hasValidDuration = /^\d+m$|^\d+h( \d+m)?$/.test(conv.duration);
    const hasValidMessageCount = conv.messageCount === conv.messages.length;
    
    return hasValidTimestamp && hasValidDuration && hasValidMessageCount;
  }).length;
  const validityScore = (validConversations / conversations.length) * 100;
  
  // Consistency: % of conversations with consistent data relationships
  const consistentConversations = conversations.filter(conv => {
    if (conv.messages.length === 0) return false;
    
    const firstMsgTime = new Date(conv.messages[0].timestamp).getTime();
    const lastActivityTime = new Date(conv.lastActivity).getTime();
    const isConsistent = lastActivityTime >= firstMsgTime;
    
    return isConsistent;
  }).length;
  const consistencyScore = (consistentConversations / conversations.length) * 100;
  
  // Overall quality is average of all scores
  const overallQuality = (completenessScore + validityScore + consistencyScore) / 3;
  
  return {
    completenessScore: Math.round(completenessScore),
    validityScore: Math.round(validityScore),
    consistencyScore: Math.round(consistencyScore),
    overallQuality: Math.round(overallQuality)
  };
};

/**
 * Track processing progress
 */
export const createProgressTracker = () => {
  let startTime = 0;
  let processedCount = 0;
  let totalCount = 0;
  
  return {
    start: (total: number) => {
      startTime = Date.now();
      processedCount = 0;
      totalCount = total;
    },
    
    update: (processed: number) => {
      processedCount = processed;
    },
    
    getProgress: (): {
      percentage: number;
      elapsedMs: number;
      remainingMs: number;
      rate: number;
    } => {
      const elapsedMs = Date.now() - startTime;
      const percentage = totalCount > 0 ? (processedCount / totalCount) * 100 : 0;
      const rate = elapsedMs > 0 ? (processedCount / (elapsedMs / 1000)) : 0;
      
      const remainingItems = totalCount - processedCount;
      const remainingMs = rate > 0 ? (remainingItems / rate) * 1000 : 0;
      
      return {
        percentage: Math.round(percentage),
        elapsedMs,
        remainingMs: Math.round(remainingMs),
        rate: Math.round(rate * 100) / 100
      };
    }
  };
};

/**
 * Calculate batch processing efficiency
 */
export const calculateBatchEfficiency = (
  batchSize: number,
  totalItems: number,
  processingTimeMs: number
): {
  batchCount: number;
  itemsPerBatch: number;
  timePerBatch: number;
  timePerItem: number;
  efficiency: number;
} => {
  const batchCount = Math.ceil(totalItems / batchSize);
  const itemsPerBatch = totalItems / batchCount;
  const timePerBatch = processingTimeMs / batchCount;
  const timePerItem = processingTimeMs / totalItems;
  
  // Efficiency: how close to optimal batch size
  const optimalUtilization = itemsPerBatch / batchSize;
  const efficiency = Math.round(optimalUtilization * 100);
  
  return {
    batchCount,
    itemsPerBatch: Math.round(itemsPerBatch),
    timePerBatch: Math.round(timePerBatch),
    timePerItem: Math.round(timePerItem * 100) / 100,
    efficiency
  };
};

/**
 * Get performance recommendations
 */
export const getPerformanceRecommendations = (
  metrics: ProcessingMetrics,
  conversations: ConversationBox[]
): string[] => {
  const recommendations: string[] = [];
  
  // Based on performance status
  if (metrics.performanceStatus === 'critical') {
    recommendations.push('Consider implementing pagination or infinite scroll');
    recommendations.push('Enable data virtualization for improved performance');
    recommendations.push('Reduce the number of visible conversations');
  } else if (metrics.performanceStatus === 'warning') {
    recommendations.push('Monitor performance as data volume increases');
    recommendations.push('Consider implementing lazy loading');
  }
  
  // Based on processing ratio
  if (metrics.processingRatio < 80) {
    recommendations.push(`Only ${metrics.processingRatio}% of logs are being processed`);
    recommendations.push('Consider increasing maxMessagesForProcessing limit');
  }
  
  // Based on memory usage
  const memoryUsage = estimateMemoryUsage(conversations);
  if (memoryUsage > 50) {
    recommendations.push(`Estimated memory usage: ${memoryUsage}MB`);
    recommendations.push('Consider implementing conversation archiving');
  }
  
  // Based on data quality
  const quality = getDataQualityMetrics(conversations);
  if (quality.overallQuality < 80) {
    recommendations.push(`Data quality score: ${quality.overallQuality}%`);
    recommendations.push('Review data validation and sanitization processes');
  }
  
  return recommendations;
};

/**
 * Log performance metrics
 */
export const logPerformanceMetrics = (
  metrics: ProcessingMetrics,
  stats: ProcessingStats,
  deviceType: DeviceType
): void => {
  if (deviceType === 'desktop') {
    console.log('=== Processing Performance Metrics ===');
    console.log(`Device: ${deviceType}`);
    console.log(`Total Logs: ${metrics.totalLogs}`);
    console.log(`Processed: ${metrics.processedLogs} (${metrics.processingRatio}%)`);
    console.log(`Status: ${metrics.performanceStatus.toUpperCase()}`);
    console.log(`Est. Time: ${metrics.estimatedProcessingTime}s`);
    console.log(`Efficiency: ${stats.processingEfficiency}`);
    console.log(`Avg Msgs/Conv: ${stats.averageMessagesPerConversation}`);
    console.log('====================================');
  } else if (deviceType === 'mobile') {
    console.log(`[Mobile] Processed ${metrics.processedLogs} logs, Status: ${metrics.performanceStatus}`);
  }
};

/**
 * Compare performance between runs
 */
export const comparePerformance = (
  previousMetrics: ProcessingMetrics,
  currentMetrics: ProcessingMetrics
): {
  improvementPercentage: number;
  isImproved: boolean;
  details: string[];
} => {
  const details: string[] = [];
  
  // Compare processing time
  const timeDiff = currentMetrics.estimatedProcessingTime - previousMetrics.estimatedProcessingTime;
  const timeImprovement = (timeDiff / previousMetrics.estimatedProcessingTime) * 100;
  
  if (timeDiff < 0) {
    details.push(`Processing time improved by ${Math.abs(Math.round(timeImprovement))}%`);
  } else if (timeDiff > 0) {
    details.push(`Processing time increased by ${Math.round(timeImprovement)}%`);
  }
  
  // Compare processing ratio
  const ratioDiff = currentMetrics.processingRatio - previousMetrics.processingRatio;
  if (ratioDiff !== 0) {
    details.push(`Processing ratio changed by ${ratioDiff > 0 ? '+' : ''}${ratioDiff}%`);
  }
  
  // Overall improvement
  const isImproved = timeDiff < 0 && ratioDiff >= 0;
  
  return {
    improvementPercentage: Math.round(Math.abs(timeImprovement)),
    isImproved,
    details
  };
};

/**
 * Get optimization suggestions based on device
 */
export const getOptimizationSuggestions = (deviceType: DeviceType): string[] => {
  const suggestions: string[] = [];
  
  switch (deviceType) {
    case 'mobile':
      suggestions.push('Minimize deep analysis to improve battery life');
      suggestions.push('Use smaller batch sizes for smoother UI');
      suggestions.push('Consider offline caching for frequently accessed data');
      break;
      
    case 'tablet':
      suggestions.push('Balance between performance and feature richness');
      suggestions.push('Enable progressive loading for large datasets');
      suggestions.push('Optimize for both portrait and landscape modes');
      break;
      
    case 'desktop':
      suggestions.push('Leverage full processing capabilities');
      suggestions.push('Enable advanced analysis features');
      suggestions.push('Use larger batch sizes for faster processing');
      break;
  }
  
  return suggestions;
};