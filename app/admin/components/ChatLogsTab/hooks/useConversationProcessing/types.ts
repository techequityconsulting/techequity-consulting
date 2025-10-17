// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/types.ts
// Type definitions for conversation processing
// FIXED: Removed appointmentDetectionSensitivity (now database-driven)

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';

/**
 * Device-specific processing configuration
 * Controls how conversations are processed based on device capabilities
 */
export interface ProcessingConfig {
  maxMessagesForProcessing: number;        // Maximum messages to process
  enableDeepMessageAnalysis: boolean;      // Enable advanced analysis features
  nameExtractionComplexity: 'simple' | 'advanced';  // User name extraction method
  durationCalculationPrecision: 'approximate' | 'precise';  // Duration calculation detail
}

/**
 * Device type enumeration
 */
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

/**
 * Export format options
 */
export type ExportFormat = 'json' | 'csv';

/**
 * Validation result structure
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Deep analysis result structure
 * Returned by performDeepAnalysis function
 */
export interface DeepAnalysisResult {
  averageResponseTime: number;                    // Average response time in seconds
  conversationDepth: number;                       // Number of message exchanges
  userEngagementLevel: 'low' | 'medium' | 'high'; // User engagement score
  detectedIntent: string;                          // Primary user intent
  hasResolution: boolean;                          // Whether conversation resolved
  sentimentIndicator: 'positive' | 'neutral' | 'negative'; // User sentiment
}

/**
 * Processing metrics structure
 */
export interface ProcessingMetrics {
  totalLogs: number;
  processedLogs: number;
  skippedLogs: number;
  processingRatio: number;
  performanceStatus: 'good' | 'warning' | 'critical';
  deviceOptimized: boolean;
  recommendVirtualization: boolean;
  estimatedProcessingTime: number;
}

/**
 * Processing statistics structure
 */
export interface ProcessingStats {
  totalMessages: number;
  uniqueSessions: number;
  processedConversations: number;
  processingEfficiency: number;
  averageMessagesPerConversation: number;
  deviceType: DeviceType;
  processingConfig: ProcessingConfig;
  metrics: ProcessingMetrics;
}

/**
 * Export data structure for JSON exports
 */
export interface ExportData {
  sessionId: string;
  userName: string;
  messageCount: number;
  firstMessage: string;
  lastActivity: string;
  duration: string;
  hasAppointment: boolean;
  deviceProcessed: DeviceType;
  processingTimestamp: string;
}

/**
 * Performance threshold configuration by device
 */
export interface PerformanceThresholds {
  warning: number;
  critical: number;
}

/**
 * Performance thresholds map
 */
export interface PerformanceThresholdsMap {
  mobile: PerformanceThresholds;
  tablet: PerformanceThresholds;
  desktop: PerformanceThresholds;
}

/**
 * Batch size configuration by device
 */
export interface BatchSizes {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Display limits for conversations by device
 */
export interface DisplayLimits {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Processing rates per second by device
 */
export interface ProcessingRates {
  mobile: number;
  tablet: number;
  desktop: number;
}

/**
 * Intent keywords mapping
 */
export interface IntentKeywords {
  [intent: string]: string[];
}

/**
 * Sentiment keywords structure
 */
export interface SentimentKeywords {
  positive: string[];
  negative: string[];
}

/**
 * Resolution keywords array
 */
export type ResolutionKeywords = string[];

/**
 * Error information structure
 */
export interface ErrorInfo {
  context: string;
  deviceType: DeviceType;
  error: string;
  timestamp: string;
  chatLogsCount: number;
  userAgent: string;
}

/**
 * Conversation priority calculation result
 */
export interface ConversationPriority {
  conversation: ConversationBox;
  priority: number;
}

/**
 * CSV row structure for exports
 */
export interface CSVRow {
  [key: string]: string | number | boolean;
}

/**
 * Question extraction depth level
 */
export type QuestionExtractionDepth = 'simple' | 'moderate' | 'advanced';

/**
 * Common stop words for text analysis
 */
export type StopWords = string[];

/**
 * User message extraction options
 */
export interface MessageExtractionOptions {
  minLength?: number;
  excludeNames?: boolean;
  excludeGreetings?: boolean;
}

/**
 * Duration format options
 */
export interface DurationFormatOptions {
  precision: 'approximate' | 'precise';
  includeSeconds?: boolean;
}

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  enableEngagementAnalysis: boolean;
  enableIntentDetection: boolean;
  enableSentimentAnalysis: boolean;
  enableResolutionDetection: boolean;
}

/**
 * Conversation filter criteria
 */
export interface ConversationFilterCriteria {
  hasAppointment?: boolean;
  minMessages?: number;
  maxMessages?: number;
  dateFrom?: Date;
  dateTo?: Date;
  engagementLevel?: 'low' | 'medium' | 'high';
  sentiment?: 'positive' | 'neutral' | 'negative';
}