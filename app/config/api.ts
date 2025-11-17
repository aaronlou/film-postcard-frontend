// API Configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://film.isnap.world';

// API Endpoints
export const API_ENDPOINTS = {
  polishText: `${API_BASE_URL}/api/polish-text`,
  // Add more endpoints here as needed
  // submitOrder: `${API_BASE_URL}/api/orders`,
  // uploadImage: `${API_BASE_URL}/api/upload`,
} as const;
