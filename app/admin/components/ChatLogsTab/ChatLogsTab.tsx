// src/app/admin/components/ChatLogsTab/ChatLogsTab.tsx
// FIXED: Now uses chatSessions from props (with database appointment data) instead of useConversationProcessing

'use client';

import React from 'react';
import { ChatLog, ChatSession } from '../../types';

// Hooks
import { useConversationActions } from './hooks/useConversationActions';
import { useEnhancedChatLogs } from './hooks/useEnhancedChatLogs';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { getTouchTargetSize } from '@/utils/deviceUtils';

// Components
import { PerformanceWidget } from './components/PerformanceWidget';
import { EnhancedChatControls } from './components/EnhancedChatControls';
import { EnhancedConversationDisplay } from './components/EnhancedConversationDisplay';
import { EnhancedPagination } from './components/EnhancedPagination';
import { ConversationModal } from './components/ConversationModal';
import { AdvancedChatFeatures } from './components/AdvancedChatFeatures';
import { LeadManagement } from './components/LeadManagement';
import { DeleteConfirmationModal } from './components/DeleteConfirmationModal';

// Utils
import { formatTimestamp } from './utils/formatting';

interface ChatLogsTabProps {
  chatLogs: ChatLog[];
  chatSessions: ChatSession[];
  isLoading: boolean;
  selectedSession: string | null;
  onSelectSession: (sessionId: string | null) => void;
  onViewAppointment?: (appointmentId: number) => void;
  onDeleteConversation?: (sessionId: string) => void;
  onDeleteModalStateChange?: (isOpen: boolean) => void;  // ✅ ADD THIS LINE
}

export const ChatLogsTab = ({
  chatLogs,
  chatSessions,
  isLoading,
  selectedSession,
  onSelectSession,
  onViewAppointment,
  onDeleteConversation,
  onDeleteModalStateChange  // ✅ ADD THIS LINE
}: ChatLogsTabProps) => {
  const { type: deviceType } = useDeviceDetection();
  const touchTargetSize = getTouchTargetSize(deviceType);

  // ✅ FIXED: Use chatSessions directly (has database appointment data)
  // REMOVED: const { conversations } = useConversationProcessing(chatLogs);
  
  // Enhanced chat logs with pagination, filtering, and view modes
  const {
    viewMode,
    setViewMode,
    conversations: paginatedConversations,
    pagination,
    goToPage,
    changePageSize,
    filters,
    setSearchTerm,
    setFilter,
    setSort,
    clearFilters,
    filteredCount
  } = useEnhancedChatLogs(chatSessions); // ✅ FIXED: Pass chatSessions instead

  // Conversation actions
  const {
    selectedConversation,
    showDeleteConfirmation,
    handleConversationClick,
    handleDeleteClick,
    confirmDelete,
    cancelDelete,
    handleBackToConversations
  } = useConversationActions({
    selectedSession,
    onSelectSession,
    onDeleteConversation,
    onViewAppointment
  });

  // ✅ NEW: Notify parent when delete modal opens/closes
  React.useEffect(() => {
    if (onDeleteModalStateChange) {
      onDeleteModalStateChange(showDeleteConfirmation);
    }
  }, [showDeleteConfirmation, onDeleteModalStateChange]);

  // ✅ FIX: Prevent data reload when conversation modal opens/closes
  React.useEffect(() => {
    console.log('Conversation selection changed:', {
      selectedConversation,
      selectedSession,
      totalSessions: chatSessions.length
    });
    
    // Don't do anything - just let the modal open/close without affecting the data
    // The modal will use selectedConversationData which is already in memory
  }, [selectedConversation, selectedSession, chatSessions.length]);

  // ✅ FIXED: Find from chatSessions
  const selectedConversationData = chatSessions.find((conv: any) => conv.sessionId === selectedConversation);

  // Mobile: Single conversation list with drill-down and enhanced features
  const MobileChatLogsTab = () => {
    return (
      <div className="space-y-4">
        {/* Mobile Main Chat Logs Section */}
        <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
          {/* Mobile Header */}
          <div className="p-4 border-b border-slate-600/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Customer Conversations</h2>
            </div>
            <PerformanceWidget />
          </div>

          {/* Mobile Enhanced Controls */}
          <div className="p-4 border-b border-slate-600/50">
            <EnhancedChatControls
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchTerm={filters.searchTerm}
              setSearchTerm={setSearchTerm}
              filter={filters.filter}
              setFilter={setFilter}
              sort={filters.sort}
              setSort={setSort}
              totalItems={chatSessions.length}
              filteredCount={filteredCount}
              onClearFilters={clearFilters}
              deviceType={deviceType}
            />
          </div>

          {/* Mobile Conversations Display */}
          <div className="p-4">
            <EnhancedConversationDisplay
              viewMode={viewMode}
              conversations={paginatedConversations}
              isLoading={isLoading}
              selectedConversation={selectedConversation}
              onConversationClick={handleConversationClick}
              onDeleteClick={handleDeleteClick}
              onViewAppointment={onViewAppointment}
              formatTimestamp={formatTimestamp}
            />
          </div>

          {/* Mobile Pagination */}
          <div className="p-4 border-t border-slate-600/50">
            <EnhancedPagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.pageSize}
              totalItems={pagination.totalItems}
              onPageChange={goToPage}
              viewMode={viewMode}
              deviceType={deviceType}
            />
          </div>
        </div>

        {/* Mobile Premium Features */}
        <AdvancedChatFeatures />
        <LeadManagement />

        {/* Mobile Conversation Modal */}
        {selectedConversationData && (
          <ConversationModal
            conversation={selectedConversationData}
            isOpen={!!selectedConversationData}
            onClose={handleBackToConversations}
            onViewAppointment={onViewAppointment}
            formatTimestamp={formatTimestamp}
          />
        )}

        <DeleteConfirmationModal
          isOpen={showDeleteConfirmation}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      </div>
    );
  };

  // Tablet: Enhanced two-panel layout
  const TabletChatLogsTab = () => (
    <div className="space-y-6">
      {/* Tablet Main Chat Logs Section */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="p-6 border-b border-slate-600/50">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Customer Conversations</h2>
              <p className="text-gray-300 mt-1">View and manage chat conversations by customer</p>
            </div>
            <div className="flex items-center gap-4">
              <PerformanceWidget />
            </div>
          </div>

          {/* Tablet Enhanced Controls */}
          <EnhancedChatControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={filters.searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filters.filter}
            setFilter={setFilter}
            sort={filters.sort}
            setSort={setSort}
            totalItems={chatSessions.length}
            filteredCount={filteredCount}
            onClearFilters={clearFilters}
            deviceType={deviceType}
          />
        </div>

        {/* Tablet Conversations Display */}
        <div className="p-6">
          <EnhancedConversationDisplay
            viewMode={viewMode}
            conversations={paginatedConversations}
            isLoading={isLoading}
            selectedConversation={selectedConversation}
            onConversationClick={handleConversationClick}
            onDeleteClick={handleDeleteClick}
            onViewAppointment={onViewAppointment}
            formatTimestamp={formatTimestamp}
          />

          {/* Tablet Pagination */}
          <EnhancedPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
            viewMode={viewMode}
            deviceType={deviceType}
          />
        </div>
      </div>

      {/* Tablet Premium Feature Sections */}
      <AdvancedChatFeatures />
      <LeadManagement />

      {/* Tablet Conversation Modal */}
      {selectedConversationData && (
        <ConversationModal
          conversation={selectedConversationData}
          isOpen={!!selectedConversationData}
          onClose={handleBackToConversations}
          onViewAppointment={onViewAppointment}
          formatTimestamp={formatTimestamp}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );

  // Desktop: Enhanced three-panel layout with full features
  const DesktopChatLogsTab = () => (
    <div className="space-y-6">
      {/* Desktop Main Chat Logs Section */}
      <div className="bg-gradient-to-br from-slate-800/90 via-red-900/10 to-slate-700/90 backdrop-blur-sm rounded-xl shadow-xl border border-slate-600/50">
        <div className="p-6 border-b border-slate-600/50">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-white">Customer Conversations</h2>
            <p className="text-gray-300 mt-1">View and manage chat conversations by customer</p>
          </div>

          <div className="flex items-center justify-center gap-4 mb-6">
            <PerformanceWidget />
          </div>

          {/* Desktop Enhanced Controls */}
          <EnhancedChatControls
            viewMode={viewMode}
            setViewMode={setViewMode}
            searchTerm={filters.searchTerm}
            setSearchTerm={setSearchTerm}
            filter={filters.filter}
            setFilter={setFilter}
            sort={filters.sort}
            setSort={setSort}
            totalItems={chatSessions.length}
            filteredCount={filteredCount}
            onClearFilters={clearFilters}
            deviceType={deviceType}
          />
        </div>

        {/* Desktop Conversations Display */}
        <div className="p-6">
          <EnhancedConversationDisplay
            viewMode={viewMode}
            conversations={paginatedConversations}
            isLoading={isLoading}
            selectedConversation={selectedConversation}
            onConversationClick={handleConversationClick}
            onDeleteClick={handleDeleteClick}
            onViewAppointment={onViewAppointment}
            formatTimestamp={formatTimestamp}
          />

          {/* Desktop Pagination */}
          <EnhancedPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={goToPage}
            onPageSizeChange={changePageSize}
            viewMode={viewMode}
            deviceType={deviceType}
          />
        </div>
      </div>

      {/* Desktop Premium Feature Sections */}
      <AdvancedChatFeatures />
      <LeadManagement />

      {/* Desktop Conversation Modal */}
      {selectedConversationData && (
        <ConversationModal
          conversation={selectedConversationData}
          isOpen={!!selectedConversationData}
          onClose={handleBackToConversations}
          onViewAppointment={onViewAppointment}
          formatTimestamp={formatTimestamp}
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteConfirmation}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );

  return (
    <ResponsiveWrapper
      mobile={<MobileChatLogsTab />}
      tablet={<TabletChatLogsTab />}
      desktop={<DesktopChatLogsTab />}
    />
  );
};