// src/app/techequity-demo/hooks/useWidgetBookingIntegration.ts
// Hook to integrate widget booking button with scheduling modal
// FIXED: Pass sessionId from widget event to callback

import { useEffect } from 'react';

interface WidgetBookingEvent {
  detail: {
    sessionId: string;
    userName: string;
    clientId: string;
  };
}

interface UseWidgetBookingIntegrationProps {
  onScheduleCallClick: (sessionId?: string) => void; // FIXED: Accept sessionId parameter
}

export const useWidgetBookingIntegration = ({
  onScheduleCallClick
}: UseWidgetBookingIntegrationProps) => {
  useEffect(() => {
    // Listen for booking button clicks from the widget
    const handleScheduleCall = (event: Event) => {
      const customEvent = event as CustomEvent<WidgetBookingEvent['detail']>;
      
      console.log('📅 Widget booking event received:', customEvent.detail);
      
      // FIXED: Pass sessionId from widget event to the callback
      const { sessionId, userName, clientId } = customEvent.detail;
      
      console.log('🔗 Passing session ID to booking modal:', sessionId);
      
      // Trigger the scheduling modal WITH the session ID
      onScheduleCallClick(sessionId);
    };

    // Add event listener
    window.addEventListener('autoassistpro:schedule-call', handleScheduleCall);

    console.log('✅ Widget booking integration initialized');

    // Cleanup
    return () => {
      window.removeEventListener('autoassistpro:schedule-call', handleScheduleCall);
    };
  }, [onScheduleCallClick]);
};