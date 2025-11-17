// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://film.isnap.world';

// API Endpoints
export const API_ENDPOINTS = {
  polishText: `${API_BASE_URL}/api/polish-text`,
  uploadImage: `${API_BASE_URL}/api/upload`,
  submitOrder: `${API_BASE_URL}/api/orders`,
  recordDownload: `${API_BASE_URL}/api/downloads`,
  getUserDesigns: (username: string) => `${API_BASE_URL}/api/users/${username}/designs`,
  getUserProfile: (username: string) => `${API_BASE_URL}/api/users/${username}`,
} as const;
