// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/validationUtils.ts
// Validation and error handling utilities

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';
import { DeviceType, ValidationResult, ErrorInfo } from './types';

/**
 * Validate chat logs before processing
 * Ensures data integrity and prevents processing errors
 */
export const validateChatLogs = (
  logs: ChatLog[],
  deviceType: DeviceType
): ValidationResult => {
  const errors: string[] = [];
  
  // Check if logs is an array
  if (!Array.isArray(logs)) {
    errors.push('Chat logs must be an array');
    return { isValid: false, errors };
  }
  
  // Empty is valid (just means no data)
  if (logs.length === 0) {
    return { isValid: true, errors: [] };
  }
  
  // Device-specific validation depth
  const validationDepth = deviceType === 'mobile' ? 'basic' : 'thorough';
  
  if (validationDepth === 'basic') {
    // Basic validation for mobile (performance)
    const hasRequiredFields = logs.every(log => 
      log && 
      typeof log === 'object' &&
      log.sessionId &&
      log.timestamp &&
      log.messageType &&
      log.content !== undefined
    );
    
    if (!hasRequiredFields) {
      errors.push('Some logs are missing required fields (sessionId, timestamp, messageType, content)');
    }
  } else {
    // Thorough validation for tablet/desktop
    logs.forEach((log, index) => {
      // Check required fields
      if (!log.sessionId) {
        errors.push(`Log at index ${index} is missing sessionId`);
      }
      
      if (!log.timestamp) {
        errors.push(`Log at index ${index} is missing timestamp`);
      }
      
      if (!log.messageType) {
        errors.push(`Log at index ${index} is missing messageType`);
      } else if (log.messageType !== 'user' && log.messageType !== 'ai') {
        errors.push(`Log at index ${index} has invalid messageType: ${log.messageType}`);
      }
      
      if (log.content === undefined || log.content === null) {
        errors.push(`Log at index ${index} is missing content`);
      }
      
      // Check timestamp validity
      if (log.timestamp) {
        const date = new Date(log.timestamp);
        if (isNaN(date.getTime())) {
          errors.push(`Log at index ${index} has invalid timestamp: ${log.timestamp}`);
        }
      }
      
      // Check sessionId format
      if (log.sessionId && typeof log.sessionId !== 'string') {
        errors.push(`Log at index ${index} has non-string sessionId`);
      }
      
      // Limit errors to prevent overwhelming output
      if (errors.length >= 10) {
        errors.push('... and more validation errors (showing first 10)');
        return;
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate a single conversation
 */
export const validateConversation = (conversation: ConversationBox): ValidationResult => {
  const errors: string[] = [];
  
  if (!conversation.sessionId || conversation.sessionId.trim() === '') {
    errors.push('Conversation missing sessionId');
  }
  
  if (!conversation.userName || conversation.userName.trim() === '') {
    errors.push('Conversation missing userName');
  }
  
  if (conversation.messageCount === 0) {
    errors.push('Conversation has zero messages');
  }
  
  if (!conversation.messages || !Array.isArray(conversation.messages)) {
    errors.push('Conversation messages is not an array');
  } else if (conversation.messages.length !== conversation.messageCount) {
    errors.push(`Message count mismatch: expected ${conversation.messageCount}, got ${conversation.messages.length}`);
  }
  
  if (!conversation.lastActivity) {
    errors.push('Conversation missing lastActivity timestamp');
  }
  
  if (!conversation.duration) {
    errors.push('Conversation missing duration');
  }
  
  if (typeof conversation.hasAppointment !== 'boolean') {
    errors.push('Conversation hasAppointment is not a boolean');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate multiple conversations
 */
export const validateConversations = (conversations: ConversationBox[]): ValidationResult => {
  if (!Array.isArray(conversations)) {
    return {
      isValid: false,
      errors: ['Conversations must be an array']
    };
  }
  
  const allErrors: string[] = [];
  
  conversations.forEach((conv, index) => {
    const result = validateConversation(conv);
    if (!result.isValid) {
      allErrors.push(`Conversation ${index} (${conv.sessionId || 'unknown'}): ${result.errors.join(', ')}`);
    }
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

/**
 * Handle processing errors with context
 */
export const handleProcessingErrors = (
  error: Error,
  context: string,
  deviceType: DeviceType,
  chatLogsCount: number
): ConversationBox[] => {
  console.error(`Conversation processing error in ${context}:`, error);
  
  // Create detailed error information
  const errorInfo: ErrorInfo = {
    context,
    deviceType,
    error: error.message,
    timestamp: new Date().toISOString(),
    chatLogsCount,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
  };
  
  // Device-specific error reporting
  if (deviceType === 'desktop') {
    // More detailed error logging for desktop
    console.warn('Detailed error info:', errorInfo);
    console.warn('Stack trace:', error.stack);
  } else if (deviceType === 'mobile') {
    // Minimal logging for mobile
    console.warn(`Error in ${context}: ${error.message}`);
  }
  
  // Return empty array as safe fallback
  return [];
};

/**
 * Check for data anomalies
 * Detects suspicious patterns that might indicate data issues
 */
export const checkForAnomalies = (conversations: ConversationBox[]): {
  hasAnomalies: boolean;
  warnings: string[];
} => {
  const warnings: string[] = [];
  
  // Check for duplicate session IDs
  const sessionIds = conversations.map(c => c.sessionId);
  const uniqueSessionIds = new Set(sessionIds);
  if (sessionIds.length !== uniqueSessionIds.size) {
    warnings.push('Duplicate session IDs detected');
  }
  
  // Check for conversations with excessive messages
  const tooManyMessages = conversations.filter(c => c.messageCount > 100);
  if (tooManyMessages.length > 0) {
    warnings.push(`${tooManyMessages.length} conversations have over 100 messages`);
  }
  
  // Check for very short conversations
  const tooFewMessages = conversations.filter(c => c.messageCount < 2);
  if (tooFewMessages.length > conversations.length * 0.5) {
    warnings.push('More than 50% of conversations have less than 2 messages');
  }
  
  // Check for future timestamps
  const now = Date.now();
  const futureTimestamps = conversations.filter(c => 
    new Date(c.lastActivity).getTime() > now
  );
  if (futureTimestamps.length > 0) {
    warnings.push(`${futureTimestamps.length} conversations have future timestamps`);
  }
  
  // Check for very old conversations (older than 1 year)
  const oneYearAgo = now - (365 * 24 * 60 * 60 * 1000);
  const veryOld = conversations.filter(c => 
    new Date(c.lastActivity).getTime() < oneYearAgo
  );
  if (veryOld.length > 0) {
    warnings.push(`${veryOld.length} conversations are older than 1 year`);
  }
  
  // Check for anonymous users dominating
  const anonymous = conversations.filter(c => c.userName === 'Anonymous User');
  if (anonymous.length > conversations.length * 0.8) {
    warnings.push('More than 80% of conversations have anonymous users');
  }
  
  return {
    hasAnomalies: warnings.length > 0,
    warnings
  };
};

/**
 * Sanitize conversation data
 * Removes or fixes problematic data
 */
export const sanitizeConversation = (conversation: ConversationBox): ConversationBox => {
  return {
    ...conversation,
    sessionId: conversation.sessionId?.trim() || 'unknown',
    userName: conversation.userName?.trim() || 'Anonymous User',
    messageCount: Math.max(0, conversation.messageCount || 0),
    firstMessage: conversation.firstMessage?.trim() || 'No message',
    lastActivity: conversation.lastActivity || new Date().toISOString(),
    duration: conversation.duration || '0m',
    hasAppointment: Boolean(conversation.hasAppointment),
    messages: Array.isArray(conversation.messages) ? conversation.messages : []
  };
};

/**
 * Sanitize multiple conversations
 */
export const sanitizeConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  if (!Array.isArray(conversations)) {
    return [];
  }
  
  return conversations.map(conv => sanitizeConversation(conv));
};

/**
 * Check if conversation is valid for processing
 */
export const isValidForProcessing = (conversation: ConversationBox): boolean => {
  return !!(
    conversation.sessionId &&
    conversation.userName &&
    conversation.messageCount > 0 &&
    conversation.messages &&
    conversation.messages.length > 0 &&
    conversation.lastActivity
  );
};

/**
 * Filter out invalid conversations
 */
export const filterInvalidConversations = (conversations: ConversationBox[]): {
  valid: ConversationBox[];
  invalid: ConversationBox[];
} => {
  const valid: ConversationBox[] = [];
  const invalid: ConversationBox[] = [];
  
  conversations.forEach(conv => {
    if (isValidForProcessing(conv)) {
      valid.push(conv);
    } else {
      invalid.push(conv);
    }
  });
  
  return { valid, invalid };
};

/**
 * Check data integrity
 * Verifies relationships between data points
 */
export const checkDataIntegrity = (conversation: ConversationBox): {
  isIntegrityValid: boolean;
  issues: string[];
} => {
  const issues: string[] = [];
  
  // Message count should match actual messages
  if (conversation.messages.length !== conversation.messageCount) {
    issues.push(`Message count mismatch: ${conversation.messageCount} vs ${conversation.messages.length}`);
  }
  
  // Last activity should be >= first message timestamp
  if (conversation.messages.length > 0) {
    const firstMessageTime = new Date(conversation.messages[0].timestamp).getTime();
    const lastActivityTime = new Date(conversation.lastActivity).getTime();
    
    if (lastActivityTime < firstMessageTime) {
      issues.push('Last activity is before first message');
    }
  }
  
  // Duration should be reasonable
  const durationMatch = conversation.duration.match(/(\d+)/);
  if (durationMatch) {
    const durationNum = parseInt(durationMatch[1], 10);
    
    // Check for unreasonably long durations (over 24 hours)
    if (conversation.duration.includes('h') && durationNum > 24) {
      issues.push('Duration exceeds 24 hours');
    }
  }
  
  // Appointment ID should exist if hasAppointment is true
  if (conversation.hasAppointment && !conversation.appointmentId) {
    issues.push('Has appointment but missing appointmentId');
  }
  
  return {
    isIntegrityValid: issues.length === 0,
    issues
  };
};

/**
 * Recover from processing errors
 * Attempts to salvage data when errors occur
 */
export const recoverFromError = (
  partialConversations: ConversationBox[],
  error: Error
): ConversationBox[] => {
  console.warn('Attempting to recover from processing error:', error.message);
  
  // Sanitize what we have
  const sanitized = sanitizeConversations(partialConversations);
  
  // Filter out invalid ones
  const { valid } = filterInvalidConversations(sanitized);
  
  console.warn(`Recovered ${valid.length} valid conversations out of ${partialConversations.length}`);
  
  return valid;
};

/**
 * Log validation summary
 */
export const logValidationSummary = (
  conversations: ConversationBox[],
  deviceType: DeviceType
): void => {
  const validation = validateConversations(conversations);
  const anomalies = checkForAnomalies(conversations);
  
  if (deviceType === 'desktop') {
    console.log('=== Validation Summary ===');
    console.log(`Total conversations: ${conversations.length}`);
    console.log(`Validation status: ${validation.isValid ? 'PASSED' : 'FAILED'}`);
    
    if (!validation.isValid) {
      console.log('Validation errors:', validation.errors);
    }
    
    if (anomalies.hasAnomalies) {
      console.log('Anomalies detected:', anomalies.warnings);
    }
    
    console.log('========================');
  }
};