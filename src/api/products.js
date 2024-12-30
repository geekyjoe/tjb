import { API_BASE_URL } from './config';

export const productsApi = {
  async fetchAll() {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch products');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const response = await fetch(`/api/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async create(productData) {
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to create product');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async update(id, productData) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      });
      if (!response.ok) throw new Error('Failed to update product');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete product');
      return response.status === 204 ? true : response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async uploadImages(productId, files) {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response = await fetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to upload images');
      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  async deleteImage(productId, filename) {
    try {
      const response = await fetch(`/api/products/${productId}/images/${filename}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete image');
      return response.status === 204 ? true : response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};