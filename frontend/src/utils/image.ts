/**
 * Helper utility to construct full URLs for static assets served by the backend.
 * Derives the host from VITE_API_URL and prepends it to relative paths.
 */
export const getImageUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  
  // If it is already a fully qualified URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Extract base server URL from the API endpoint configuration
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  const baseUrl = API_URL.replace('/api/v1', '');
  
  // Prepend base URL, avoiding double slashes
  return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
};
