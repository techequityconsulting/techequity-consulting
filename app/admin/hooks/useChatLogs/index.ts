import { getAdminApiBaseUrl } from '../../utils/apiConfig';
// src/app/admin/hooks/useChatLogs/index.ts
// Main Chat Logs Hook - Orchestrates all chat logs functionality
// FIXED: Database-based appointment matching instead of keyword detection

import { useState, useCallback, useEffect } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ChatLog, ChatSession, Notification, Appointment } from '../../types';
import { ConversationBox } from '../../components/ChatLogsTab/types';
import { 
  UseChatLogsReturn,
  NOTIFICATION_DURATIONS,
  DeviceType,
  ExportFormat
} from './types';
import { 
  loadChatLogsApi, 
  deleteConversationApi, 
  bulkDeleteConversationsApi 
} from './apiUtils';
import { 
  processChatSessions, 
  calculateSessionDuration,
  extractUserName,
  getConversationStats 
} from './sessionUtils';
import { 
  searchChatLogs, 
  filterSessionsByDate 
} from './deviceUtils';
import { 
  exportConversations, 
  analyzeConversations 
} from './exportUtils';
import { 
  refreshChatDataUtil, 
  setupAutoRefreshUtil,
  loadAllChatDataUtil 
} from './refreshUtils';

// ✅ NEW: Function to fetch appointment matches from database
const fetchAppointmentMatches = async (sessionIds: string[]): Promise<Record<string, any>> => {
  try {
    if (sessionIds.length === 0) {
      return {};
    }

    console.log('🔍 Fetching appointment matches for', sessionIds.length, 'sessions...');

    const response = await fetch(`${getAdminApiBaseUrl()}/api/admin/chat-logs/match-appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sessionIds }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointment matches');
    }

    const data = await response.json();
    
    console.log('✅ Appointment matches found:', data.matchCount);
    
    return data.appointmentMap || {};
  } catch (error) {
    console.error('❌ Error fetching appointment matches:', error);
    return {};
  }
};

export const useChatLogs = (
  setNotification: (notification: Notification | null) => void,
  scheduledCalls: Appointment[] = []
): UseChatLogsReturn => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  // Core state
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  
  // ✅ NEW: Store appointment matches from database
  const [appointmentMatches, setAppointmentMatches] = useState<Record<string, any>>({});

  // Enhanced load chat logs with graceful update support
  const loadChatLogs = useCallback(async (sessionId?: string, isGracefulUpdate: boolean = false): Promise<ChatLog[]> => {
    const logs = await loadChatLogsApi({
      sessionId,
      isGracefulUpdate,
      deviceType,
      isTouchDevice,
      setIsLoading,
      setChatLogs,
      setNotification
    });
    return logs;
  }, [deviceType, isTouchDevice, setNotification]);

  // ✅ NEW: Fetch appointment matches whenever chat logs change
  useEffect(() => {
    const fetchMatches = async () => {
      if (chatLogs.length > 0) {
        // Extract unique session IDs from chat logs
        const sessionIds = [...new Set(chatLogs.map(log => log.sessionId))];
        const matches = await fetchAppointmentMatches(sessionIds);
        setAppointmentMatches(matches);
      } else {
        setAppointmentMatches({});
      }
    };

    fetchMatches();
  }, [chatLogs]);

  // Enhanced session selection with state sync
  const handleSelectSession = useCallback(async (sessionId: string | null) => {
    setSelectedSession(sessionId);
    
    if (sessionId) {
      try {
        await loadChatLogs(sessionId, true);
      } catch (error) {
        console.error('Error loading session details:', error);
      }
    }
  }, [loadChatLogs]);

  // ✅ MODIFIED: Process chat logs with appointment matches from database
  useEffect(() => {
    if (chatLogs.length > 0) {
      console.log('🔄 Re-processing chat sessions with database appointment matches...');
      console.log('  - Chat logs count:', chatLogs.length);
      console.log('  - Appointment matches found:', Object.keys(appointmentMatches).length);
      
      const processedSessions = processChatSessions(
        chatLogs, 
        deviceType, 
        extractUserName, 
        calculateSessionDuration,
        scheduledCalls,
        appointmentMatches // ✅ Pass the appointment matches from database
      );
      
      console.log('✅ Processed sessions with appointments:', processedSessions.filter(s => s.hasAppointment).length);
      
      setChatSessions(processedSessions);
    } else {
      setChatSessions([]);
    }
  }, [
    chatLogs, 
    deviceType, 
    scheduledCalls.length,
    appointmentMatches, // ✅ Track appointment matches changes
    JSON.stringify(scheduledCalls.map(apt => ({ id: apt.id, chatSessionId: apt.chatSessionId })))
  ]);

  // Delete conversation with device-aware confirmation
  // FIXED: Added forced reload after deletion to prevent stale state
  const deleteConversation = useCallback(async (sessionId: string) => {
    await deleteConversationApi({
      sessionId,
      selectedSession,
      deviceType,
      setIsLoading,
      setChatLogs,
      setSelectedSession,
      setNotification
    });
    
    // CRITICAL FIX: Force reload all chat data after deletion
    console.log('🔄 Forcing data reload after deletion to verify state...');
    
    setTimeout(async () => {
      try {
        await loadChatLogs(undefined, true);
        console.log('✅ Data reloaded successfully after deletion');
      } catch (error) {
        console.warn('⚠️ Failed to reload data after deletion:', error);
      }
    }, 500);
    
  }, [selectedSession, deviceType, setNotification, loadChatLogs]);

  // Device detection hook
  const { type: deviceTypeDetected, isTouchDevice: isTouchDeviceDetected } = useDeviceDetection();
  const [detectedDeviceType] = useState<DeviceType>(deviceTypeDetected as DeviceType);
  const [detectedIsTouchDevice] = useState<boolean>(isTouchDeviceDetected);

  // Graceful chat data refresh
  const refreshChatData = useCallback(async () => {
    await refreshChatDataUtil({
      loadChatLogs,
      deviceType,
      setIsLoading
    });
  }, [loadChatLogs, deviceType]);

  // Load all chat data with loading state
  const loadAllChatData = useCallback(async () => {
    await loadAllChatDataUtil({
      loadChatLogs,
      deviceType,
      setIsLoading
    });
  }, [loadChatLogs, deviceType]);

  // Bulk delete conversations
  // FIXED: Added forced reload after bulk deletion
  const bulkDeleteConversations = useCallback(async (sessionIds: string[]) => {
    await bulkDeleteConversationsApi({
      sessionIds,
      selectedSession,
      deviceType,
      setIsLoading,
      setChatLogs,
      setChatSessions,
      setSelectedSession,
      setNotification
    });
    
    console.log('🔄 Forcing data reload after bulk deletion...');
    setTimeout(async () => {
      try {
        await loadChatLogs(undefined, true);
        console.log('✅ Data reloaded successfully after bulk deletion');
      } catch (error) {
        console.warn('⚠️ Failed to reload data after bulk deletion:', error);
      }
    }, 800);
    
  }, [selectedSession, deviceType, setNotification, loadChatLogs]);

  // Export conversations
  const exportConversationsFunc = useCallback((sessionIds: string[], format: ExportFormat = 'json') => {
    exportConversations({
      sessionIds,
      format,
      chatLogs,
      deviceType,
      setNotification
    });
  }, [chatLogs, deviceType, setNotification]);

  // Search chat logs
  const searchChatLogsFunc = useCallback((query: string) => {
    return searchChatLogs(query, chatLogs, deviceType);
  }, [chatLogs, deviceType]);

  // Filter sessions by date
  const filterSessionsByDateFunc = useCallback((days: number) => {
    return filterSessionsByDate(days, chatSessions, deviceType);
  }, [chatSessions, deviceType]);

  // Get conversation statistics
  const getConversationStatsFunc = useCallback(() => {
    return getConversationStats(chatSessions, chatLogs, filterSessionsByDateFunc, deviceType);
  }, [chatSessions, chatLogs, filterSessionsByDateFunc, deviceType]);

  // Analyze conversations
  const analyzeConversationsFunc = useCallback(() => {
    return analyzeConversations(chatSessions, chatLogs, deviceType);
  }, [chatSessions, deviceType]);

  // Setup auto-refresh
  const setupAutoRefreshFunc = useCallback((intervalMinutes: number = 5) => {
    return setupAutoRefreshUtil({
      intervalMinutes,
      refreshChatData,
      deviceType
    });
  }, [refreshChatData, deviceType]);

  // Update sessions from logs (manual trigger)
  const updateSessionsFromLogs = useCallback(() => {
    if (chatLogs.length > 0) {
      const processedSessions = processChatSessions(
        chatLogs,
        deviceType,
        extractUserName,
        calculateSessionDuration,
        scheduledCalls,
        appointmentMatches // ✅ Use appointment matches here too
      );
      setChatSessions(processedSessions);
    }
  }, [chatLogs, deviceType, scheduledCalls, appointmentMatches]);

  // Auto-refresh setup
  useEffect(() => {
    const cleanup = setupAutoRefreshUtil({
      intervalMinutes: 5,
      refreshChatData,
      deviceType
    });
    
    return cleanup;
  }, [refreshChatData, deviceType]);

  return {
    // Core state
    chatLogs,
    chatSessions,
    isLoading,
    selectedSession,
    
    // Core actions
    loadAllChatData,
    loadChatLogs,
    handleSelectSession,
    setSelectedSession,
    refreshChatData,
    deleteConversation,
    
    // Device-aware features
    deviceType: detectedDeviceType,
    isTouchDevice: detectedIsTouchDevice,
    searchChatLogs: searchChatLogsFunc,
    filterSessionsByDate: filterSessionsByDateFunc,
    getConversationStats: getConversationStatsFunc,
    bulkDeleteConversations,
    exportConversations: exportConversationsFunc,
    analyzeConversations: analyzeConversationsFunc,
    setupAutoRefresh: setupAutoRefreshFunc,
    updateSessionsFromLogs
  };
};
