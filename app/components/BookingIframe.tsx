// app/components/BookingIframe.tsx
// iframe-based booking modal - embeds AutoAssistPro's booking endpoint

'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface BookingIframeProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  apiKey: string;
  sessionId?: string;
}

export const BookingIframe = ({
  isOpen,
  onClose,
  clientId,
  apiKey,
  sessionId
}: BookingIframeProps) => {
  // Listen for booking confirmation from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin in production
      // if (event.origin !== 'https://www.autoassistpro.org') return;

      if (event.data.type === 'autoassistpro:booking-confirmed') {
        console.log('✅ Booking confirmed via iframe:', event.data.data);

        // Forward booking confirmation to widget
        // This allows the widget to show a success message in the chat
        window.dispatchEvent(new CustomEvent('autoassistpro:booking-confirmed', {
          detail: event.data.data
        }));

        // Close iframe after successful booking
        setTimeout(() => {
          onClose();
        }, 1000); // Small delay so user sees success state
      }
    };

    if (isOpen) {
      window.addEventListener('message', handleMessage);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isOpen, onClose]);

  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Build iframe URL
  const baseUrl = typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://www.autoassistpro.org';

  const params = new URLSearchParams({
    clientId,
    apiKey,
    ...(sessionId && { sessionId })
  });

  const iframeUrl = `${baseUrl}/booking?${params.toString()}`;

  console.log('📱 Opening booking iframe:', iframeUrl);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="relative w-full max-w-3xl h-[85vh] bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-12 h-12 flex items-center justify-center bg-white/90 hover:bg-white text-slate-900 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95"
            aria-label="Close booking"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Header */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 z-10">
            <h2 className="text-white text-xl font-semibold text-center">
              Schedule Your Discovery Call
            </h2>
            <p className="text-white/80 text-sm text-center mt-1">
              Powered by AutoAssistPro
            </p>
          </div>

          {/* iframe */}
          <div className="pt-20 h-full">
            <iframe
              src={iframeUrl}
              className="w-full h-full border-0"
              title="Schedule Appointment"
              allow="clipboard-write"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          {/* Loading fallback (shown while iframe loads) */}
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 pointer-events-none opacity-0 transition-opacity duration-300">
            <div className="text-white text-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p>Loading booking form...</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
