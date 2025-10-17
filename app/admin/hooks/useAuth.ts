// src/app/admin/hooks/useAuth.ts

'use client';

import { useState, useEffect } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { storeApiKey } from '../utils/apiAuth';
import { getAdminApiBaseUrl } from '../utils/apiConfig';

interface LoginForm {
  username: string;
  password: string;
}

export const useAuth = () => {
  const { type: deviceType, isTouchDevice } = useDeviceDetection();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: '', password: '' });
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // Device-aware session management with different session durations
  useEffect(() => {
    const savedSession = localStorage.getItem('techequity-admin-session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = new Date().getTime();
        
        // Device-specific session durations
        const sessionDurations = {
          mobile: 300000,   // 5 minutes on mobile for security
          tablet: 600000,   // 10 minutes on tablet
          desktop: 1800000  // 30 minutes on desktop
        };
        
        const sessionDuration = sessionDurations[deviceType];
        
        // ✅ CRITICAL: Check if session is valid AND has API key
        if (now - session.timestamp < sessionDuration && session.apiKey) {
          setIsAuthenticated(true);
          
          // Device-specific session extension behavior
          if (deviceType === 'desktop') {
            // Desktop: Auto-extend session
            localStorage.setItem('techequity-admin-session', JSON.stringify({
              ...session, // ✅ Preserve all data including apiKey
              timestamp: now
            }));
          } else if (deviceType === 'tablet') {
            // Tablet: Extend but with confirmation after certain time
            const timeSinceLogin = now - session.timestamp;
            if (timeSinceLogin > 300000) { // 5 minutes
              console.log('Tablet session extended - consider re-authentication soon');
            }
            localStorage.setItem('techequity-admin-session', JSON.stringify({
              ...session,
              timestamp: now,
              extended: true
            }));
          } else {
            // Mobile: No auto-extension, just validate
            console.log('Mobile session validated - will expire soon for security');
          }
          
          console.log(`Session restored for ${deviceType} device`);
        } else {
          // Session expired or no API key, remove it
          localStorage.removeItem('techequity-admin-session');
          console.log(`Session expired for ${deviceType} device`);
          
          // Device-specific expiration notifications
          if (deviceType === 'mobile') {
            console.log('Mobile session expired for security - please login again');
          }
        }
      } catch (error) {
        // Corrupted session data
        console.error('Session data corrupted, removing:', error);
        localStorage.removeItem('techequity-admin-session');
      }
    }
  }, [deviceType]);

  // Device-aware login attempt tracking
  useEffect(() => {
    // Device-specific lockout thresholds
    const lockoutThresholds = {
      mobile: 3,    // More strict on mobile
      tablet: 4,    // Moderate on tablet
      desktop: 5    // More lenient on desktop
    };
    
    if (loginAttempts >= lockoutThresholds[deviceType]) {
      setIsLocked(true);
      
      // Device-specific lockout durations
      const lockoutDurations = {
        mobile: 300000,   // 5 minutes on mobile
        tablet: 180000,   // 3 minutes on tablet
        desktop: 120000   // 2 minutes on desktop
      };
      
      const lockoutTimer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        console.log(`${deviceType} lockout expired`);
      }, lockoutDurations[deviceType]);

      console.log(`Account locked on ${deviceType} for ${lockoutDurations[deviceType] / 60000} minutes`);
      
      return () => clearTimeout(lockoutTimer);
    }
  }, [loginAttempts, deviceType]);

  // Device-aware login handling - calls backend API
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLocked) {
      // Device-specific lockout messages
      const lockoutMessages = {
        mobile: 'Account locked. Wait and try again.',
        tablet: 'Too many attempts. Please wait a few minutes.',
        desktop: 'Account temporarily locked due to multiple failed attempts. Please wait a few minutes and try again.'
      };
      
      alert(lockoutMessages[deviceType]);
      return;
    }
    
    try {
      // Call login API endpoint
      const response = await fetch(`${getAdminApiBaseUrl()}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: loginForm.username.trim(),
          password: loginForm.password
        })
      });

      const result = await response.json();

      if (result.success) {
        // Login successful - store API key and session
        handleSuccessfulLogin(result.data.apiKey, result.data.user, result.data.client);
      } else {
        // Login failed
        handleFailedLogin();
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please check your connection and try again.');
    }
  };

  // Device-aware successful login processing
  const handleSuccessfulLogin = (apiKey: string, user: any, client: any) => {
    setIsAuthenticated(true);
    setLoginAttempts(0);
    setIsLocked(false);
    
    // Device-specific session data with API key from backend
    const sessionData = {
      authenticated: true,
      timestamp: new Date().getTime(),
      deviceType: deviceType,
      isTouchDevice: isTouchDevice,
      loginMethod: `${deviceType}_api`,
      userAgent: navigator.userAgent,
      loginLocation: 'admin_panel',
      apiKey: apiKey, // ✅ API key from backend
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName
      },
      client: {
        id: client.id,
        companyName: client.companyName,
        planTier: client.planTier
      }
    };
    
    localStorage.setItem('techequity-admin-session', JSON.stringify(sessionData));
    
    // Device-specific login logging
    console.log(`✅ Successful ${deviceType} login for ${user.username} (${client.companyName})`);
    
    // Clear form for security
    setLoginForm({ username: '', password: '' });
  };

  // Device-aware failed login handling
  const handleFailedLogin = () => {
    const newAttemptCount = loginAttempts + 1;
    setLoginAttempts(newAttemptCount);
    
    // Device-specific error messages and behavior
    if (deviceType === 'mobile') {
      // Mobile: Clear form immediately for security and simplicity
      setLoginForm({ username: '', password: '' });
      
      const remainingAttempts = 3 - newAttemptCount;
      if (remainingAttempts > 0) {
        alert(`Wrong login. ${remainingAttempts} attempts left.`);
      } else {
        alert('Too many attempts. Account locked.');
      }
    } else if (deviceType === 'tablet') {
      // Tablet: Clear password, keep username
      setLoginForm(prev => ({ ...prev, password: '' }));
      
      const remainingAttempts = 4 - newAttemptCount;
      if (remainingAttempts > 0) {
        alert(`Invalid credentials. ${remainingAttempts} attempts remaining.`);
      } else {
        alert('Account locked due to too many failed attempts.');
      }
    } else {
      // Desktop: Keep form data, comprehensive message
      const remainingAttempts = 5 - newAttemptCount;
      if (remainingAttempts > 0) {
        alert(`Invalid credentials. You have ${remainingAttempts} attempts remaining.`);
      } else {
        alert('Account temporarily locked due to multiple failed login attempts. Please wait a few minutes.');
        setLoginForm({ username: '', password: '' });
      }
    }
    
    console.log(`Failed ${deviceType} login attempt ${newAttemptCount}`);
  };

  // Device-aware logout handling
  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('techequity-admin-session');
    
    // Device-specific logout behavior
    if (deviceType === 'mobile') {
      // Mobile: Clear everything immediately
      setLoginForm({ username: '', password: '' });
      setLoginAttempts(0);
      setIsLocked(false);
    } else {
      // Tablet/Desktop: Preserve username for convenience
      setLoginForm(prev => ({ ...prev, password: '' }));
    }
    
    console.log(`${deviceType} logout completed`);
    
    // Device-specific logout confirmation
    if (deviceType === 'desktop') {
      console.log('Desktop session ended - all data cleared');
    }
  };

  // CRITICAL FIX: Raw input updates WITHOUT processing to prevent focus loss
  const updateLoginForm = (field: keyof LoginForm, value: string) => {
    if (isLocked) return; // Prevent form updates when locked
    
    // IMPORTANT: Store the exact value the user types without ANY processing
    // No trimming, no slicing, no case conversion - just store the raw input
    // All validation happens only during form submission in handleLogin()
    setLoginForm(prev => ({ ...prev, [field]: value }));
    
    // Optional: Log for debugging (desktop only to reduce console noise)
    if (deviceType === 'desktop') {
      console.log(`Raw input for ${field}: "${value}"`);
    }
  };

  // Device-aware session validation for ongoing operations
  const validateSession = (): boolean => {
    const savedSession = localStorage.getItem('techequity-admin-session');
    if (!savedSession || !isAuthenticated) return false;
    
    try {
      const session = JSON.parse(savedSession);
      const now = new Date().getTime();
      
      const sessionDurations = {
        mobile: 300000,   // 5 minutes
        tablet: 600000,   // 10 minutes
        desktop: 1800000  // 30 minutes
      };
      
      const isValid = (now - session.timestamp) < sessionDurations[deviceType];
      
      if (!isValid) {
        handleLogout();
        console.log(`Session validation failed for ${deviceType}`);
      }
      
      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      handleLogout();
      return false;
    }
  };

  // Device-aware auto-logout warning
  const getSessionTimeRemaining = (): number => {
    const savedSession = localStorage.getItem('techequity-admin-session');
    if (!savedSession) return 0;
    
    try {
      const session = JSON.parse(savedSession);
      const now = new Date().getTime();
      
      const sessionDurations = {
        mobile: 300000,
        tablet: 600000,
        desktop: 1800000
      };
      
      const timeRemaining = sessionDurations[deviceType] - (now - session.timestamp);
      return Math.max(0, timeRemaining);
    } catch (error) {
      return 0;
    }
  };

  return {
    // Core state
    isAuthenticated,
    loginForm,
    
    // Core actions
    handleLogin,
    handleLogout,
    updateLoginForm,
    
    // Device-aware features
    deviceType,
    isTouchDevice,
    loginAttempts,
    isLocked,
    validateSession,
    getSessionTimeRemaining
  };
};