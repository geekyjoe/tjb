import axios from "axios";

const BASE_URL = "https://dummyjson.com"; // DummyJSON base URL

// Products API
export const fetchProducts = async (limit = 12, skip = 0, category = null) => {
  try {
    // If a category is provided, use category-specific endpoint
    if (category) {
      const response = await axios.get(`${BASE_URL}/products/category/${category}`, { 
        params: { limit, skip } 
      });
      return response.data.products;
    }
    
    // Otherwise, use the default products endpoint
    const response = await axios.get(`${BASE_URL}/products`, { 
      params: { limit, skip } 
    });
    return response.data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};

export const fetchProductById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/${id}`);
    // Add the additional fields that aren't provided by the API
    return {
      ...response.data,
      materials: ["Aluminum", "Glass", "Ceramic Shield"],
      specifications: {
        dimensions: "146.7 x 71.5 x 7.4 mm",
        weight: "174g",
        display: "6.1-inch Super Retina XDR",
        processor: "A15 Bionic chip"
      }
    };
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
};

export const fetchCategories = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/products/categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const fetchProductsByCategory = async (category) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/category/${category}`);
    return response.data.products;
  } catch (error) {
    console.error(`Error fetching products in category ${category}:`, error);
    return [];
  }
};

export const searchProducts = async (query) => {
  try {
    const response = await axios.get(`${BASE_URL}/products/search`, { 
      params: { q: query } 
    });
    return response.data.products;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
};

export const addProduct = async (productData) => {
  try {
    const response = await axios.post(`${BASE_URL}/products/add`, productData);
    return response.data;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(`${BASE_URL}/products/${id}`, productData);
    return response.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
};

// Users API
export const fetchUsers = async (limit = 10, skip = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/users`, { 
      params: { limit, skip } 
    });
    return response.data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

export const fetchUserById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    return null;
  }
};

export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${BASE_URL}/users/add`, userData);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(`${BASE_URL}/users/${id}`, userData);
    return response.data;
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// Carts API
export const fetchCarts = async (limit = 10, skip = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/carts`, { 
      params: { limit, skip } 
    });
    return response.data.carts;
  } catch (error) {
    console.error('Error fetching carts:', error);
    return [];
  }
};

export const fetchCartById = async (id) => {
  try {
    const response = await axios.get(`${BASE_URL}/carts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching cart ${id}:`, error);
    return null;
  }
};

export const addCart = async (cartData) => {
  try {
    const response = await axios.post(`${BASE_URL}/carts/add`, cartData);
    return response.data;
  } catch (error) {
    console.error('Error adding cart:', error);
    throw error;
  }
};

export const updateCart = async (id, cartData) => {
  try {
    const response = await axios.put(`${BASE_URL}/carts/${id}`, cartData);
    return response.data;
  } catch (error) {
    console.error(`Error updating cart ${id}:`, error);
    throw error;
  }
};

export const deleteCart = async (id) => {
  try {
    const response = await axios.delete(`${BASE_URL}/carts/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting cart ${id}:`, error);
    throw error;
  }
};