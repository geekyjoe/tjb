// api.js - Frontend API service with token expiration handling

import axios from 'axios';
import { API_URL } from './url';

// Create axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Function to clear auth data and redirect
const clearAuthAndRedirect = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');

  // Redirect to home page
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }

  // Dispatch custom event to notify components
  window.dispatchEvent(new CustomEvent('auth:expired'));
};

// Function to refresh access token
const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  try {
    const response = await axios.post(`${API_URL}/api/auth/refresh`, {
      refreshToken
    });

    if (response.data.success) {
      const { accessToken, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', newRefreshToken);
      return accessToken;
    }
    
    throw new Error('Failed to refresh token');
  } catch (error) {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
};

// Interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle token expiration and refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is due to token expiration
    if (error.response && error.response.status === 401) {
      const errorCode = error.response.data?.code;
      const errorMessage = error.response.data?.message?.toLowerCase() || '';
      
      const isTokenExpired = 
        errorCode === 'TOKEN_EXPIRED' ||
        errorMessage.includes('expired') ||
        errorMessage.includes('invalid token');

      if (isTokenExpired && !originalRequest._retry) {
        if (isRefreshing) {
          // If already refreshing, queue the request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          }).catch(err => {
            return Promise.reject(err);
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          processQueue(null, newToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          console.warn('Token refresh failed, clearing auth data and redirecting...');
          clearAuthAndRedirect();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // If not token expired or refresh failed, clear auth
      if (!isTokenExpired || originalRequest._retry) {
        console.warn('Authentication failed, clearing auth data and redirecting...');
        clearAuthAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

// Authentication API calls
const AuthService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', userData);
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email,
        password,
      });
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      return await refreshAccessToken();
    } catch (error) {
      throw error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem('accessToken');
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Get current access token
  getAccessToken: () => {
    return localStorage.getItem('accessToken');
  },

  // Get current refresh token
  getRefreshToken: () => {
    return localStorage.getItem('refreshToken');
  },

  // Google OAuth login/register
  googleAuth: async (credential) => {
    try {
      const response = await apiClient.post('/api/auth/google', {
        credential,
      });
      if (response.data.success) {
        const { accessToken, refreshToken, user } = response.data.data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Link Google account to existing user account
  linkGoogleAccount: async (credential) => {
    try {
      const response = await apiClient.post('/api/auth/link-google', {
        credential,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Unlink Google account from user account
  unlinkGoogleAccount: async () => {
    try {
      const response = await apiClient.post('/api/auth/unlink-google');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Method to manually clear auth data and redirect (for use in components)
  handleTokenExpiration: clearAuthAndRedirect,
};

// User API calls
const UserService = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/api/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/api/user/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await apiClient.put(`/api/user/${userId}`, {
        password: newPassword,
        currentPassword: currentPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete user account
  deleteUserAccount: async (userId) => {
    try {
      const response = await apiClient.delete(`/api/user/${userId}`);
      if (response.data.success) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId, imageFile) => {
    try {
      const formData = new FormData();
      formData.append('avatar', imageFile);

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/user/${userId}/avatar`,
        formData,
        config
      );

      if (response.data.success) {
        const user = AuthService.getCurrentUser();
        if (user && user.id === userId) {
          user.avatarUrl = response.data.data.avatarUrl;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      return response.data;
    } catch (error) {
      // Handle token expiration for direct axios calls
      if (error.response && error.response.status === 401) {
        clearAuthAndRedirect();
      }
      throw error.response ? error.response.data : error;
    }
  },

  // Get avatar URL
  getAvatarUrl: async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/user/${userId}/avatar`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete avatar
  deleteAvatar: async (userId) => {
    try {
      const response = await apiClient.delete(`/api/user/${userId}/avatar`);

      if (response.data.success) {
        const user = AuthService.getCurrentUser();
        if (user && user.id === userId) {
          user.avatarUrl = null;
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Admin API calls
const AdminService = {
  // Create a new user (admin only)
  createUser: async (userData) => {
    try {
      const response = await apiClient.post('/api/user', userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get('/api/users');
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.put(`/api/user/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user login history (admin only)
  updateLoginHistory: async (userId, loginHistory) => {
    try {
      const response = await apiClient.put(`/api/user/${userId}`, {
        loginHistory,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete specific login history entries (admin only)
  deleteLoginHistoryEntries: async (userId, entryIndexesToRemove) => {
    try {
      const userResponse = await apiClient.get(`/api/user/${userId}`);

      if (!userResponse.data.success) {
        throw new Error('Failed to retrieve user data');
      }

      const userData = userResponse.data.data;
      const currentLoginHistory = userData.loginHistory || [];

      const updatedLoginHistory = currentLoginHistory.filter(
        (_, index) => !entryIndexesToRemove.includes(index)
      );

      const response = await apiClient.put(`/api/user/${userId}`, {
        loginHistory: updatedLoginHistory,
      });

      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Clear all login history (admin only)
  clearLoginHistory: async (userId) => {
    try {
      const response = await apiClient.put(`/api/user/${userId}`, {
        loginHistory: [],
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Health check
const HealthService = {
  checkHealth: async () => {
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Export all services
export { AuthService, UserService, AdminService, HealthService };
