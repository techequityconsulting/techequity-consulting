// app/admin/page.tsx
// iframe-based admin panel - embeds AutoAssistPro's admin interface
// FIXED: Hydration mismatch by ensuring client-only rendering

'use client';

import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [adminUrl, setAdminUrl] = useState(''); // ✅ Start empty, set on client only

  // ✅ FIX: Determine URL only on client side to avoid hydration mismatch
  useEffect(() => {
    const url = window.location.hostname === 'localhost'
      ? 'http://localhost:3001/admin'
      : 'https://www.autoassistpro.org/admin';
    
    setAdminUrl(url);
  }, []);

  // Handle iframe load success
  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log('✅ Admin panel loaded successfully from:', adminUrl);
  };

  // Handle iframe load error
  const handleIframeError = () => {
    setIsLoading(false);
    setHasError(true);
    console.error('❌ Failed to load admin panel from:', adminUrl);
  };

  // Listen for messages from iframe (for future features)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: Verify origin in production
      // TODO: Enable this in production
      // if (process.env.NODE_ENV === 'production') {
      //   const allowedOrigins = ['https://www.autoassistpro.org'];
      //   if (!allowedOrigins.includes(event.origin)) {
      //     console.warn('Blocked postMessage from unauthorized origin:', event.origin);
      //     return;
      //   }
      // }

      // Handle messages from AutoAssistPro admin panel
      switch (event.data.type) {
        case 'autoassistpro:admin-ready':
          console.log('📊 Admin panel ready:', event.data);
          break;

        case 'autoassistpro:admin-logout':
          console.log('🚪 User logged out from admin panel');
          // Optional: Redirect to homepage or login
          break;

        case 'autoassistpro:admin-error':
          console.error('Admin panel error:', event.data.error);
          setHasError(true);
          break;

        default:
          // Log unknown messages in dev mode
          if (process.env.NODE_ENV === 'development') {
            console.log('Message from admin panel:', event.data);
          }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // Cleanup: Remove any existing scroll lock
  useEffect(() => {
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ✅ Don't render iframe until we have the URL (client-side only)
  if (!adminUrl) {
    return (
      <div className="h-screen w-screen bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-white text-2xl font-semibold mb-2">
            Loading Admin Panel
          </h2>
          <p className="text-gray-400 text-sm">
            Initializing...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 flex items-center justify-center z-50">
          <div className="text-center">
            {/* Animated Loading Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>

            {/* Loading Text */}
            <h2 className="text-white text-2xl font-semibold mb-2">
              Loading Admin Panel
            </h2>
            <p className="text-gray-400 text-sm">
              Connecting to AutoAssistPro...
            </p>

            {/* Branding */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-xs">
                Powered by AutoAssistPro
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {hasError && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center z-50">
          <div className="text-center max-w-md px-6">
            {/* Error Icon */}
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            {/* Error Message */}
            <h2 className="text-white text-2xl font-semibold mb-3">
              Failed to Load Admin Panel
            </h2>
            <p className="text-gray-400 mb-2">
              Unable to connect to AutoAssistPro services.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Please check your internet connection and try again.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg hover:shadow-xl"
              >
                Retry
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-8 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium transition-colors"
              >
                Go Home
              </button>
            </div>

            {/* Support Info */}
            <div className="mt-8 pt-8 border-t border-white/10">
              <p className="text-gray-500 text-xs">
                If the problem persists, please contact support
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel iframe */}
      <iframe
        src={adminUrl}
        className="w-full h-full border-0"
        title="AutoAssistPro Admin Panel"
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        allow="clipboard-write; clipboard-read"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-downloads"
        style={{
          display: isLoading || hasError ? 'none' : 'block',
          colorScheme: 'dark'
        }}
      />
    </div>
  );
}