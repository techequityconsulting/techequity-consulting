import { getAdminApiBaseUrl } from '../../utils/apiConfig';
// src/app/admin/hooks/useChatLogs/apiUtils.ts
// API operations with authentication for admin panel - COMPLETE VERSION
// FIXED: Handle null return from getAdminAuthHeaders()
// FIXED: Delete confirmation modal auto-close race condition
// FIXED: Data reload after deletion to prevent stale state

import { ChatLog } from '../../types';
import { getAdminAuthHeaders } from '../../utils/apiAuth';
import {
  DeviceType,
  CHAT_LOGS_CONFIG,
  NOTIFICATION_DURATIONS,
  LoadChatLogsParams,
  DeleteConversationParams,
  BulkDeleteParams
} from './types';

// Build API URL (no longer needs client parameter - determined by API key)
export const buildApiUrl = (
  sessionId?: string,
  deviceType: DeviceType = 'desktop',
  isTouchDevice: boolean = false
): string => {
  const config = CHAT_LOGS_CONFIG[deviceType];
  const baseUrl = getAdminApiBaseUrl();
  
  if (sessionId) {
    return `${baseUrl}/api/chat-logs?sessionId=${sessionId}&limit=${config.sessionLimit}&deviceType=${deviceType}`;
  } else {
    const queryParams = new URLSearchParams({
      limit: config.limit.toString(),
      deviceType: deviceType,
      isTouchDevice: isTouchDevice.toString()
    });
    return `${baseUrl}/api/chat-logs?${queryParams}`;
  }
};

// Process data based on device capabilities
export const processDeviceSpecificData = (
  data: ChatLog[],
  deviceType: DeviceType
): ChatLog[] => {
  const config = CHAT_LOGS_CONFIG[deviceType];
  
  if (deviceType === 'mobile') {
    // Mobile: Process for performance - keep only recent and essential data
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.dayLimit);
    
    return data
      .filter((log: ChatLog) => new Date(log.timestamp) >= cutoffDate)
      .sort((a: ChatLog, b: ChatLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, config.limit);
  } else if (deviceType === 'tablet') {
    // Tablet: Balanced data - keep recent period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - config.dayLimit);
    
    return data
      .filter((log: ChatLog) => new Date(log.timestamp) >= cutoffDate)
      .sort((a: ChatLog, b: ChatLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, config.limit);
  }
  // Desktop: Keep all data without filtering
  return data;
};

// Main API function to load chat logs with graceful update support
export const loadChatLogsApi = async (params: LoadChatLogsParams): Promise<ChatLog[]> => {
  const {
    sessionId,
    isGracefulUpdate,
    deviceType,
    isTouchDevice,
    setIsLoading,
    setChatLogs,
    setNotification
  } = params;

  const config = CHAT_LOGS_CONFIG[deviceType];

  try {
    // FIXED: Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      console.error('❌ Not authenticated - cannot load chat logs');
      setChatLogs([]);
      return [];
    }

    // FIXED: Only set loading state for initial loads, not graceful updates
    if (!isGracefulUpdate) {
      setIsLoading(true);
    }

    for (let attempt = 0; attempt < config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), config.timeout);

        const url = buildApiUrl(sessionId, deviceType, isTouchDevice);
        
        // Add authentication headers
        const response = await fetch(url, {
          headers: authHeaders,
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const result = await response.json();
        
        if (result.success) {
          // Process data based on device capabilities
          const processedData = processDeviceSpecificData(result.data || [], deviceType);
          
          // FIXED: For graceful updates, update data smoothly without UI disruption
          if (isGracefulUpdate) {
            setChatLogs(processedData);
            console.log(`Gracefully updated ${processedData.length} chat logs on ${deviceType}`);
          } else {
            setChatLogs(processedData);
            console.log(`✅ Loaded ${processedData.length} chat logs on ${deviceType}`);
          }
          
          return processedData;
        } else {
          throw new Error(result.error || 'Failed to load chat logs');
        }

      } catch (error: any) {
        console.error(`Attempt ${attempt + 1} failed:`, error.message || error);
        
        if (attempt === config.maxRetries - 1) {
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, config.retryDelay));
      }
    }

    throw new Error('Max retries exceeded');

  } catch (error: any) {
    console.error('Error loading chat logs:', error);
    
    // Device-specific error handling
    if (!isGracefulUpdate) {
      const errorMessages = {
        mobile: 'Failed to load chats',
        tablet: 'Failed to load chat logs',
        desktop: `Failed to load chat logs: ${error.message}`
      };
      
      if (setNotification) {
        setNotification({
          type: 'error',
          message: errorMessages[deviceType]
        });
        setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
      }
    }
    
    setChatLogs([]);
    return [];
  } finally {
    if (!isGracefulUpdate) {
      setIsLoading(false);
    }
  }
};

// Delete single conversation with device-aware handling
export const deleteConversationApi = async (params: DeleteConversationParams): Promise<void> => {
  const {
    sessionId,
    selectedSession,
    deviceType,
    setIsLoading,
    setChatLogs,
    setSelectedSession,
    setNotification
  } = params;

  const config = CHAT_LOGS_CONFIG[deviceType];

  try {
    // FIXED: Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout);

    const response = await fetch(`${getAdminApiBaseUrl()}/api/chat-logs?sessionId=${sessionId}`, {
      method: 'DELETE',
      headers: authHeaders,
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    const result = await response.json();

    // FIXED: Verify deletion was successful BEFORE updating local state
    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Failed to delete conversation');
    }

    console.log(`✅ Database deletion confirmed for session ${sessionId}`);

    // Now update local state
    setChatLogs(prev => prev.filter(log => log.sessionId !== sessionId));

    // Clear selection if deleted conversation was selected
    if (selectedSession === sessionId) {
      setSelectedSession(null);
    }

    // Device-specific success notifications
    const successMessages = {
      mobile: 'Deleted',
      tablet: 'Conversation deleted',
      desktop: 'Conversation deleted successfully'
    };

    if (setNotification) {
      setNotification({
        type: 'success',
        message: successMessages[deviceType]
      });
      
      // FIXED: Remove the setTimeout that was causing auto-close
      // Now the notification stays until manually dismissed via OK button
      // The NotificationModal component handles the dismissal
    }

    console.log(`✅ Deleted conversation ${sessionId} on ${deviceType}`);

  } catch (error: any) {
    console.error('Error deleting conversation:', error);
    
    // Device-specific error notifications
    const errorMessages = {
      mobile: 'Delete failed',
      tablet: 'Failed to delete conversation',
      desktop: `Failed to delete conversation: ${error.message}`
    };
    
    if (setNotification) {
      setNotification({
        type: 'error',
        message: errorMessages[deviceType]
      });
      // Keep the setTimeout for error notifications - they should auto-dismiss
      setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
    }
  } finally {
    setIsLoading(false);
  }
};

// Bulk delete conversations with device-specific limits
export const bulkDeleteConversationsApi = async (params: BulkDeleteParams): Promise<void> => {
  const {
    sessionIds,
    selectedSession,
    deviceType,
    setIsLoading,
    setChatLogs,
    setChatSessions,
    setSelectedSession,
    setNotification
  } = params;

  const config = CHAT_LOGS_CONFIG[deviceType];
  const maxBulk = config.maxBulkOperations;

  // Enforce device-specific bulk operation limits
  if (sessionIds.length > maxBulk) {
    const limitMessage = deviceType === 'mobile'
      ? `Max ${maxBulk} at once`
      : deviceType === 'tablet'
      ? `Maximum ${maxBulk} conversations can be deleted at once`
      : `Maximum ${maxBulk} conversations can be deleted at once on ${deviceType}`;
    
    if (setNotification) {
      setNotification({
        type: 'error',
        message: limitMessage
      });
      setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
    }
    return;
  }

  try {
    // FIXED: Check authentication before making request
    const authHeaders = getAdminAuthHeaders();
    if (!authHeaders) {
      throw new Error('Not authenticated');
    }

    setIsLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.timeout * 2); // Double timeout for bulk

    // Delete conversations sequentially to avoid overwhelming the server
    let successCount = 0;
    let failedSessions: string[] = [];

    for (const sessionId of sessionIds) {
      try {
        const response = await fetch(`${getAdminApiBaseUrl()}/api/chat-logs?sessionId=${sessionId}`, {
          method: 'DELETE',
          headers: authHeaders,
          signal: controller.signal
        });

        const result = await response.json();

        // FIXED: Verify each deletion was successful
        if (response.ok && result.success) {
          successCount++;
        } else {
          failedSessions.push(sessionId);
          console.error(`Failed to delete session ${sessionId}:`, result.error);
        }
      } catch (error: any) {
        failedSessions.push(sessionId);
        console.error(`Error deleting session ${sessionId}:`, error.message);
      }
    }

    clearTimeout(timeoutId);

    // Update local state - only remove successfully deleted conversations
    const successfullyDeletedIds = sessionIds.filter(id => !failedSessions.includes(id));
    
    setChatLogs(prev => prev.filter(log => !successfullyDeletedIds.includes(log.sessionId)));
    setChatSessions(prev => prev.filter(session => !successfullyDeletedIds.includes(session.sessionId)));

    // Clear selection if deleted conversation was selected
    if (selectedSession && successfullyDeletedIds.includes(selectedSession)) {
      setSelectedSession(null);
    }

    // Device-specific success notifications
    const successMessages = {
      mobile: `Deleted ${successCount}`,
      tablet: `${successCount} conversations deleted`,
      desktop: `Successfully deleted ${successCount} of ${sessionIds.length} conversations`
    };

    const partialSuccessMessages = {
      mobile: `Deleted ${successCount}, ${failedSessions.length} failed`,
      tablet: `${successCount} deleted, ${failedSessions.length} failed`,
      desktop: `Deleted ${successCount} conversations. ${failedSessions.length} failed to delete.`
    };

    if (setNotification) {
      if (failedSessions.length === 0) {
        setNotification({
          type: 'success',
          message: successMessages[deviceType]
        });
        // FIXED: Remove auto-close for success notifications
      } else if (successCount > 0) {
        setNotification({
          type: 'error',
          message: partialSuccessMessages[deviceType]
        });
        setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
      } else {
        setNotification({
          type: 'error',
          message: 'All deletions failed'
        });
        setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
      }
    }

    console.log(`✅ Bulk delete completed: ${successCount} succeeded, ${failedSessions.length} failed`);

  } catch (error: any) {
    console.error('Error in bulk delete:', error);
    
    const errorMessages = {
      mobile: 'Bulk delete failed',
      tablet: 'Failed to delete conversations',
      desktop: `Failed to delete conversations: ${error.message}`
    };
    
    if (setNotification) {
      setNotification({
        type: 'error',
        message: errorMessages[deviceType]
      });
      setTimeout(() => setNotification(null), NOTIFICATION_DURATIONS[deviceType].error);
    }
  } finally {
    setIsLoading(false);
  }
};
