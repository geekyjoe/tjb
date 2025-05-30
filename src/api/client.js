// api.js - Frontend API service for communicating with the backend

import axios from "axios";
import { API_URL } from "./url";

// Create axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor to include auth token in requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication API calls
const AuthService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/api/auth/register", userData);
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/api/auth/login", {
        email,
        password,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Logout user
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
  // Google OAuth login/register
  googleAuth: async (credential) => {
    try {
      const response = await apiClient.post("/api/auth/google", {
        credential,
      });
      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Link Google account to existing user account
  linkGoogleAccount: async (credential) => {
    try {
      const response = await apiClient.post("/api/auth/link-google", {
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
      const response = await apiClient.post("/api/auth/unlink-google");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
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
        // Some APIs might require current password verification
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
        // Clear local storage on successful account deletion
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Upload avatar image
  uploadAvatar: async (userId, imageFile) => {
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append("avatar", imageFile);

      // Special config for multipart/form-data
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/user/${userId}/avatar`,
        formData,
        config
      );

      // Update user in localStorage with new avatar URL
      if (response.data.success) {
        const user = AuthService.getCurrentUser();
        if (user && user.id === userId) {
          user.avatarUrl = response.data.data.avatarUrl;
          localStorage.setItem("user", JSON.stringify(user));
        }
      }

      return response.data;
    } catch (error) {
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

      // Update user in localStorage - remove avatar URL
      if (response.data.success) {
        const user = AuthService.getCurrentUser();
        if (user && user.id === userId) {
          user.avatarUrl = null;
          localStorage.setItem("user", JSON.stringify(user));
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
      const response = await apiClient.post("/api/user", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/api/users");
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
      // First get the current user profile to access the login history
      const userResponse = await apiClient.get(`/api/user/${userId}`);

      if (!userResponse.data.success) {
        throw new Error("Failed to retrieve user data");
      }

      const userData = userResponse.data.data;
      const currentLoginHistory = userData.loginHistory || [];

      // Filter out the entries to be removed
      const updatedLoginHistory = currentLoginHistory.filter(
        (_, index) => !entryIndexesToRemove.includes(index)
      );

      // Update the user with the filtered login history
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
      const response = await axios.get(`${API_URL.replace("/api", "")}/health`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Export all services
export { AuthService, UserService, AdminService, HealthService };
