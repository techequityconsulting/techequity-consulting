// app/page.tsx
// TechEquity Consulting Main Page with AutoAssistPro Integration

'use client';

import { useState, useEffect, useRef } from 'react';
import Script from 'next/script';

// Components
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { ContactSection } from './components/ContactSection';
import { TrustedPartnersSection } from './components/TrustedPartnersSection';
import { Footer } from './components/Footer';
import { SchedulingModal } from './components/SchedulingModal';

// Hooks
import { useScheduling } from './hooks/useScheduling';
import { useFormData } from './hooks/useFormData';
import { useWidgetBookingIntegration } from './hooks/useWidgetBookingIntegration';

export default function Home() {
  // Initialize hooks
  const scheduling = useScheduling();
  const formData = useFormData();

  // State to store the widget's session ID
  const [widgetSessionId, setWidgetSessionId] = useState<string>('');
  
  // Track widget loading state to prevent double initialization
  const [isWidgetLoaded, setIsWidgetLoaded] = useState(false);
  const widgetLoadAttempts = useRef(0);

  // Cleanup function and keyboard shortcut for admin access
  useEffect(() => {
    console.log('🚀 TechEquity page mounted');

    // Keyboard shortcut for admin access: Ctrl+Shift+A (or Cmd+Shift+A on Mac)
    const handleAdminShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        console.log('🔑 Admin shortcut triggered');
        window.location.href = '/admin';
      }
    };

    // Add keyboard listener
    document.addEventListener('keydown', handleAdminShortcut);

    // Cleanup function runs when component unmounts
    return () => {
      console.log('🧹 TechEquity page unmounting, cleaning up widget...');
      
      // Remove keyboard listener
      document.removeEventListener('keydown', handleAdminShortcut);
      
      // Call widget cleanup if available
      if ((window as any).AutoAssistPro?.cleanup) {
        (window as any).AutoAssistPro.cleanup();
      }
      
      // Reset loading state
      setIsWidgetLoaded(false);
      widgetLoadAttempts.current = 0;
    };
  }, []);

  // Combined handler for scheduling call
  // Captures sessionId from widget event
  const handleScheduleCall = (sessionId?: string) => {
    if (sessionId) {
      console.log('📋 Captured session ID from widget:', sessionId);
      setWidgetSessionId(sessionId);
    }
    
    scheduling.handleScheduleCall();
    formData.resetForm();
  };

  // Combined handler for booking confirmation
  // Passes captured sessionId to appointment booking
  const handleBookingConfirmation = async () => {
    console.log('💾 Booking appointment with session ID:', widgetSessionId);
    
    await scheduling.handleBookingConfirmation(
      formData.formData,
      widgetSessionId,
      (dayName: string, time: string, email: string) => {
        // Scheduling confirmation callback
        console.log('✅ Appointment booked:', { dayName, time, email, sessionId: widgetSessionId });
        
        // Dispatch event to widget to show confirmation message
        window.dispatchEvent(new CustomEvent('autoassistpro:booking-confirmed', {
          detail: { dayName, time, email }
        }));

        // Clear the session ID after successful booking
        setWidgetSessionId('');
      }
    );
  };

  // Initialize widget booking integration
  useWidgetBookingIntegration({
    onScheduleCallClick: handleScheduleCall
  });

  // Handle widget script loading with safeguards
  const handleWidgetLoad = () => {
    widgetLoadAttempts.current += 1;
    
    if (widgetLoadAttempts.current > 1) {
      console.warn('⚠️ Widget script loaded multiple times! Attempt:', widgetLoadAttempts.current);
      return;
    }
    
    if (isWidgetLoaded) {
      console.warn('⚠️ Widget already loaded, skipping initialization');
      return;
    }
    
    setIsWidgetLoaded(true);
    console.log('✅ AutoAssistPro widget loaded successfully');
  };

  return (
    <>
      {/* Widget Configuration Script */}
      {/* Only load if widget not already loaded */}
      {!isWidgetLoaded && (
        <>
          <Script
            id="autoassistpro-config"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.AutoAssistProConfig = {
                  apiKey: 'pk_live_techequity_cbb31add4925bad252950cd9d9ff7ad0',
                  clientId: 'client_techequity_001',
                  position: 'bottom-right',
                  primaryColor: '#0ea5e9',
                  companyName: 'TechEquity Consulting',
                  botName: 'Renan',
                  greeting: 'Hi! How can we help you today?',
                  debug: true,
                  apiBaseUrl: window.location.hostname === 'localhost' 
                    ? 'http://localhost:3001'
                    : 'https://www.autoassistpro.org'
                };
              `,
            }}
          />

          {/* Load Widget Script */}
          <Script
            src="/widget.js?v=2"
            strategy="afterInteractive"
            onLoad={handleWidgetLoad}
            onError={(e) => {
              console.error('❌ Failed to load widget script:', e);
              widgetLoadAttempts.current += 1;
            }}
          />
        </>
      )}

      {/* Main Page Content */}
      <div id="home" className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950">
        <Header />
        <HeroSection />
        <AboutSection />
        <TrustedPartnersSection />
        <ServicesSection />
        <ContactSection />
        <Footer />

        {/* Scheduling Modal */}
        <SchedulingModal
          showSchedulingModal={scheduling.showSchedulingModal}
          formData={formData.formData}
          selectedDate={scheduling.selectedDate}
          selectedTime={scheduling.selectedTime}
          availableSlots={scheduling.availableSlots}
          isLoadingSlots={scheduling.isLoadingSlots}
          isBooking={scheduling.isBooking}
          handleInputChange={formData.handleInputChange}
          handlePhoneChange={formData.handlePhoneChange}
          setSelectedDate={scheduling.setSelectedDate}
          setSelectedTime={scheduling.setSelectedTime}
          closeSchedulingModal={scheduling.closeSchedulingModal}
          onBookingConfirmation={handleBookingConfirmation}
        />
      </div>
    </>
  );
}