// API Configuration
const cleanUrl = (url) => url.replace(/\/+$/, ''); // Remove trailing slashes
const API_URL = cleanUrl(process.env.REACT_APP_API_URL || 'https://voting-app-backend-b7co.onrender.com');

export const API_ENDPOINTS = {
  register: `${API_URL}/api/register`,
  login: `${API_URL}/api/login`,
  logout: `${API_URL}/api/logout`,
  session: `${API_URL}/api/session`,
  topics: `${API_URL}/api/topics`,
  vote: `${API_URL}/api/vote`,
  votes: (topicId) => `${API_URL}/api/votes/${topicId}`
}; 