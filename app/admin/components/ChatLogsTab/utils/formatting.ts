// src/app/admin/components/ChatLogsTab/utils/formatting.ts
// FIXED: Keep full session ID, just remove "session_" prefix for display

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

// FIXED: Only remove the "session_" prefix, keep the full ID with both timestamp and random parts
export const formatSessionId = (sessionId: string): string => {
  if (!sessionId) return 'N/A';
  
  // If it starts with "session_", remove that prefix for cleaner display
  if (sessionId.startsWith('session_')) {
    return sessionId.substring(8); // Remove "session_" (8 characters)
  }
  
  // Otherwise return as-is
  return sessionId;
};