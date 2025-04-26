import axios from "axios";
import { API_URL } from "./index";

// Create axios instance with default configs
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
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

// Response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.message || "An unknown error occurred";
    const errorData = {
      success: false,
      message: errorMessage,
      statusCode: error.response?.status || 500,
      error: error.response?.data || error.message,
    };
    return Promise.reject(errorData);
  }
);

// Helper to check if current user is admin
const isAdmin = () => {
  const user = localStorage.getItem("user");
  if (!user) return false;

  try {
    const parsedUser = JSON.parse(user);
    return parsedUser.role === "admin";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Helper to handle authorization errors consistently
const checkAdminAuthorization = () => {
  if (!isAdmin()) {
    throw {
      success: false,
      message: "Unauthorized: Admin access required",
      statusCode: 403,
    };
  }
};

// Products API endpoints
const ProductsAPI = {
  // Get all products with optional filters
  getAllProducts: async (filters = {}) => {
    try {
      const { category, minPrice, maxPrice, isActive } = filters;

      // Build query parameters
      const params = new URLSearchParams();
      if (category) params.append("category", category);
      if (minPrice !== undefined) params.append("minPrice", minPrice);
      if (maxPrice !== undefined) params.append("maxPrice", maxPrice);
      if (isActive !== undefined) params.append("isActive", isActive.toString());

      const response = await apiClient.get(`/api/products?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching products:", error);
      throw error;
    }
  },

  // Get a single product by ID
  getProductById: async (id) => {
    try {
      if (!id) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.get(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching product ${id}:`, error);
      throw error;
    }
  },

  // Create a new product (admin only)
  createProduct: async (productData) => {
    try {
      checkAdminAuthorization();
      
      // Validate required fields
      const { title, price, category, inventory } = productData;
      if (!title || price === undefined || category === undefined || inventory === undefined) {
        throw {
          success: false,
          message: "Title, price, category, and inventory are required fields",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.post("/api/products", productData);
      return response.data;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  },

  // Update a product (admin only)
  updateProduct: async (id, updateData) => {
    try {
      checkAdminAuthorization();
      
      if (!id) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.put(`/api/products/${id}`, updateData);
      return response.data;
    } catch (error) {
      console.error(`Error updating product ${id}:`, error);
      throw error;
    }
  },

  // Delete a product (admin only)
  deleteProduct: async (id) => {
    try {
      checkAdminAuthorization();
      
      if (!id) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.delete(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting product ${id}:`, error);
      throw error;
    }
  },

  // Upload multiple product images (admin only)
  uploadProductImages: async (id, imageFiles, setAsThumbnail = null) => {
    try {
      checkAdminAuthorization();
      
      if (!id) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      if (!imageFiles || imageFiles.length === 0) {
        throw {
          success: false,
          message: "No images provided for upload",
          statusCode: 400,
        };
      }
      
      // Create form data for file upload
      const formData = new FormData();

      // Append multiple images to formData
      for (let i = 0; i < imageFiles.length; i++) {
        formData.append("images", imageFiles[i]);
      }

      // Special config for multipart/form-data
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      // Add query parameter if setting a specific image as thumbnail
      let url = `${API_URL}/api/products/${id}/images`;
      if (setAsThumbnail !== null) {
        url += `?setAsThumbnail=${setAsThumbnail}`;
      }

      const response = await axios.post(url, formData, config);
      return response.data;
    } catch (error) {
      console.error(`Error uploading images for product ${id}:`, error);
      throw error;
    }
  },

  // Upload a single product image (legacy method - kept for backward compatibility)
  uploadProductImage: async (productId, imageFile) => {
    try {
      checkAdminAuthorization();
      
      if (!productId) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      if (!imageFile) {
        throw {
          success: false,
          message: "No image provided for upload",
          statusCode: 400,
        };
      }

      // Create form data for file upload
      const formData = new FormData();
      formData.append("image", imageFile);

      // Special config for multipart/form-data
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      };

      const response = await axios.post(
        `${API_URL}/api/products/${productId}/image`, 
        formData, 
        config
      );
      return response.data;
    } catch (error) {
      console.error(`Error uploading image for product ${productId}:`, error);
      throw error;
    }
  },

  // Delete a specific product image (admin only)
  deleteProductImage: async (productId, imageIndex) => {
    try {
      checkAdminAuthorization();
      
      if (!productId) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      if (imageIndex === undefined || imageIndex < 0) {
        throw {
          success: false,
          message: "Valid image index is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.delete(
        `/api/products/${productId}/images/${imageIndex}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error deleting image ${imageIndex} for product ${productId}:`, error);
      throw error;
    }
  },

  // Set a specific image as thumbnail (admin only)
  setProductThumbnail: async (productId, imageIndex) => {
    try {
      checkAdminAuthorization();
      
      if (!productId) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      if (imageIndex === undefined || imageIndex < 0) {
        throw {
          success: false,
          message: "Valid image index is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.put(
        `/api/products/${productId}/thumbnail/${imageIndex}`
      );
      return response.data;
    } catch (error) {
      console.error(`Error setting thumbnail for product ${productId}:`, error);
      throw error;
    }
  },

  // Get admin-only product listing (including inactive products)
  getAdminProductList: async () => {
    try {
      checkAdminAuthorization();
      
      // Get all products including inactive ones
      const response = await apiClient.get("/api/products?isActive=all");
      return response.data;
    } catch (error) {
      console.error("Error fetching admin product list:", error);
      throw error;
    }
  },

  // Toggle product active status (admin only)
  toggleProductStatus: async (id, isActive) => {
    try {
      checkAdminAuthorization();
      
      if (!id) {
        throw {
          success: false,
          message: "Product ID is required",
          statusCode: 400,
        };
      }
      
      if (isActive === undefined) {
        throw {
          success: false,
          message: "isActive status is required",
          statusCode: 400,
        };
      }
      
      const response = await apiClient.put(`/api/products/${id}`, { isActive });
      return response.data;
    } catch (error) {
      console.error(`Error toggling status for product ${id}:`, error);
      throw error;
    }
  },
};

export default ProductsAPI;