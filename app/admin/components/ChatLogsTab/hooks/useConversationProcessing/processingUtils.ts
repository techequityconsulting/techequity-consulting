// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/processingUtils.ts
// Batch processing and conversation grouping utilities

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';
import { ProcessingConfig, DeviceType } from './types';
import { getBatchSize } from './configUtils';

/**
 * Process chat logs into conversation summaries in batches
 * Prevents UI freezing by processing in device-appropriate chunks
 * Groups messages by sessionId and aggregates metadata
 */
export const processConversationsInBatches = (
  logs: ChatLog[],
  deviceType: DeviceType,
  config: ProcessingConfig,
  extractUserNameFn: (log: ChatLog) => string
): ConversationBox[] => {
  const conversationMap = new Map<string, ConversationBox>();
  
  // Get device-specific batch size
  const batchSize = getBatchSize(deviceType);
  const totalLogs = Math.min(logs.length, config.maxMessagesForProcessing);
  
  console.log(`Processing ${totalLogs} logs in batches of ${batchSize} for ${deviceType}`);
  
  // Process logs in batches to prevent UI freezing
  for (let i = 0; i < totalLogs; i += batchSize) {
    const batch = logs.slice(i, i + batchSize);
    
    batch.forEach(log => {
      const currentUserName = extractUserNameFn(log);
      
      // Create new conversation entry if it doesn't exist
      if (!conversationMap.has(log.sessionId)) {
        conversationMap.set(log.sessionId, {
          sessionId: log.sessionId,
          userName: currentUserName,
          messageCount: 0,
          firstMessage: '',
          lastActivity: log.timestamp,
          duration: '0m',
          hasAppointment: false, // Will be set by database lookup in sessionUtils
          messages: []
        });
      }

      const conversation = conversationMap.get(log.sessionId)!;
      
      // Update userName if current message has better user information
      // Priority: Actual user name > Anonymous User
      if (currentUserName !== 'Anonymous User' && 
          (conversation.userName === 'Anonymous User' || !conversation.userName)) {
        conversation.userName = currentUserName;
      }
      
      // Add message to conversation
      conversation.messages.push(log);
      conversation.messageCount++;
      
      // Update last activity with timestamp handling
      const logTime = new Date(log.timestamp);
      const currentLastActivity = new Date(conversation.lastActivity);
      
      if (logTime > currentLastActivity) {
        conversation.lastActivity = log.timestamp;
      }
    });
  }
  
  const conversations = Array.from(conversationMap.values());
  console.log(`Processed ${conversations.length} unique conversations`);
  
  return conversations;
};

/**
 * Group messages by session ID
 * Returns a map of sessionId -> messages
 */
export const groupMessagesBySession = (logs: ChatLog[]): Map<string, ChatLog[]> => {
  const sessionMap = new Map<string, ChatLog[]>();
  
  logs.forEach(log => {
    if (!sessionMap.has(log.sessionId)) {
      sessionMap.set(log.sessionId, []);
    }
    sessionMap.get(log.sessionId)!.push(log);
  });
  
  return sessionMap;
};

/**
 * Sort messages within each conversation by timestamp
 * Ensures chronological order
 */
export const sortConversationMessages = (conversation: ConversationBox): ConversationBox => {
  conversation.messages.sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  return conversation;
};

/**
 * Sort all conversations' messages by timestamp
 */
export const sortAllConversationsMessages = (conversations: ConversationBox[]): ConversationBox[] => {
  return conversations.map(conv => sortConversationMessages(conv));
};

/**
 * Filter out conversations with insufficient data
 * Removes conversations that don't meet minimum quality thresholds
 */
export const filterLowQualityConversations = (
  conversations: ConversationBox[],
  minMessages: number = 1
): ConversationBox[] => {
  return conversations.filter(conv => {
    // Must have at least minimum number of messages
    if (conv.messageCount < minMessages) return false;
    
    // Must have a valid session ID
    if (!conv.sessionId || conv.sessionId.trim() === '') return false;
    
    // Must have at least some message content
    if (conv.messages.length === 0) return false;
    
    return true;
  });
};

/**
 * Deduplicate conversations by session ID
 * Keeps the most recent version if duplicates exist
 */
export const deduplicateConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  const uniqueMap = new Map<string, ConversationBox>();
  
  conversations.forEach(conv => {
    const existing = uniqueMap.get(conv.sessionId);
    
    if (!existing) {
      uniqueMap.set(conv.sessionId, conv);
    } else {
      // Keep the one with more messages or more recent activity
      const existingTime = new Date(existing.lastActivity).getTime();
      const currentTime = new Date(conv.lastActivity).getTime();
      
      if (conv.messageCount > existing.messageCount || currentTime > existingTime) {
        uniqueMap.set(conv.sessionId, conv);
      }
    }
  });
  
  return Array.from(uniqueMap.values());
};

/**
 * Merge conversations that might be from the same session
 * Handles cases where session IDs might have been regenerated
 */
export const mergeRelatedConversations = (
  conversations: ConversationBox[],
  timeDifferenceThreshold: number = 300000 // 5 minutes in milliseconds
): ConversationBox[] => {
  // Sort by timestamp first
  const sorted = [...conversations].sort((a, b) => 
    new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
  );
  
  const merged: ConversationBox[] = [];
  let currentGroup: ConversationBox | null = null;
  
  sorted.forEach(conv => {
    if (!currentGroup) {
      currentGroup = { ...conv };
      return;
    }
    
    const timeDiff = Math.abs(
      new Date(conv.lastActivity).getTime() - 
      new Date(currentGroup.lastActivity).getTime()
    );
    
    // If same user and close in time, consider merging
    if (conv.userName === currentGroup.userName && timeDiff < timeDifferenceThreshold) {
      // Merge messages
      currentGroup.messages.push(...conv.messages);
      currentGroup.messageCount += conv.messageCount;
      currentGroup.lastActivity = conv.lastActivity;
      currentGroup.hasAppointment = currentGroup.hasAppointment || conv.hasAppointment;
    } else {
      // Start new group
      merged.push(currentGroup);
      currentGroup = { ...conv };
    }
  });
  
  if (currentGroup) {
    merged.push(currentGroup);
  }
  
  return merged;
};

/**
 * Split large conversations that might span multiple sessions
 * Useful when a user returns after a long gap
 */
export const splitLargeConversations = (
  conversations: ConversationBox[],
  maxGapMinutes: number = 60
): ConversationBox[] => {
  const result: ConversationBox[] = [];
  
  conversations.forEach(conv => {
    if (conv.messages.length <= 1) {
      result.push(conv);
      return;
    }
    
    // Sort messages first
    const sortedMessages = [...conv.messages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    let currentBatch: ChatLog[] = [sortedMessages[0]];
    let batchCount = 0;
    
    for (let i = 1; i < sortedMessages.length; i++) {
      const prevTime = new Date(sortedMessages[i - 1].timestamp).getTime();
      const currTime = new Date(sortedMessages[i].timestamp).getTime();
      const gapMinutes = (currTime - prevTime) / (1000 * 60);
      
      if (gapMinutes > maxGapMinutes) {
        // Create new conversation from current batch
        batchCount++;
        result.push({
          ...conv,
          sessionId: `${conv.sessionId}_split_${batchCount}`,
          messages: currentBatch,
          messageCount: currentBatch.length,
          lastActivity: currentBatch[currentBatch.length - 1].timestamp
        });
        currentBatch = [sortedMessages[i]];
      } else {
        currentBatch.push(sortedMessages[i]);
      }
    }
    
    // Add remaining batch
    if (currentBatch.length > 0) {
      if (batchCount > 0) {
        batchCount++;
        result.push({
          ...conv,
          sessionId: `${conv.sessionId}_split_${batchCount}`,
          messages: currentBatch,
          messageCount: currentBatch.length,
          lastActivity: currentBatch[currentBatch.length - 1].timestamp
        });
      } else {
        result.push(conv);
      }
    }
  });
  
  return result;
};

/**
 * Calculate processing progress
 * Returns percentage of logs processed
 */
export const calculateProcessingProgress = (
  processedCount: number,
  totalCount: number
): number => {
  if (totalCount === 0) return 100;
  return Math.round((processedCount / totalCount) * 100);
};

/**
 * Estimate remaining processing time
 */
export const estimateRemainingTime = (
  processedCount: number,
  totalCount: number,
  elapsedMs: number
): number => {
  if (processedCount === 0) return 0;
  
  const avgTimePerItem = elapsedMs / processedCount;
  const remainingItems = totalCount - processedCount;
  
  return Math.round(avgTimePerItem * remainingItems);
};