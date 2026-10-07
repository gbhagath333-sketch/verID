import axios from 'axios';

const PRIMARY_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const FALLBACK_BASE_URL = 'http://localhost:5001';

let activeBaseUrl = PRIMARY_BASE_URL;

const createClient = (baseURL) =>
  axios.create({
    baseURL,
    timeout: 15000,
  });

let api = createClient(activeBaseUrl);

/**
 * Health check endpoint with automatic fallback detection
 * GET /api/health
 */
export const checkHealth = async () => {
  try {
    const response = await api.get('/api/health');
    // Verify response is actually from our backend (not macOS AirTunes 403)
    if (response.data && response.data.success && response.data.message) {
      return response.data;
    }
  } catch (err) {
    // If primary failed or returned 403 AirTunes on macOS, attempt fallback port 5001
    if (activeBaseUrl !== FALLBACK_BASE_URL) {
      try {
        const fallbackClient = createClient(FALLBACK_BASE_URL);
        const fbResponse = await fallbackClient.get('/api/health');
        if (fbResponse.data && fbResponse.data.success) {
          activeBaseUrl = FALLBACK_BASE_URL;
          api = fallbackClient;
          return fbResponse.data;
        }
      } catch (fbErr) {
        // Fallback also failed
      }
    }
    throw err;
  }
};

/**
 * Register document endpoint
 * POST /api/register
 * Multipart form-data with recordId and file
 */
export const registerRecordApi = async (recordId, file) => {
  const formData = new FormData();
  formData.append('recordId', recordId);
  formData.append('file', file);

  const response = await api.post('/api/register', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Verify document endpoint
 * POST /api/verify
 * Multipart form-data with recordId and file
 */
export const verifyRecordApi = async (recordId, file) => {
  const formData = new FormData();
  formData.append('recordId', recordId);
  formData.append('file', file);

  const response = await api.post('/api/verify', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

/**
 * Get record details endpoint
 * GET /api/record/:recordId
 */
export const getRecordDetailsApi = async (recordId) => {
  const response = await api.get(`/api/record/${encodeURIComponent(recordId)}`);
  return response.data;
};

export default api;
