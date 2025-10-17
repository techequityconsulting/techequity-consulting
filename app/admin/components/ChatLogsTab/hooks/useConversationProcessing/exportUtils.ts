// src/app/admin/components/ChatLogsTab/hooks/useConversationProcessing/exportUtils.ts
// Export functionality for conversations (JSON and CSV formats)

import { ConversationBox } from '../../types';
import { DeviceType, ExportFormat, ExportData, CSVRow } from './types';

/**
 * Export processed conversations to JSON or CSV format
 * Creates downloadable file with device-specific formatting
 */
export const exportProcessedData = (
  conversations: ConversationBox[],
  deviceType: DeviceType,
  format: ExportFormat = 'json'
): void => {
  try {
    if (format === 'json') {
      exportAsJSON(conversations, deviceType);
    } else if (format === 'csv') {
      exportAsCSV(conversations, deviceType);
    }
  } catch (error) {
    console.error('Export failed:', error);
  }
};

/**
 * Export conversations as JSON file
 * Includes device-specific metadata
 */
const exportAsJSON = (conversations: ConversationBox[], deviceType: DeviceType): void => {
  const exportData = prepareJSONExportData(conversations, deviceType);
  const jsonString = JSON.stringify(exportData, null, 2);
  
  const filename = `conversations-processed-${deviceType}-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonString, filename, 'application/json');
};

/**
 * Export conversations as CSV file
 * Device-optimized column selection
 */
const exportAsCSV = (conversations: ConversationBox[], deviceType: DeviceType): void => {
  const csvData = prepareCSVExportData(conversations, deviceType);
  const csvString = convertToCSVString(csvData);
  
  const filename = `conversations-processed-${deviceType}-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csvString, filename, 'text/csv');
};

/**
 * Prepare conversation data for JSON export
 */
const prepareJSONExportData = (
  conversations: ConversationBox[],
  deviceType: DeviceType
): any => {
  if (deviceType === 'mobile') {
    // Mobile: Minimal export for performance
    return {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        deviceType: 'mobile',
        totalConversations: conversations.length
      },
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        userName: conv.userName,
        messageCount: conv.messageCount,
        lastActivity: conv.lastActivity,
        hasAppointment: conv.hasAppointment
      }))
    };
  } else if (deviceType === 'tablet') {
    // Tablet: Moderate detail
    return {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        deviceType: 'tablet',
        totalConversations: conversations.length,
        exportedBy: 'AutoAssistPro Admin Panel'
      },
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        userName: conv.userName,
        messageCount: conv.messageCount,
        firstMessage: conv.firstMessage,
        lastActivity: conv.lastActivity,
        duration: conv.duration,
        hasAppointment: conv.hasAppointment
      }))
    };
  } else {
    // Desktop: Full export with complete data
    return {
      exportMetadata: {
        exportDate: new Date().toISOString(),
        deviceType: 'desktop',
        totalConversations: conversations.length,
        exportedBy: 'AutoAssistPro Admin Panel',
        version: '1.0.0'
      },
      conversations: conversations.map(conv => ({
        sessionId: conv.sessionId,
        userName: conv.userName,
        messageCount: conv.messageCount,
        firstMessage: conv.firstMessage,
        lastActivity: conv.lastActivity,
        duration: conv.duration,
        hasAppointment: conv.hasAppointment,
        appointmentId: conv.appointmentId,
        messages: conv.messages.map(msg => ({
          timestamp: msg.timestamp,
          messageType: msg.messageType,
          content: msg.content,
          userInfo: msg.userInfo
        }))
      }))
    };
  }
};

/**
 * Prepare conversation data for CSV export
 */
const prepareCSVExportData = (
  conversations: ConversationBox[],
  deviceType: DeviceType
): CSVRow[] => {
  return conversations.map(conv => {
    const baseData: CSVRow = {
      sessionId: conv.sessionId,
      userName: conv.userName,
      messageCount: conv.messageCount,
      lastActivity: conv.lastActivity,
      hasAppointment: conv.hasAppointment
    };
    
    // Add device-specific columns
    if (deviceType === 'tablet' || deviceType === 'desktop') {
      baseData.firstMessage = conv.firstMessage.replace(/"/g, '""'); // Escape quotes
      baseData.duration = conv.duration;
    }
    
    if (deviceType === 'desktop') {
      baseData.appointmentId = conv.appointmentId || '';
      baseData.processingTimestamp = new Date().toISOString();
    }
    
    return baseData;
  });
};

/**
 * Convert CSV data array to CSV string
 */
const convertToCSVString = (data: CSVRow[]): string => {
  if (data.length === 0) return '';
  
  // Get headers from first row
  const headers = Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      const stringValue = String(value);
      
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',')
  );
  
  // Combine header and data rows
  return [headerRow, ...dataRows].join('\n');
};

/**
 * Download file to user's device
 */
const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export single conversation with full details
 */
export const exportSingleConversation = (
  conversation: ConversationBox,
  format: ExportFormat = 'json'
): void => {
  try {
    if (format === 'json') {
      const data = {
        conversation: {
          sessionId: conversation.sessionId,
          userName: conversation.userName,
          messageCount: conversation.messageCount,
          firstMessage: conversation.firstMessage,
          lastActivity: conversation.lastActivity,
          duration: conversation.duration,
          hasAppointment: conversation.hasAppointment,
          appointmentId: conversation.appointmentId,
          messages: conversation.messages
        },
        exportDate: new Date().toISOString()
      };
      
      const jsonString = JSON.stringify(data, null, 2);
      const filename = `conversation-${conversation.sessionId}-${new Date().toISOString().split('T')[0]}.json`;
      downloadFile(jsonString, filename, 'application/json');
    } else {
      // CSV export for single conversation (message-level detail)
      const csvRows = conversation.messages.map(msg => ({
        sessionId: conversation.sessionId,
        userName: conversation.userName,
        timestamp: msg.timestamp,
        messageType: msg.messageType,
        content: msg.content.replace(/"/g, '""')
      }));
      
      const csvString = convertToCSVString(csvRows);
      const filename = `conversation-${conversation.sessionId}-${new Date().toISOString().split('T')[0]}.csv`;
      downloadFile(csvString, filename, 'text/csv');
    }
  } catch (error) {
    console.error('Single conversation export failed:', error);
  }
};

/**
 * Export conversations with appointments only
 */
export const exportAppointmentConversations = (
  conversations: ConversationBox[],
  format: ExportFormat = 'json'
): void => {
  const appointmentConvs = conversations.filter(conv => conv.hasAppointment);
  exportProcessedData(appointmentConvs, 'desktop', format);
};

/**
 * Export conversation summary statistics
 */
export const exportConversationStats = (conversations: ConversationBox[]): void => {
  const stats = {
    totalConversations: conversations.length,
    conversationsWithAppointments: conversations.filter(c => c.hasAppointment).length,
    uniqueUsers: new Set(conversations.map(c => c.userName)).size,
    totalMessages: conversations.reduce((sum, c) => sum + c.messageCount, 0),
    averageMessagesPerConversation: conversations.length > 0 
      ? Math.round(conversations.reduce((sum, c) => sum + c.messageCount, 0) / conversations.length)
      : 0,
    exportDate: new Date().toISOString(),
    dateRange: {
      earliest: conversations.length > 0 
        ? new Date(Math.min(...conversations.map(c => new Date(c.lastActivity).getTime()))).toISOString()
        : null,
      latest: conversations.length > 0
        ? new Date(Math.max(...conversations.map(c => new Date(c.lastActivity).getTime()))).toISOString()
        : null
    }
  };
  
  const jsonString = JSON.stringify(stats, null, 2);
  const filename = `conversation-stats-${new Date().toISOString().split('T')[0]}.json`;
  downloadFile(jsonString, filename, 'application/json');
};

/**
 * Export conversations by date range
 */
export const exportConversationsByDateRange = (
  conversations: ConversationBox[],
  startDate: Date,
  endDate: Date,
  format: ExportFormat = 'json'
): void => {
  const filteredConvs = conversations.filter(conv => {
    const convDate = new Date(conv.lastActivity);
    return convDate >= startDate && convDate <= endDate;
  });
  
  exportProcessedData(filteredConvs, 'desktop', format);
};

/**
 * Prepare export preview (first N conversations)
 * Useful for showing user what will be exported
 */
export const getExportPreview = (
  conversations: ConversationBox[],
  count: number = 5
): ExportData[] => {
  return conversations.slice(0, count).map(conv => ({
    sessionId: conv.sessionId,
    userName: conv.userName,
    messageCount: conv.messageCount,
    firstMessage: conv.firstMessage,
    lastActivity: conv.lastActivity,
    duration: conv.duration,
    hasAppointment: conv.hasAppointment,
    deviceProcessed: 'desktop' as DeviceType,
    processingTimestamp: new Date().toISOString()
  }));
};

/**
 * Calculate export file size estimate
 * Returns size in KB
 */
export const estimateExportSize = (
  conversations: ConversationBox[],
  format: ExportFormat
): number => {
  const sampleData = prepareJSONExportData(conversations, 'desktop');
  const jsonString = JSON.stringify(sampleData);
  const bytes = new Blob([jsonString]).size;
  
  if (format === 'csv') {
    // CSV is typically 60-70% of JSON size
    return Math.round((bytes * 0.65) / 1024);
  }
  
  return Math.round(bytes / 1024);
};

/**
 * Validate export data before download
 */
export const validateExportData = (conversations: ConversationBox[]): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (conversations.length === 0) {
    errors.push('No conversations to export');
  }
  
  const invalidConversations = conversations.filter(conv => 
    !conv.sessionId || !conv.userName || conv.messageCount === 0
  );
  
  if (invalidConversations.length > 0) {
    errors.push(`${invalidConversations.length} conversations have missing required data`);
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};