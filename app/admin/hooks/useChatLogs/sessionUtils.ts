// src/app/admin/hooks/useChatLogs/sessionUtils.ts
// Session processing and management utilities for chat logs
// FIXED: Database-driven appointment detection instead of keyword matching

import { ChatLog, ChatSession, Appointment } from '../../types';
import { ConversationBox } from '../../components/ChatLogsTab/types';
import { DeviceType, CHAT_LOGS_CONFIG } from './types';

// Extract user name from chat log with fallback strategies
export const extractUserName = (log: ChatLog): string => {
  // Try userInfo first
  if (log.userInfo?.userName) {
    return log.userInfo.userName;
  }
  
  if (log.userInfo?.firstName && log.userInfo?.lastName) {
    return `${log.userInfo.firstName} ${log.userInfo.lastName}`;
  }
  
  if (log.userInfo?.firstName) {
    return log.userInfo.firstName;
  }
  
  // Fallback: extract from message content
  const nameMatch = log.content?.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
  if (nameMatch) {
    return nameMatch[0];
  }
  
  return 'Anonymous User';
};

// Calculate session duration based on first and last messages
export const calculateSessionDuration = (
  messages: ChatLog[],
  deviceType: DeviceType
): string => {
  if (messages.length < 2) return '0m';
  
  const firstMessage = messages[0];
  const lastMessage = messages[messages.length - 1];
  
  const startTime = new Date(firstMessage.timestamp);
  const endTime = new Date(lastMessage.timestamp);
  const diffMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  // Device-specific duration formatting
  if (deviceType === 'mobile') {
    // Mobile: Simplified duration format
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours}h`;
    }
  } else if (deviceType === 'tablet') {
    // Tablet: Balanced format
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
  } else {
    // Desktop: Detailed format
    if (diffMinutes < 60) {
      return `${diffMinutes} minutes`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const remainingMinutes = diffMinutes % 60;
      if (remainingMinutes > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
      } else {
        return `${hours} hour${hours > 1 ? 's' : ''}`;
      }
    }
  }
};

// ✅ NEW: Main function to process chat logs into session summaries with DATABASE appointment matching
export const processChatSessions = (
  logs: ChatLog[],
  deviceType: DeviceType,
  extractUserNameFn: (log: ChatLog) => string,
  calculateDurationFn: (messages: ChatLog[], deviceType: DeviceType) => string,
  scheduledCalls: Appointment[] = [],
  appointmentMatches: Record<string, any> = {} // ✅ NEW: Database appointment matches
): ConversationBox[] => {
  const config = CHAT_LOGS_CONFIG[deviceType];
  
  console.log('🔄 DEBUG processChatSessions called with:');
  console.log('  - Total logs:', logs.length);
  console.log('  - Scheduled calls:', scheduledCalls.length);
  console.log('  - Appointment matches from DB:', Object.keys(appointmentMatches).length);
  
  const sessionMap = new Map<string, {
    sessionId: string;
    messages: ChatLog[];
    firstMessage: string;
    lastActivity: string;
    hasAppointment: boolean;
    appointmentId?: number;
  }>();

  // Group messages by session
  logs.forEach(log => {
    if (!sessionMap.has(log.sessionId)) {
      sessionMap.set(log.sessionId, {
        sessionId: log.sessionId,
        messages: [],
        firstMessage: '',
        lastActivity: log.timestamp,
        hasAppointment: false
      });
    }
    
    const session = sessionMap.get(log.sessionId)!;
    session.messages.push(log);
    
    // Update last activity
    if (new Date(log.timestamp) > new Date(session.lastActivity)) {
      session.lastActivity = log.timestamp;
    }
  });

  console.log('  - Unique sessions found:', sessionMap.size);

  // Convert to session summaries with database-driven appointment detection
  const sessions: ConversationBox[] = Array.from(sessionMap.values()).map(session => {
    // Sort messages by timestamp
    session.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    
    // Find first user message for summary
    const firstUserMessage = session.messages.find(msg => msg.messageType === 'user');
    
    // ✅ NEW: Database-driven appointment detection
    console.log(`\n🔍 Checking session: ${session.sessionId}`);
    
    // Check if this session has an appointment in the database
    const appointmentData = appointmentMatches[session.sessionId];
    
    if (appointmentData) {
      session.hasAppointment = true;
      session.appointmentId = appointmentData.appointmentId;
      console.log(`  ✅ APPOINTMENT FOUND via DATABASE for session: ${session.sessionId}`);
      console.log(`     Appointment ID: ${appointmentData.appointmentId}`);
      console.log(`     Name: ${appointmentData.name}`);
      console.log(`     Date: ${appointmentData.date} at ${appointmentData.time}`);
    } else {
      session.hasAppointment = false;
      console.log(`  ❌ NO APPOINTMENT in database for session: ${session.sessionId}`);
    }
  
    // Extract user name from first message with user info
    const messageWithUserInfo = session.messages.find(msg => 
      msg.userInfo && (msg.userInfo.userName || msg.userInfo.firstName)
    ) || session.messages[0];

    const userName = extractUserNameFn(messageWithUserInfo || {} as ChatLog);

    // ✅ NEW: Extract email from messages
    const messageWithEmail = session.messages.find(msg => msg.userEmail);
    const userEmail = messageWithEmail?.userEmail || undefined;

    console.log('🔍 RETURN OBJECT:', {
      sessionId: session.sessionId,
      hasAppointment: session.hasAppointment,
      appointmentId: appointmentMatches[session.sessionId]?.appointmentId,
      appointmentMatchesKeys: Object.keys(appointmentMatches),
      userEmail: userEmail  // ✅ NEW: Log email for debugging
    });

    return {
      sessionId: session.sessionId,
      userName: userName,
      userEmail: userEmail,  // ✅ NEW: Add email to returned object
      messageCount: session.messages.length,
      firstMessage: firstUserMessage?.content || 'Session started',
      lastActivity: session.lastActivity,
      duration: calculateDurationFn(session.messages, deviceType),
      hasAppointment: session.hasAppointment,
      appointmentId: appointmentMatches[session.sessionId]?.appointmentId,
      messages: session.messages
    };
  });

  // Device-specific session sorting and limiting
  if (deviceType === 'mobile') {
    sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    const limitedSessions = sessions.slice(0, config.maxSessions);
    console.log(`Mobile: Limited to ${limitedSessions.length} sessions`);
    return limitedSessions;
  } else if (deviceType === 'tablet') {
    sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    const limitedSessions = sessions.slice(0, config.maxSessions);
    console.log(`Tablet: Limited to ${limitedSessions.length} sessions`);
    return limitedSessions;
  } else {
    sessions.sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
    console.log(`Desktop: All ${sessions.length} sessions`);
    return sessions;
  }
};

// Get conversation statistics
export const getConversationStats = (
  chatSessions: ChatSession[],
  chatLogs: ChatLog[],
  filterByDateFn: (days: number) => ChatSession[],
  deviceType: DeviceType
) => {
  const stats = {
    totalConversations: chatSessions.length,
    conversationsWithAppointments: chatSessions.filter(session => session.hasAppointment).length,
    totalMessages: chatLogs.length,
    averageMessagesPerConversation: chatSessions.length > 0 ?
      Math.round((chatLogs.length / chatSessions.length) * 10) / 10 : 0,
    recentConversations: filterByDateFn(7).length
  };
  
  // Device-specific stats logging
  if (deviceType === 'desktop') {
    console.log('Conversation Statistics:', stats);
  } else if (deviceType === 'mobile') {
    console.log(`Mobile stats: ${stats.totalConversations} conversations, ${stats.conversationsWithAppointments} appointments`);
  }
  
  return stats;
};

// Find sessions that match specific criteria
export const findSessionsByCriteria = (
  sessions: ConversationBox[],
  criteria: {
    hasAppointment?: boolean;
    minMessages?: number;
    maxMessages?: number;
    userName?: string;
    dateFrom?: Date;
    dateTo?: Date;
  }
): ConversationBox[] => {
  return sessions.filter(session => {
    // Check appointment status
    if (typeof criteria.hasAppointment === 'boolean' && 
        session.hasAppointment !== criteria.hasAppointment) {
      return false;
    }
    
    // Check message count range
    if (criteria.minMessages !== undefined && 
        session.messageCount < criteria.minMessages) {
      return false;
    }
    
    if (criteria.maxMessages !== undefined && 
        session.messageCount > criteria.maxMessages) {
      return false;
    }
    
    // Check user name
    if (criteria.userName && 
        !session.userName.toLowerCase().includes(criteria.userName.toLowerCase())) {
      return false;
    }
    
    // Check date range
    if (criteria.dateFrom && 
        new Date(session.lastActivity) < criteria.dateFrom) {
      return false;
    }
    
    if (criteria.dateTo && 
        new Date(session.lastActivity) > criteria.dateTo) {
      return false;
    }
    
    return true;
  });
};

// Sort sessions by different criteria
export const sortSessions = (
  sessions: ConversationBox[],
  sortBy: 'newest' | 'oldest' | 'most-messages' | 'least-messages' | 'alphabetical' | 'longest' | 'shortest'
): ConversationBox[] => {
  const sortedSessions = [...sessions];
  
  switch (sortBy) {
    case 'newest':
      return sortedSessions.sort((a, b) => 
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
      );
    case 'oldest':
      return sortedSessions.sort((a, b) => 
        new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
      );
    case 'most-messages':
      return sortedSessions.sort((a, b) => b.messageCount - a.messageCount);
    case 'least-messages':
      return sortedSessions.sort((a, b) => a.messageCount - b.messageCount);
    case 'alphabetical':
      return sortedSessions.sort((a, b) => a.userName.localeCompare(b.userName));
    case 'longest':
      return sortedSessions.sort((a, b) => {
        const aDuration = parseDuration(a.duration);
        const bDuration = parseDuration(b.duration);
        return bDuration - aDuration;
      });
    case 'shortest':
      return sortedSessions.sort((a, b) => {
        const aDuration = parseDuration(a.duration);
        const bDuration = parseDuration(b.duration);
        return aDuration - bDuration;
      });
    default:
      return sortedSessions;
  }
};

// Helper function to parse duration string to minutes for sorting
const parseDuration = (duration: string): number => {
  if (duration.includes('h')) {
    const hours = parseInt(duration.match(/(\d+)h/)?.[1] || '0', 10);
    const minutes = parseInt(duration.match(/(\d+)m/)?.[1] || '0', 10);
    return hours * 60 + minutes;
  } else if (duration.includes('m')) {
    return parseInt(duration.match(/(\d+)m/)?.[1] || '0', 10);
  } else if (duration.includes('minute')) {
    return parseInt(duration.match(/(\d+) minute/)?.[1] || '0', 10);
  } else if (duration.includes('hour')) {
    const hours = parseInt(duration.match(/(\d+) hour/)?.[1] || '0', 10);
    const minutes = parseInt(duration.match(/(\d+) minute/)?.[1] || '0', 10);
    return hours * 60 + minutes;
  }
  return 0;
};