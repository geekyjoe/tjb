import axios from 'axios';
import { API_URL } from './url';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Product API functions
export const productAPI = {
  // CREATE - Add new product with images
  createProduct: async (productData, images = []) => {
    try {
      const formData = new FormData();
      
      // Append product data
      Object.keys(productData).forEach(key => {
        if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (typeof productData[key] === 'object') {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      // Append images
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await api.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // READ - Get all products with filtering and pagination
  getAllProducts: async (params = {}) => {
    try {
      const response = await api.get('/api/products', { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // READ - Get single product by ID
  getProductById: async (productId) => {
    try {
      const response = await api.get(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // UPDATE - Update product by ID with optional new images
  updateProduct: async (productId, productData, images = [], replaceAllImages = false) => {
    try {
      const formData = new FormData();
      
      // Append product data
      Object.keys(productData).forEach(key => {
        if (Array.isArray(productData[key])) {
          formData.append(key, JSON.stringify(productData[key]));
        } else if (typeof productData[key] === 'object') {
          formData.append(key, JSON.stringify(productData[key]));
        } else {
          formData.append(key, productData[key]);
        }
      });
      
      // Append images
      images.forEach(image => {
        formData.append('images', image);
      });
      
      // Add replace flag
      formData.append('replaceAllImages', replaceAllImages.toString());
      
      const response = await api.put(`/api/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // PATCH - Partial update
  patchProduct: async (productId, updateData, images = []) => {
    try {
      const formData = new FormData();
      
      // Append update data
      Object.keys(updateData).forEach(key => {
        if (Array.isArray(updateData[key])) {
          formData.append(key, JSON.stringify(updateData[key]));
        } else if (typeof updateData[key] === 'object') {
          formData.append(key, JSON.stringify(updateData[key]));
        } else {
          formData.append(key, updateData[key]);
        }
      });
      
      // Append images if any
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await api.patch(`/api/products/${productId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // DELETE - Delete product by ID
  deleteProduct: async (productId) => {
    try {
      const response = await api.delete(`/api/products/${productId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Bulk operations
  bulkOperations: async (action, productIds, updateData = {}) => {
    try {
      const response = await api.post('/api/products/bulk', {
        action,
        productIds,
        updateData,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get product types and their counts
  getProductTypes: async () => {
    try {
      const response = await api.get('/api/products/analytics/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete specific product image
  deleteProductImage: async (productId, imageUrl) => {
    try {
      const encodedImageUrl = encodeURIComponent(imageUrl);
      const response = await api.delete(`/api/products/${productId}/images/${encodedImageUrl}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Add images to existing product
  addProductImages: async (productId, images) => {
    try {
      const formData = new FormData();
      
      images.forEach(image => {
        formData.append('images', image);
      });
      
      const response = await api.post(`/api/products/${productId}/images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search products
  searchProducts: async (query, params = {}) => {
    try {
      const response = await api.get(`/api/products/search/${encodeURIComponent(query)}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get products by category
  getProductsByCategory: async (category, params = {}) => {
    try {
      const response = await api.get(`/api/products/category/${encodeURIComponent(category)}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get low stock products
  getLowStockProducts: async () => {
    try {
      const response = await api.get('/api/products/inventory/low-stock');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default productAPI;