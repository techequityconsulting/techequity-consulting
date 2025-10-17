// src/app/admin/components/ChatLogsTab/types/index.ts

import { ChatLog } from '../../../types';

export interface ConversationBox {
  sessionId: string;
  userName: string;
  userEmail?: string;  // NEW: User's email address
  messageCount: number;
  firstMessage: string;
  lastActivity: string;
  duration: string;
  hasAppointment: boolean;
  messages: ChatLog[];
  appointmentId?: number;
}