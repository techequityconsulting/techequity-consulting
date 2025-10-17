// src/app/admin/utils/apiAuth.ts
// Admin Panel API Authentication Helper - Multi-tenant with dynamic API key
// FIXED: Proper error handling for missing API keys + prevents premature data loading

/**
 * Get API key from session storage (set after login)
 */
const getStoredApiKey = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    const sessionData = localStorage.getItem('techequity-admin-session');
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      return parsed.apiKey || null;
    }
  } catch (error) {
    console.error('Error reading API key from session:', error);
  }
  
  return null;
};

/**
 * Store API key in session after successful login
 */
export const storeApiKey = (apiKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const sessionData = localStorage.getItem('techequity-admin-session');
    const parsed = sessionData ? JSON.parse(sessionData) : {};
    parsed.apiKey = apiKey;
    localStorage.setItem('techequity-admin-session', JSON.stringify(parsed));
    console.log('✅ API key stored in session');
  } catch (error) {
    console.error('Error storing API key:', error);
  }
};

/**
 * Clear API key from session (on logout)
 */
export const clearApiKey = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('techequity-admin-session');
  console.log('✅ API key cleared from session');
};

/**
 * Get authenticated headers for admin API requests
 * Returns null if no API key found (allows caller to handle gracefully)
 */
export const getAdminAuthHeaders = (): HeadersInit | null => {
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    return null;
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };
};

/**
 * Get authenticated headers with graceful fallback (doesn't throw error)
 * Use this when you want to handle missing API key gracefully
 */
export const getAdminAuthHeadersSafe = (): HeadersInit => {
  const apiKey = getStoredApiKey();
  
  if (!apiKey) {
    console.warn('⚠️ No API key found in session - request may fail');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': apiKey ? `Bearer ${apiKey}` : ''
  };
};

/**
 * Check if user is authenticated (has valid API key in session)
 */
export const isAuthenticated = (): boolean => {
  return getStoredApiKey() !== null;
};

/**
 * Make an authenticated admin API request
 * FIXED: Checks authentication before making request
 */
export const adminApiRequest = async <T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> => {
  // Check authentication first
  const headers = getAdminAuthHeaders();
  if (!headers) {
    throw new Error('NOT_AUTHENTICATED');
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    const data = await response.json();

    if (!response.ok) {
      // Better error messages based on status code
      if (response.status === 401) {
        throw new Error('Authentication failed - please log in again');
      } else if (response.status === 403) {
        throw new Error('Access denied - insufficient permissions');
      } else if (response.status === 404) {
        throw new Error('Resource not found');
      } else {
        throw new Error(data.error || `API request failed: ${response.status}`);
      }
    }

    return data;
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_AUTHENTICATED') {
      throw new Error('Please log in to continue');
    }
    throw error;
  }
};

/**
 * Build authenticated fetch options for admin requests
 * Returns null if not authenticated (allows caller to handle gracefully)
 */
export const getAuthenticatedFetchOptions = (options: RequestInit = {}): RequestInit | null => {
  const headers = getAdminAuthHeaders();
  
  if (!headers) {
    return null;
  }

  return {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  };
};