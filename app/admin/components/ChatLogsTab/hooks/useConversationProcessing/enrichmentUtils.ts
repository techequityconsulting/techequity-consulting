// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/enrichmentUtils.ts
// Conversation enrichment utilities
// FIXED: Removed appointment detection - now handled by database lookup

import { ChatLog } from '../../../../types';
import { ConversationBox } from '../../types';
import { ProcessingConfig, DeepAnalysisResult } from './types';

/**
 * Enrich conversations with metadata and analysis
 * Adds firstMessage, duration, and optional deep analysis
 * NOTE: hasAppointment is NOT set here - it's handled by database lookup in sessionUtils
 */
export const enrichConversations = (
  conversations: ConversationBox[],
  config: ProcessingConfig,
  findMeaningfulUserMessageFn: (messages: ChatLog[], config: ProcessingConfig) => string,
  calculateDurationFn: (messages: ChatLog[], config: ProcessingConfig) => string,
  performDeepAnalysisFn: (conversation: ConversationBox, config: ProcessingConfig) => DeepAnalysisResult
): ConversationBox[] => {
  return conversations.map(conv => {
    // Sort messages by timestamp for proper chronological order
    conv.messages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    // Extract first meaningful message
    conv.firstMessage = findMeaningfulUserMessageFn(conv.messages, config);
    
    // Calculate duration with device-appropriate precision
    conv.duration = calculateDurationFn(conv.messages, config);
    
    // ✅ REMOVED: Appointment detection (now database-driven)
    // Previously: conv.hasAppointment = detectAppointment(conv.messages);
    // Now: hasAppointment is set by database lookup in sessionUtils.ts
    
    // Device-specific deep analysis
    if (config.enableDeepMessageAnalysis) {
      // Enhanced analysis for tablet/desktop
      const analysisResult = performDeepAnalysisFn(conv, config);
      return {
        ...conv,
        ...analysisResult
      };
    }
    
    return conv;
  });
};

/**
 * Add timestamps to conversation metadata
 * Useful for sorting and filtering
 */
export const addTimestampMetadata = (conversation: ConversationBox): ConversationBox & {
  firstMessageTime?: string;
  lastMessageTime?: string;
} => {
  if (conversation.messages.length === 0) {
    return conversation;
  }
  
  const sortedMessages = [...conversation.messages].sort((a, b) => 
    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  
  return {
    ...conversation,
    firstMessageTime: sortedMessages[0].timestamp,
    lastMessageTime: sortedMessages[sortedMessages.length - 1].timestamp
  };
};

/**
 * Calculate conversation metrics
 * Adds message counts, response times, etc.
 */
export const calculateConversationMetrics = (conversation: ConversationBox): ConversationBox & {
  userMessageCount: number;
  aiMessageCount: number;
  averageMessageLength: number;
} => {
  const userMessages = conversation.messages.filter(msg => msg.messageType === 'user');
  const aiMessages = conversation.messages.filter(msg => msg.messageType === 'ai');
  
  const totalLength = conversation.messages.reduce((sum, msg) => sum + msg.content.length, 0);
  const averageLength = conversation.messages.length > 0 
    ? Math.round(totalLength / conversation.messages.length) 
    : 0;
  
  return {
    ...conversation,
    userMessageCount: userMessages.length,
    aiMessageCount: aiMessages.length,
    averageMessageLength: averageLength
  };
};

/**
 * Add conversation tags based on content
 * Useful for categorization
 */
export const addConversationTags = (conversation: ConversationBox): ConversationBox & {
  tags: string[];
} => {
  const tags: string[] = [];
  const allContent = conversation.messages
    .map(msg => msg.content.toLowerCase())
    .join(' ');
  
  // Tag based on content keywords
  if (allContent.includes('price') || allContent.includes('cost')) {
    tags.push('pricing');
  }
  
  if (allContent.includes('feature') || allContent.includes('capability')) {
    tags.push('features');
  }
  
  if (allContent.includes('help') || allContent.includes('support')) {
    tags.push('support');
  }
  
  if (allContent.includes('schedule') || allContent.includes('appointment')) {
    tags.push('scheduling');
  }
  
  if (allContent.includes('integration') || allContent.includes('api')) {
    tags.push('integration');
  }
  
  // Tag based on conversation characteristics
  if (conversation.messageCount > 10) {
    tags.push('engaged');
  }
  
  if (conversation.hasAppointment) {
    tags.push('converted');
  }
  
  return {
    ...conversation,
    tags
  };
};

/**
 * Enrich with user agent information if available
 */
export const addUserAgentInfo = (conversation: ConversationBox): ConversationBox & {
  deviceInfo?: {
    browser?: string;
    os?: string;
    isMobile?: boolean;
  };
} => {
  // Check if any message has user agent info
  const messageWithUA = conversation.messages.find(msg => 
    msg.userInfo && 'userAgent' in msg.userInfo
  );
  
  if (messageWithUA && messageWithUA.userInfo && 'userAgent' in messageWithUA.userInfo) {
    const ua = (messageWithUA.userInfo as any).userAgent as string;
    
    return {
      ...conversation,
      deviceInfo: {
        browser: detectBrowser(ua),
        os: detectOS(ua),
        isMobile: /mobile|android|iphone|ipad/i.test(ua)
      }
    };
  }
  
  return conversation;
};

/**
 * Detect browser from user agent string
 */
const detectBrowser = (userAgent: string): string => {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('Opera')) return 'Opera';
  return 'Unknown';
};

/**
 * Detect OS from user agent string
 */
const detectOS = (userAgent: string): string => {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  return 'Unknown';
};

/**
 * Add conversation quality score
 * Based on message count, duration, and engagement
 */
export const addQualityScore = (conversation: ConversationBox): ConversationBox & {
  qualityScore: number;
} => {
  let score = 0;
  
  // Score based on message count
  if (conversation.messageCount >= 10) score += 30;
  else if (conversation.messageCount >= 5) score += 20;
  else if (conversation.messageCount >= 2) score += 10;
  
  // Score based on duration (parse duration string)
  const durationMatch = conversation.duration.match(/(\d+)h|(\d+)m/g);
  if (durationMatch) {
    const totalMinutes = durationMatch.reduce((sum, part) => {
      if (part.includes('h')) {
        return sum + parseInt(part) * 60;
      } else {
        return sum + parseInt(part);
      }
    }, 0);
    
    if (totalMinutes >= 30) score += 30;
    else if (totalMinutes >= 10) score += 20;
    else if (totalMinutes >= 5) score += 10;
  }
  
  // Score based on appointment
  if (conversation.hasAppointment) score += 40;
  
  return {
    ...conversation,
    qualityScore: Math.min(score, 100)
  };
};

/**
 * Batch enrich multiple conversations
 * More efficient than enriching one at a time
 */
export const batchEnrichConversations = (
  conversations: ConversationBox[],
  enrichmentFunctions: Array<(conv: ConversationBox) => ConversationBox>
): ConversationBox[] => {
  return conversations.map(conv => {
    let enriched = conv;
    
    for (const enrichFn of enrichmentFunctions) {
      try {
        enriched = enrichFn(enriched);
      } catch (error) {
        console.warn('Enrichment function failed:', error);
        // Continue with partial enrichment
      }
    }
    
    return enriched;
  });
};

/**
 * Add conversation summary
 * Generates a brief summary of the conversation
 */
export const addConversationSummary = (conversation: ConversationBox): ConversationBox & {
  summary: string;
} => {
  const userMessages = conversation.messages.filter(msg => msg.messageType === 'user');
  
  if (userMessages.length === 0) {
    return {
      ...conversation,
      summary: 'No user messages'
    };
  }
  
  // Simple summary: first user message + message count
  const firstUserMsg = userMessages[0].content;
  const truncated = firstUserMsg.length > 100 
    ? firstUserMsg.substring(0, 100) + '...' 
    : firstUserMsg;
  
  return {
    ...conversation,
    summary: `${truncated} (${conversation.messageCount} messages)`
  };
};

/**
 * Validate enriched conversation
 * Ensures all required fields are present after enrichment
 */
export const validateEnrichedConversation = (conversation: ConversationBox): boolean => {
  return !!(
    conversation.sessionId &&
    conversation.userName &&
    conversation.messageCount > 0 &&
    conversation.firstMessage &&
    conversation.lastActivity &&
    conversation.duration &&
    conversation.messages &&
    conversation.messages.length > 0
  );
};