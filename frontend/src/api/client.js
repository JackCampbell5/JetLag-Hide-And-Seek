import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API
export const auth = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getMe: () => api.get('/auth/me'),
};

// Game API
export const game = {
  getState: () => api.get('/game/state'),
  drawCards: (questionType) => api.post('/game/draw', { question_type: questionType }),
  updateHand: (hand) => api.put('/game/hand', { hand }),
  updateHandSize: (handSize) => api.put('/game/hand-size', { hand_size: handSize }),
  playCard: (handPosition, discardPositions = null) =>
    api.post('/game/play', { hand_position: handPosition, discard_positions: discardPositions }),
  getDeckInfo: () => api.get('/game/deck'),
};

// Statistics API
export const stats = {
  getUserStats: () => api.get('/stats/user'),
  getHistory: (limit = 50, offset = 0) => api.get(`/stats/history?limit=${limit}&offset=${offset}`),
};

export default api;
