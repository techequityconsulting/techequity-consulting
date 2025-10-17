// src/app/admin/page.tsx - FIXED: Authentication timing issue + appointment modal state clearing

'use client';

import { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Notification, Appointment } from './types';
import { useAuth } from './hooks/useAuth';
import { useAppointments } from './hooks/useAppointments/index';
import { useAvailability } from './hooks/useAvailability';
import { useSettings } from './hooks/useSettings/index';
import { useChatLogs } from './hooks/useChatLogs';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { ResponsiveWrapper } from '@/components/ResponsiveWrapper';
import { isAuthenticated as checkAuthStatus } from './utils/apiAuth';
import { ProfileTab } from './components/ProfileTab';

// Components
import { AuthForm } from './components/AuthForm';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { AvailabilityTab } from './components/AvailabilityTab';
import { BookingsTab } from './components/BookingsTab/BookingsTab';
import { SettingsTab } from './components/SettingsTab';
import { ChatLogsTab } from './components/ChatLogsTab/ChatLogsTab';
import { AnalyticsTab } from './components/AnalyticsTab';
import { EditAppointmentModal } from './components/EditAppointmentModal';
import { AppointmentModal } from './components/AppointmentModal';
import { NotificationModal } from './components/NotificationModal';
import { ConfirmationModal } from './components/ConfirmationModal';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('availability');
  const [notification, setNotification] = useState<Notification | null>(null);
  // Track chat logs delete confirmation state
  const [isChatDeleteModalOpen, setIsChatDeleteModalOpen] = useState(false);
  
  // Appointment modal state
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Authentication hook
  const { isAuthenticated, loginForm, handleLogin, handleLogout, updateLoginForm } = useAuth();

  // Custom hooks for data management
  const appointments = useAppointments(setNotification);
  const availability = useAvailability(setNotification);
  const settings = useSettings(setNotification);
  
  // Pass appointments.scheduledCalls to useChatLogs for database-driven appointment detection
  const chatLogs = useChatLogs(setNotification, appointments.scheduledCalls);

  // Global synchronized refresh function
  const handleGlobalRefresh = async (silent = false) => {
    if (!silent) {
      console.log('🔄 Starting global refresh across all tabs...');
    }
    setIsRefreshing(true);
    
    try {
      // Refresh all data sources in parallel
      await Promise.all([
        appointments.loadScheduledCalls(),
        chatLogs.refreshChatData(),
        availability.loadWeeklySchedule(),
        availability.loadBlackoutDates(),
        settings.loadAppointmentSettings()
      ]);
      
      if (!silent) {
        console.log('✅ Global refresh completed successfully');
        setNotification({
          type: 'success',
          message: 'All data refreshed successfully'
        });
      }
    } catch (error) {
      console.error('❌ Global refresh failed:', error);
      if (!silent) {
        setNotification({
          type: 'error',
          message: 'Failed to refresh some data. Please try again.'
        });
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Navigation handlers for cross-linking between tabs
  const handleViewConversation = (sessionId: string) => {
    setActiveTab('chat-logs');
    
    // Close appointment modal if open
    if (showAppointmentModal) {
      setShowAppointmentModal(false);
      setSelectedAppointment(null);
    }
    setTimeout(() => {
      chatLogs.handleSelectSession(sessionId);
    }, 100);
  };

  // Enhanced appointment view handler
  const handleViewAppointment = (appointmentId: number) => {
    console.log('Looking for appointment with ID:', appointmentId);
    
    // Handle special case where appointmentId is -1 (find by sessionId)
    if (appointmentId === -1) {
      const currentSessionId = chatLogs.selectedSession;
      if (currentSessionId) {
        const appointment = appointments.scheduledCalls.find(apt => apt.chatSessionId === currentSessionId);
        if (appointment) {
          setActiveTab('bookings');
          setSelectedAppointment(appointment);
          setShowAppointmentModal(true);
          console.log('Opening appointment modal for session:', currentSessionId);
          return;
        }
      }
      
      setNotification({
        type: 'error',
        message: 'Unable to find linked appointment. The appointment may have been deleted or the link is broken.'
      });
      return;
    }
    
    // Find the specific appointment by ID
    const appointment = appointments.scheduledCalls.find(apt => apt.id === appointmentId);
    if (appointment) {
      setActiveTab('bookings');
      setSelectedAppointment(appointment);
      setShowAppointmentModal(true);
      console.log('Opening appointment modal for:', appointment.firstName, appointment.lastName);
    } else {
      console.warn('Appointment not found with ID:', appointmentId);
      setNotification({
        type: 'error',
        message: `Appointment with ID ${appointmentId} not found.`
      });
    }
  };

  // Appointment modal close handler
  const handleCloseAppointmentModal = () => {
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  // Chat logs delete handler
  const handleDeleteConversation = async (sessionId: string) => {
    await chatLogs.deleteConversation(sessionId);
  };

  // Load data ONLY when authenticated AND auth headers are available
  useEffect(() => {
    if (isAuthenticated) {
      // Wait for auth headers to be available in localStorage
      const loadInitialData = async () => {
        // Double-check that auth is actually available
        if (!checkAuthStatus()) {
          console.warn('⚠️ Auth state is true but headers not available yet, waiting...');
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Verify again after waiting
        if (checkAuthStatus()) {
          console.log('✅ User authenticated with valid headers - loading initial data');
          availability.loadWeeklySchedule();
          availability.loadBlackoutDates();
          appointments.loadScheduledCalls();
          settings.loadAppointmentSettings();
          chatLogs.loadAllChatData();
        } else {
          console.error('❌ Authentication failed - unable to load data');
          setNotification({
            type: 'error',
            message: 'Authentication error. Please try logging in again.'
          });
        }
      };
      
      loadInitialData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]); // Only re-run when authentication state changes

// FIXED: Graceful polling effect - pauses when modals are open
useEffect(() => {
  if (!isAuthenticated || !checkAuthStatus()) {
    return;
  }

  // ✅ CRITICAL FIX: Don't poll if ANY modal is open
  const isAnyModalOpen = 
    isChatDeleteModalOpen || 
    showAppointmentModal || 
    appointments.showDeleteConfirmation ||
    appointments.editingAppointment !== null ||  // ✅ NEW: Check if edit modal is open
    chatLogs.selectedSession !== null;           // ✅ NEW: Check if conversation detail is open

  if ((activeTab === 'bookings' || activeTab === 'chat-logs') && !isAnyModalOpen) {
    const pollInterval = setInterval(async () => {
      try {
        // Silent refresh - no notifications during background polling
        await handleGlobalRefresh(true);
      } catch (error) {
        console.error('Polling update failed:', error);
      }
    }, 5000); // 5 seconds for near-instant widget booking updates

    console.log(`Started fast polling for ${activeTab} tab (5s interval)`);
    return () => {
      clearInterval(pollInterval);
      console.log(`Stopped polling for ${activeTab} tab`);
    };
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  isAuthenticated, 
  activeTab, 
  isChatDeleteModalOpen, 
  showAppointmentModal, 
  appointments.showDeleteConfirmation,
  appointments.editingAppointment,  // ✅ NEW: Add to dependency array
  chatLogs.selectedSession           // ✅ NEW: Add to dependency array
]);

  // Show authentication form if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthForm
        loginForm={loginForm}
        onLogin={handleLogin}
        onUpdateForm={updateLoginForm}
      />
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'availability':
        return (
          <AvailabilityTab
            weeklySchedule={availability.weeklySchedule}
            blackoutDates={availability.blackoutDates}
            isLoading={availability.isLoading}
            onUpdateDaySchedule={availability.updateDaySchedule}
            onSaveSchedule={availability.saveWeeklySchedule}
            onAddBlackout={availability.addBlackoutDate}
            onRemoveBlackout={availability.removeBlackoutDate}
          />
        );
      case 'bookings':
        return (
          <BookingsTab
            scheduledCalls={appointments.scheduledCalls}
            isLoading={appointments.isLoading}
            onEdit={appointments.openEditModal}
            onDelete={appointments.initiateDeleteAppointment}
            onViewConversation={handleViewConversation}
            onAppointmentClick={(appointment) => {
              setSelectedAppointment(appointment);
              setShowAppointmentModal(true);
            }}
          />
        );
      case 'settings':
        return (
          <SettingsTab
            appointmentSettings={settings.appointmentSettings}
            isLoading={settings.isLoading}
            onUpdateSettings={settings.updateSettings}
            onSaveSettings={settings.saveAppointmentSettings}
          />
        );
      case 'chat-logs':
        return (
          <ChatLogsTab
            chatLogs={chatLogs.chatLogs}
            chatSessions={chatLogs.chatSessions}
            isLoading={chatLogs.isLoading}
            selectedSession={chatLogs.selectedSession}
            onSelectSession={(sessionId) => {
              chatLogs.setSelectedSession(sessionId);
            }}
            onViewAppointment={handleViewAppointment}
            onDeleteConversation={handleDeleteConversation}
            onDeleteModalStateChange={setIsChatDeleteModalOpen}
          />
        );
      case 'analytics':
        return <AnalyticsTab />;
      case 'profile':  // NEW CASE
        return (
          <ProfileTab
            currentUsername={loginForm.username || 'gabriel'}
            onSuccess={(message) => setNotification({ type: 'success', message })}
            onError={(message) => setNotification({ type: 'error', message })}
          />
        );
      default:
        return null;
    }
  };

  // Mobile: Full-screen layout with bottom navigation
  const MobileAdminPanel = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 pb-20">
      <Header onLogout={handleLogout} onRefresh={handleGlobalRefresh} isRefreshing={isRefreshing} />
      
      <div className="px-4 py-4">
        {renderTabContent()}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700 z-50">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={handleCloseAppointmentModal}
        onEdit={(appointment) => {
          appointments.openEditModal(appointment);
          setShowAppointmentModal(false);
        }}
        onDelete={(appointmentId) => {
          // FIXED: Pass callback to clear modal state after deletion
          appointments.initiateDeleteAppointment(appointmentId, async () => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
            await handleGlobalRefresh(true); // Silent refresh after delete
          });
        }}
        onViewConversation={handleViewConversation}
      />

      <ConfirmationModal
        isOpen={appointments.showDeleteConfirmation}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        onConfirm={appointments.confirmDeleteAppointment}
        onCancel={appointments.cancelDeleteAppointment}
      />

      <NotificationModal
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );

  // Tablet: Side navigation with optimized layout
  const TabletAdminPanel = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header onLogout={handleLogout} onRefresh={handleGlobalRefresh} isRefreshing={isRefreshing} />
      
      <div className="flex">
        <div className="w-20 bg-gray-800/50 backdrop-blur-sm border-r border-gray-700">
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        <div className="flex-1 px-6 py-6">
          {renderTabContent()}
        </div>
      </div>

      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={handleCloseAppointmentModal}
        onEdit={(appointment) => {
          appointments.openEditModal(appointment);
          setShowAppointmentModal(false);
        }}
        onDelete={(appointmentId) => {
          // FIXED: Pass callback to clear modal state after deletion
          appointments.initiateDeleteAppointment(appointmentId, async () => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
            await handleGlobalRefresh(true); // Silent refresh after delete
          });
        }}
        onViewConversation={handleViewConversation}
      />

      <ConfirmationModal
        isOpen={appointments.showDeleteConfirmation}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        onConfirm={appointments.confirmDeleteAppointment}
        onCancel={appointments.cancelDeleteAppointment}
      />

      <NotificationModal
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );

  // Desktop: Full dashboard layout with all features
  const DesktopAdminPanel = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <Header onLogout={handleLogout} onRefresh={handleGlobalRefresh} isRefreshing={isRefreshing} />
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderTabContent()}
      </div>

      <AppointmentModal
        appointment={selectedAppointment}
        isOpen={showAppointmentModal}
        onClose={handleCloseAppointmentModal}
        onEdit={(appointment) => {
          appointments.openEditModal(appointment);
          setShowAppointmentModal(false);
        }}
        onDelete={(appointmentId) => {
          // FIXED: Pass callback to clear modal state after deletion
          appointments.initiateDeleteAppointment(appointmentId, async () => {
            setShowAppointmentModal(false);
            setSelectedAppointment(null);
            await handleGlobalRefresh(true); // Silent refresh after delete
          });
        }}
        onViewConversation={handleViewConversation}
      />

      <ConfirmationModal
        isOpen={appointments.showDeleteConfirmation}
        title="Delete Appointment"
        message="Are you sure you want to delete this appointment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        confirmButtonClass="bg-red-600 text-white hover:bg-red-700"
        onConfirm={appointments.confirmDeleteAppointment}
        onCancel={appointments.cancelDeleteAppointment}
      />

      <NotificationModal
        notification={notification}
        onClose={() => setNotification(null)}
      />
    </div>
  );

  return (
    <>
      <ResponsiveWrapper
        mobile={<MobileAdminPanel />}
        tablet={<TabletAdminPanel />}
        desktop={<DesktopAdminPanel />}
      />

      {/* Modals outside responsive wrapper to prevent unmounting */}
      <EditAppointmentModal
        editingAppointment={appointments.editingAppointment}
        editForm={appointments.editForm}
        isLoading={appointments.isLoading}
        onClose={appointments.closeEditModal}
        onSave={appointments.saveEditedAppointment}
        onFormChange={appointments.handleEditFormChange}
      />
    </>
  );
}