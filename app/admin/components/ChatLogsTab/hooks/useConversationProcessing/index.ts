// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/index.ts
// Main conversation processing hook - orchestrates all processing steps
// FIXED: Database-driven appointment detection (removed keyword-based detection)

import { useMemo, useCallback } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';

// Import all utility modules
import { getProcessingConfig } from './configUtils';
import { 
  extractUserName, 
  findMeaningfulUserMessage, 
  calculateDuration 
} from './extractionUtils';
import { processConversationsInBatches } from './processingUtils';
import { enrichConversations } from './enrichmentUtils';
import { performDeepAnalysis } from './analysisUtils';
import { 
  sortConversations, 
  filterConversationsForPerformance,
  calculateConversationPriority 
} from './sortingUtils';
import { exportProcessedData } from './exportUtils';
import { 
  validateChatLogs, 
  handleProcessingErrors 
} from './validationUtils';
import { 
  getProcessingMetrics,
  getProcessingStats,
  calculateEstimatedProcessingTime
} from './metricsUtils';

/**
 * Main hook for processing chat logs into conversation summaries
 * Handles device-aware processing, enrichment, and analysis
 * Now uses database-driven appointment detection (no keyword matching)
 */
export const useConversationProcessing = (chatLogs: ChatLog[]) => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();

  // Get device-specific processing configuration
  const processingConfig = useMemo(() => {
    return getProcessingConfig(deviceType);
  }, [deviceType]);

  // Main processing pipeline with error boundaries
  const conversations = useMemo(() => {
    try {
      // Step 0: Validate input
      const validation = validateChatLogs(chatLogs, deviceType);
      if (!validation.isValid) {
        console.error('Chat logs validation failed:', validation.errors);
        return [];
      }
      
      if (chatLogs.length === 0) {
        return [];
      }
      
      let processedConversations: ConversationBox[] = [];
      
      try {
        // Step 1: Process conversations in batches
        processedConversations = processConversationsInBatches(
          chatLogs,
          deviceType,
          processingConfig,
          extractUserName
        );
      } catch (error) {
        return handleProcessingErrors(error as Error, 'batch-processing', deviceType, chatLogs.length);
      }
      
      try {
        // Step 2: Enrich conversations with metadata and analysis
        // NOTE: Appointment detection is NOT done here - it's handled by database lookup
        processedConversations = enrichConversations(
          processedConversations,
          processingConfig,
          findMeaningfulUserMessage,
          calculateDuration,
          performDeepAnalysis
        );
      } catch (error) {
        console.warn('Conversation enrichment failed, using basic data:', error);
        // Continue with basic conversation data if enrichment fails
      }
      
      try {
        // Step 3: Sort conversations by recency
        processedConversations = sortConversations(processedConversations);
      } catch (error) {
        console.warn('Conversation sorting failed, using unsorted data:', error);
        // Continue with unsorted data if sorting fails
      }
      
      try {
        // Step 4: Apply performance filtering based on device
        processedConversations = filterConversationsForPerformance(
          processedConversations,
          deviceType,
          calculateConversationPriority
        );
      } catch (error) {
        console.warn('Performance filtering failed, using unfiltered data:', error);
        // Continue with all data if filtering fails
      }
      
      return processedConversations;
      
    } catch (error) {
      return handleProcessingErrors(error as Error, 'main-processing', deviceType, chatLogs.length);
    }
  }, [
    chatLogs,
    deviceType,
    processingConfig
  ]);

  // Export functionality
  const exportProcessedDataFunc = useCallback((format: 'json' | 'csv' = 'json') => {
    exportProcessedData(conversations, deviceType, format);
  }, [conversations, deviceType]);

  // Processing metrics
  const getMetrics = useCallback(() => {
    return getProcessingMetrics(
      chatLogs.length,
      processingConfig,
      deviceType
    );
  }, [chatLogs.length, processingConfig, deviceType]);

  // Processing statistics
  const getStats = useCallback(() => {
    return getProcessingStats(
      chatLogs,
      conversations,
      deviceType,
      processingConfig,
      getMetrics
    );
  }, [chatLogs, conversations, deviceType, processingConfig, getMetrics]);

  // Return processed data and utility functions
  return {
    // Main processed data
    conversations,
    
    // Processing metadata
    processingConfig,
    deviceType,
    isTouchDevice,
    
    // Utility functions
    getProcessingStats: getStats,
    getProcessingMetrics: getMetrics,
    exportProcessedData: exportProcessedDataFunc,
    
    // Validation and error handling
    validateChatLogs: (logs: ChatLog[]) => validateChatLogs(logs, deviceType),
    handleProcessingErrors: (error: Error, context: string) => 
      handleProcessingErrors(error, context, deviceType, chatLogs.length)
  };
};