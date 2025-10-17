// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/extractionUtils.ts
// User name extraction, meaningful message finding, and duration calculation utilities

import { ChatLog } from '../../../../types';
import { ProcessingConfig, MessageExtractionOptions } from './types';

/**
 * Extract user name from chat log with fallback strategies
 * Prioritizes userInfo fields over message content
 */
export const extractUserName = (log: ChatLog): string => {
  // Priority 1: userName field
  if (log.userInfo?.userName) {
    return log.userInfo.userName;
  }
  
  // Priority 2: firstName + lastName
  if (log.userInfo?.firstName && log.userInfo?.lastName) {
    return `${log.userInfo.firstName} ${log.userInfo.lastName}`;
  }
  
  // Priority 3: firstName only
  if (log.userInfo?.firstName) {
    return log.userInfo.firstName;
  }
  
  // Priority 4: Extract from message content (fallback)
  const nameMatch = log.content?.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  if (nameMatch) {
    return nameMatch[0];
  }
  
  // Default fallback
  return 'Anonymous User';
};

/**
 * Find the first meaningful user message in a conversation
 * Skips simple greetings and name-only responses
 */
export const findMeaningfulUserMessage = (
  messages: ChatLog[],
  config: ProcessingConfig,
  options: MessageExtractionOptions = {}
): string => {
  const {
    minLength = 10,
    excludeNames = true,
    excludeGreetings = true
  } = options;

  if (config.nameExtractionComplexity === 'simple') {
    // Simple extraction for mobile/tablet
    const meaningfulMessage = messages.find(msg => 
      msg.messageType === 'user' && 
      msg.content.length > minLength &&
      (!excludeNames || !msg.content.match(/^[A-Za-z]+\s+[A-Za-z]+$/))
    );
    
    return meaningfulMessage?.content || 
           messages.find(msg => msg.messageType === 'user')?.content || 
           'Session started';
  } else {
    // Advanced extraction for desktop
    const meaningfulMessages = messages.filter(msg => msg.messageType === 'user');
    
    // Skip simple name responses
    const nonNameMessages = meaningfulMessages.filter(msg => 
      !msg.content.match(/^[A-Za-z]+\s*[A-Za-z]*$/) &&
      msg.content.length > 5
    );
    
    if (nonNameMessages.length > 0) {
      // Find the first substantive message
      const substantiveMessage = nonNameMessages.find(msg => 
        msg.content.length > 15 &&
        (!excludeGreetings || !msg.content.match(/^(hi|hello|hey|yes|no|ok|okay|thanks|thank you)$/i))
      );
      
      return substantiveMessage?.content || nonNameMessages[0].content;
    }
    
    return meaningfulMessages[0]?.content || 'Session started';
  }
};

/**
 * Calculate conversation duration based on first and last messages
 * Returns formatted duration string based on device precision settings
 */
export const calculateDuration = (
  messages: ChatLog[],
  config: ProcessingConfig
): string => {
  if (messages.length < 2) return '0m';
  
  const firstMsg = messages[0];
  const lastMsg = messages[messages.length - 1];
  
  const startTime = new Date(firstMsg.timestamp).getTime();
  const endTime = new Date(lastMsg.timestamp).getTime();
  const diffMilliseconds = endTime - startTime;
  
  if (config.durationCalculationPrecision === 'approximate') {
    // Approximate calculation for mobile/tablet
    const diffMinutes = Math.round(diffMilliseconds / (1000 * 60));
    
    if (diffMinutes < 1) return '< 1m';
    if (diffMinutes >= 60) {
      const hours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${diffMinutes}m`;
  } else {
    // Precise calculation for desktop
    const diffSeconds = Math.floor(diffMilliseconds / 1000);
    
    if (diffSeconds < 60) return '< 1m';
    
    const diffMinutes = Math.floor(diffSeconds / 60);
    const remainingSeconds = diffSeconds % 60;
    
    if (diffMinutes < 60) {
      // Round up if more than 30 seconds
      if (remainingSeconds > 30) {
        return `${diffMinutes + 1}m`;
      }
      return `${diffMinutes}m`;
    }
    
    const hours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${remainingMinutes}m`;
    }
  }
};

/**
 * Parse duration string to minutes for sorting/comparison
 * Handles formats like "1h 30m", "45m", "2h"
 */
export const parseDurationToMinutes = (duration: string): number => {
  if (duration === '< 1m') return 0;
  if (duration === '0m') return 0;
  
  // Match hours
  const hoursMatch = duration.match(/(\d+)h/);
  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  
  // Match minutes
  const minutesMatch = duration.match(/(\d+)m/);
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;
  
  return hours * 60 + minutes;
};

/**
 * Format duration from minutes to readable string
 * Used for display purposes
 */
export const formatDurationFromMinutes = (minutes: number, precise: boolean = false): string => {
  if (minutes < 1) return '< 1m';
  
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (precise && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (remainingMinutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${remainingMinutes}m`;
  }
};

/**
 * Extract all unique user names from a set of messages
 * Useful for conversation participant analysis
 */
export const extractAllUserNames = (messages: ChatLog[]): string[] => {
  const names = new Set<string>();
  
  messages.forEach(msg => {
    const name = extractUserName(msg);
    if (name !== 'Anonymous User') {
      names.add(name);
    }
  });
  
  return Array.from(names);
};

/**
 * Find the most common user name in a conversation
 * Used when multiple names appear in the same session
 */
export const findMostCommonUserName = (messages: ChatLog[]): string => {
  const nameCounts = new Map<string, number>();
  
  messages.forEach(msg => {
    const name = extractUserName(msg);
    if (name !== 'Anonymous User') {
      nameCounts.set(name, (nameCounts.get(name) || 0) + 1);
    }
  });
  
  if (nameCounts.size === 0) {
    return 'Anonymous User';
  }
  
  // Find name with highest count
  let mostCommonName = 'Anonymous User';
  let maxCount = 0;
  
  nameCounts.forEach((count, name) => {
    if (count > maxCount) {
      maxCount = count;
      mostCommonName = name;
    }
  });
  
  return mostCommonName;
};

/**
 * Check if a message is likely a greeting
 */
export const isGreeting = (content: string): boolean => {
  const greetings = [
    'hi', 'hello', 'hey', 'good morning', 'good afternoon', 
    'good evening', 'greetings', 'howdy', 'sup', 'yo'
  ];
  
  const lowerContent = content.toLowerCase().trim();
  return greetings.some(greeting => lowerContent === greeting || lowerContent.startsWith(greeting + ' '));
};

/**
 * Check if a message is likely just a name
 */
export const isNameOnly = (content: string): boolean => {
  // Match patterns like "John", "John Doe", "John Smith"
  return /^[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/.test(content.trim());
};

/**
 * Extract the first substantive question from user messages
 */
export const extractFirstQuestion = (messages: ChatLog[]): string | null => {
  const userMessages = messages.filter(msg => msg.messageType === 'user');
  
  const questionMessage = userMessages.find(msg => {
    const content = msg.content.trim();
    return content.includes('?') && content.length > 10;
  });
  
  return questionMessage?.content || null;
};