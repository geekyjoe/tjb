// tapi.js - Merged API services for the application

import axios from 'axios';

const API_URL = "http://localhost:8069/api";

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

// Helper function to check if current user is admin
const isAdmin = () => {
  const user = localStorage.getItem('user');
  if (!user) return false;
  
  try {
    const userData = JSON.parse(user);
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

// Error for unauthorized admin actions
class AdminAuthorizationError extends Error {
  constructor(message = 'Admin privileges required for this action') {
    super(message);
    this.name = 'AdminAuthorizationError';
  }
}

// Authentication API calls
const AuthService = {
  // Register a new user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/register", userData);
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
      const response = await apiClient.post("/login", {
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
};

// User API calls
const UserService = {
  // Get user profile
  getUserProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user profile
  updateUserProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/user/${userId}`, userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Change password
  changePassword: async (userId, currentPassword, newPassword) => {
    try {
      const response = await apiClient.put(`/user/${userId}`, {
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
      const response = await apiClient.delete(`/user/${userId}`);
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
        `${API_URL}/user/${userId}/avatar`,
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
      const response = await axios.get(`${API_URL}/user/${userId}/avatar`);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete avatar
  deleteAvatar: async (userId) => {
    try {
      const response = await apiClient.delete(`/user/${userId}/avatar`);

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
  // Get all users (admin only)
  getAllUsers: async () => {
    try {
      const response = await apiClient.get("/users");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user role (admin only)
  updateUserRole: async (userId, role) => {
    try {
      const response = await apiClient.put(`/user/${userId}`, { role });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Update user login history (admin only)
  updateLoginHistory: async (userId, loginHistory) => {
    try {
      const response = await apiClient.put(`/user/${userId}`, { loginHistory });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },

  // Delete specific login history entries (admin only)
  deleteLoginHistoryEntries: async (userId, entryIndexesToRemove) => {
    try {
      // First get the current user profile to access the login history
      const userResponse = await apiClient.get(`/user/${userId}`);

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
      const response = await apiClient.put(`/user/${userId}`, {
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
      const response = await apiClient.put(`/user/${userId}`, {
        loginHistory: [],
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error;
    }
  },
};

// Products API
const ProductsService = {
  // Get all products with optional filters
  getProducts: async (filters = {}) => {
    const { category, minPrice, maxPrice, isActive } = filters;
    const params = {};
    
    if (category) params.category = category;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;
    if (isActive !== undefined) params.isActive = isActive;
    
    try {
      const response = await apiClient.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  },
  
  // Get a single product by ID
  getProduct: async (id) => {
    try {
      const response = await apiClient.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new product (admin only)
  createProduct: async (productData) => {
    // Check admin role before making request
    if (!isAdmin()) {
      throw new AdminAuthorizationError();
    }

    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },
  
  // Update a product (admin only)
  updateProduct: async (id, updateData) => {
    // Check admin role before making request
    if (!isAdmin()) {
      throw new AdminAuthorizationError();
    }

    try {
      const response = await apiClient.put(`/products/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a product (admin only)
  deleteProduct: async (id) => {
    // Check admin role before making request
    if (!isAdmin()) {
      throw new AdminAuthorizationError();
    }

    try {
      const response = await apiClient.delete(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },
  
  // Upload product image (admin only)
  uploadProductImage: async (id, imageFile) => {
    // Check admin role before making request
    if (!isAdmin()) {
      throw new AdminAuthorizationError();
    }

    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('image', imageFile);
      
      const response = await apiClient.post(`/products/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error uploading image for product ${id}:`, error);
      throw error;
    }
  }
};

// Orders API
const OrdersService = {
  // Create a new order
  createOrder: async (orderData) => {
    try {
      const response = await apiClient.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },
  
  // Get all orders for the current user (or all orders for admin)
  getOrders: async (filters = {}) => {
    try {
      const { status, userId } = filters;
      const params = {};
      
      if (status) params.status = status;
      
      // If userId is specified and user is not admin, throw error
      if (userId && !isAdmin()) {
        throw new AdminAuthorizationError('Admin privileges required to view orders from other users');
      }
      
      // Only include userId in params if it was provided
      if (userId) params.userId = userId;
      
      const response = await apiClient.get('/orders', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },
  
  // Get a single order by ID
  getOrder: async (id) => {
    try {
      const response = await apiClient.get(`/orders/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching order ${id}:`, error);
      throw error;
    }
  },
  
  // Update order status (admin only)
  updateOrderStatus: async (id, status, note) => {
    // Check admin role before making request
    if (!isAdmin()) {
      throw new AdminAuthorizationError();
    }

    try {
      const response = await apiClient.patch(`/orders/${id}/status`, { status, note });
      return response.data;
    } catch (error) {
      console.error(`Error updating status for order ${id}:`, error);
      throw error;
    }
  },
  
  // Cancel an order
  cancelOrder: async (id, reason) => {
    try {
      const response = await apiClient.post(`/orders/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      console.error(`Error cancelling order ${id}:`, error);
      throw error;
    }
  }
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

// Export all services as a single tapi object
export const client = apiClient;
export const auth = AuthService;
export const user = UserService;
export const admin = AdminService;
export const productsApi = ProductsService;
export const orders = OrdersService;
export const health = HealthService;

// Utility functions
