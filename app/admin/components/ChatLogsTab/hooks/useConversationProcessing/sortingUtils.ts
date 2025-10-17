// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/sortingUtils.ts
// Conversation sorting and filtering utilities

import { ConversationBox } from '../../types';
import { DeviceType, DisplayLimits } from './types';
import { getDisplayLimit } from './configUtils';
import { parseDurationToMinutes } from './extractionUtils';

/**
 * Sort conversations by most recent activity first
 * Default sorting method for all devices
 */
export const sortConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => 
    new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
  );
};

/**
 * Sort conversations by oldest activity first
 */
export const sortConversationsByOldest = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => 
    new Date(a.lastActivity).getTime() - new Date(b.lastActivity).getTime()
  );
};

/**
 * Sort conversations by message count (highest first)
 */
export const sortConversationsByMessageCount = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => b.messageCount - a.messageCount);
};

/**
 * Sort conversations by duration (longest first)
 */
export const sortConversationsByDuration = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => {
    const aDuration = parseDurationToMinutes(a.duration);
    const bDuration = parseDurationToMinutes(b.duration);
    return bDuration - aDuration;
  });
};

/**
 * Sort conversations alphabetically by user name
 */
export const sortConversationsByUserName = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => 
    a.userName.localeCompare(b.userName)
  );
};

/**
 * Sort conversations by appointment status (booked first)
 */
export const sortConversationsByAppointment = (conversations: ConversationBox[]): ConversationBox[] => {
  return [...conversations].sort((a, b) => {
    if (a.hasAppointment && !b.hasAppointment) return -1;
    if (!a.hasAppointment && b.hasAppointment) return 1;
    return 0;
  });
};

/**
 * Filter conversations for performance based on device type
 * Limits number of conversations to prevent UI slowdown
 */
export const filterConversationsForPerformance = (
  conversations: ConversationBox[],
  deviceType: DeviceType,
  calculatePriorityFn: (conv: ConversationBox) => number
): ConversationBox[] => {
  const limit = getDisplayLimit(deviceType);
  
  // If under limit, return all
  if (conversations.length <= limit) {
    return conversations;
  }
  
  // For mobile and tablet, prioritize by importance
  if (deviceType !== 'desktop') {
    const prioritized = conversations
      .map(conv => ({
        conversation: conv,
        priority: calculatePriorityFn(conv)
      }))
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit)
      .map(item => item.conversation);
    
    return prioritized;
  }
  
  // For desktop, just limit the count
  return conversations.slice(0, limit);
};

/**
 * Calculate conversation priority for filtering
 * Higher priority = more important to show
 */
export const calculateConversationPriority = (conversation: ConversationBox): number => {
  let priority = 0;
  
  // Recent activity gets higher priority (up to 10 points)
  const daysSinceActivity = (Date.now() - new Date(conversation.lastActivity).getTime()) / (1000 * 60 * 60 * 24);
  priority += Math.max(0, 10 - daysSinceActivity);
  
  // More messages = higher engagement (up to 5 points)
  priority += Math.min(conversation.messageCount * 0.5, 5);
  
  // Appointments get priority boost (3 points)
  if (conversation.hasAppointment) {
    priority += 3;
  }
  
  // Longer conversations get slight boost (up to 2 points)
  const durationMinutes = parseDurationToMinutes(conversation.duration);
  priority += Math.min(durationMinutes * 0.1, 2);
  
  return priority;
};

/**
 * Filter conversations by date range
 */
export const filterConversationsByDateRange = (
  conversations: ConversationBox[],
  startDate: Date,
  endDate: Date
): ConversationBox[] => {
  return conversations.filter(conv => {
    const convDate = new Date(conv.lastActivity);
    return convDate >= startDate && convDate <= endDate;
  });
};

/**
 * Filter conversations by appointment status
 */
export const filterConversationsByAppointment = (
  conversations: ConversationBox[],
  hasAppointment: boolean
): ConversationBox[] => {
  return conversations.filter(conv => conv.hasAppointment === hasAppointment);
};

/**
 * Filter conversations by message count range
 */
export const filterConversationsByMessageCount = (
  conversations: ConversationBox[],
  minMessages: number,
  maxMessages?: number
): ConversationBox[] => {
  return conversations.filter(conv => {
    if (conv.messageCount < minMessages) return false;
    if (maxMessages !== undefined && conv.messageCount > maxMessages) return false;
    return true;
  });
};

/**
 * Filter conversations by user name (partial match)
 */
export const filterConversationsByUserName = (
  conversations: ConversationBox[],
  searchTerm: string
): ConversationBox[] => {
  const lowerSearch = searchTerm.toLowerCase();
  return conversations.filter(conv => 
    conv.userName.toLowerCase().includes(lowerSearch)
  );
};

/**
 * Filter conversations by session ID (partial match)
 */
export const filterConversationsBySessionId = (
  conversations: ConversationBox[],
  searchTerm: string
): ConversationBox[] => {
  const lowerSearch = searchTerm.toLowerCase();
  return conversations.filter(conv => 
    conv.sessionId.toLowerCase().includes(lowerSearch)
  );
};

/**
 * Filter conversations by content search
 * Searches through all message content
 */
export const filterConversationsByContent = (
  conversations: ConversationBox[],
  searchTerm: string
): ConversationBox[] => {
  const lowerSearch = searchTerm.toLowerCase();
  
  return conversations.filter(conv => {
    // Search in first message
    if (conv.firstMessage.toLowerCase().includes(lowerSearch)) {
      return true;
    }
    
    // Search in all messages
    return conv.messages.some(msg => 
      msg.content.toLowerCase().includes(lowerSearch)
    );
  });
};

/**
 * Filter conversations by duration range (in minutes)
 */
export const filterConversationsByDuration = (
  conversations: ConversationBox[],
  minMinutes: number,
  maxMinutes?: number
): ConversationBox[] => {
  return conversations.filter(conv => {
    const duration = parseDurationToMinutes(conv.duration);
    if (duration < minMinutes) return false;
    if (maxMinutes !== undefined && duration > maxMinutes) return false;
    return true;
  });
};

/**
 * Get top N conversations by priority
 */
export const getTopConversations = (
  conversations: ConversationBox[],
  count: number,
  calculatePriorityFn: (conv: ConversationBox) => number
): ConversationBox[] => {
  return conversations
    .map(conv => ({
      conversation: conv,
      priority: calculatePriorityFn(conv)
    }))
    .sort((a, b) => b.priority - a.priority)
    .slice(0, count)
    .map(item => item.conversation);
};

/**
 * Get conversations from today
 */
export const getTodayConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return conversations.filter(conv => {
    const convDate = new Date(conv.lastActivity);
    return convDate >= today;
  });
};

/**
 * Get conversations from this week
 */
export const getThisWeekConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  return conversations.filter(conv => {
    const convDate = new Date(conv.lastActivity);
    return convDate >= weekAgo;
  });
};

/**
 * Get conversations from this month
 */
export const getThisMonthConversations = (conversations: ConversationBox[]): ConversationBox[] => {
  const monthAgo = new Date();
  monthAgo.setMonth(monthAgo.getMonth() - 1);
  
  return conversations.filter(conv => {
    const convDate = new Date(conv.lastActivity);
    return convDate >= monthAgo;
  });
};

/**
 * Paginate conversations
 */
export const paginateConversations = (
  conversations: ConversationBox[],
  page: number,
  pageSize: number
): {
  conversations: ConversationBox[];
  totalPages: number;
  currentPage: number;
  totalItems: number;
} => {
  const totalPages = Math.ceil(conversations.length / pageSize);
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  return {
    conversations: conversations.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems: conversations.length
  };
};

/**
 * Group conversations by date
 */
export const groupConversationsByDate = (
  conversations: ConversationBox[]
): Map<string, ConversationBox[]> => {
  const groups = new Map<string, ConversationBox[]>();
  
  conversations.forEach(conv => {
    const date = new Date(conv.lastActivity);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
    
    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(conv);
  });
  
  return groups;
};

/**
 * Group conversations by user name
 */
export const groupConversationsByUser = (
  conversations: ConversationBox[]
): Map<string, ConversationBox[]> => {
  const groups = new Map<string, ConversationBox[]>();
  
  conversations.forEach(conv => {
    const userName = conv.userName;
    
    if (!groups.has(userName)) {
      groups.set(userName, []);
    }
    groups.get(userName)!.push(conv);
  });
  
  return groups;
};

/**
 * Get conversation statistics
 */
export const getConversationStats = (conversations: ConversationBox[]): {
  total: number;
  withAppointments: number;
  averageMessageCount: number;
  averageDurationMinutes: number;
  uniqueUsers: number;
} => {
  if (conversations.length === 0) {
    return {
      total: 0,
      withAppointments: 0,
      averageMessageCount: 0,
      averageDurationMinutes: 0,
      uniqueUsers: 0
    };
  }
  
  const withAppointments = conversations.filter(c => c.hasAppointment).length;
  const totalMessages = conversations.reduce((sum, c) => sum + c.messageCount, 0);
  const totalDuration = conversations.reduce((sum, c) => sum + parseDurationToMinutes(c.duration), 0);
  const uniqueUsers = new Set(conversations.map(c => c.userName)).size;
  
  return {
    total: conversations.length,
    withAppointments,
    averageMessageCount: Math.round(totalMessages / conversations.length),
    averageDurationMinutes: Math.round(totalDuration / conversations.length),
    uniqueUsers
  };
};