// src/services/database-service.js
import { ref, set, get, push, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase';

// Product Management
const addProduct = async (productData) => {
  try {
    const newProductRef = push(ref(database, 'products'));
    const product = {
      id: newProductRef.key,
      title: productData.title,
      brand: productData.brand,
      category: productData.category,
      price: productData.price,
      description: productData.description,
      discounts: productData.discounts || [],
      stock: productData.stock,
      availability: productData.availability,
      rating: productData.rating,
      specifications: {
        weight: productData.specifications.weight,
        dimensions: productData.specifications.dimensions,
      },
      images: productData.images || [],
      variants: productData.variants || [],
      seller: productData.seller,
      createdAt: new Date().toISOString()
    };

    await set(newProductRef, product);
    return product.id;
  } catch (error) {
    throw new Error(`Error adding product: ${error.message}`);
  }
};

// Get product by ID
const getProduct = async (productId) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      throw new Error('Product not found');
    }
  } catch (error) {
    throw new Error(`Error getting product: ${error.message}`);
  }
};

// Get all products
const getAllProducts = async () => {
  try {
    const productsRef = ref(database, 'products');
    const snapshot = await get(productsRef);
    
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    throw new Error(`Error getting products: ${error.message}`);
  }
};

// Update product
const updateProduct = async (productId, updateData) => {
  try {
    const productRef = ref(database, `products/${productId}`);
    const snapshot = await get(productRef);
    
    if (!snapshot.exists()) {
      throw new Error('Product not found');
    }

    const updatedProduct = {
      ...snapshot.val(),
      ...updateData,
      updatedAt: new Date().toISOString()
    };

    await set(productRef, updatedProduct);
    return updatedProduct;
  } catch (error) {
    throw new Error(`Error updating product: ${error.message}`);
  }
};

// Get products by category
const getProductsByCategory = async (category) => {
  try {
    const productsRef = ref(database, 'products');
    const categoryQuery = query(productsRef, orderByChild('category'), equalTo(category));
    const snapshot = await get(categoryQuery);
    
    if (snapshot.exists()) {
      return Object.values(snapshot.val());
    }
    return [];
  } catch (error) {
    throw new Error(`Error getting products by category: ${error.message}`);
  }
};

export {
  addProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  getProductsByCategory
};