// app/admin/utils/apiConfig.ts
// Helper to get API base URL for admin panel

export const getAdminApiBaseUrl = (): string => {
  if (typeof window === 'undefined') return '';
  
  // Use same logic as widget - localhost in dev, production in prod
  return window.location.hostname === 'localhost'
    ? 'http://localhost:3001'
    : 'https://www.autoassistpro.org';
};