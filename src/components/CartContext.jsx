import React, { createContext, useState, useContext, useEffect } from 'react';
import Cookies from 'js-cookie';

// Type definitions
const StoragePreference = {
  COOKIES: 'cookies',
  LOCAL_STORAGE: 'localStorage',
  BOTH: 'both'
};

const ErrorType = {
  INIT_ERROR: 'INIT_ERROR',
  SYNC_ERROR: 'SYNC_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CALCULATION_ERROR: 'CALCULATION_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CONTEXT_ERROR: 'CONTEXT_ERROR'
};

// Configuration
const STORAGE_KEYS = {
  CART: 'cart',
  PREFERENCES: 'cartPreferences'
};

const COOKIE_OPTIONS = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict'
};

// Custom error class
class CartError extends Error {
  constructor(message, type) {
    super(message);
    this.name = 'CartError';
    this.type = type;
  }
}

// Context definitions with initial values
const CartContext = createContext({
  cartItems: [],
  totalItems: 0,
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  calculateTotal: () => '0.00',
  clearCart: () => {},
  isInCart: () => false,
  getItemQuantity: () => 0,
  isLoading: false
});

const CartMetaContext = createContext({
  lastUpdate: null,
  errors: [],
  clearErrors: () => {},
  storagePreference: StoragePreference.BOTH
});

export const CartProvider = ({ 
  children, 
  storagePreference = StoragePreference.BOTH,
  onError = (error) => console.error(error)
}) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [errors, setErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const safelyParseJSON = (json) => {
    try {
      return json ? JSON.parse(json) : null;
    } catch {
      return null;
    }
  };

  const validateProduct = (product) => {
    return product && 
           typeof product === 'object' && 
           'id' in product && 
           'price' in product &&
           typeof product.price === 'number' &&
           product.price >= 0;
  };

  const syncStorage = async (items) => {
    try {
      const cartString = JSON.stringify(items);

      if (storagePreference === StoragePreference.COOKIES || 
          storagePreference === StoragePreference.BOTH) {
        Cookies.set(STORAGE_KEYS.CART, cartString, COOKIE_OPTIONS);
      }
      
      if (storagePreference === StoragePreference.LOCAL_STORAGE || 
          storagePreference === StoragePreference.BOTH) {
        localStorage.setItem(STORAGE_KEYS.CART, cartString);
      }

      updateTotalItems(items);
      setLastUpdate(new Date().toISOString());
    } catch (error) {
      handleError(new CartError('Failed to sync cart storage', ErrorType.SYNC_ERROR));
    }
  };

  useEffect(() => {
    const initializeCart = async () => {
      setIsLoading(true);
      try {
        let savedCart = null;
        
        if (storagePreference === StoragePreference.COOKIES || 
            storagePreference === StoragePreference.BOTH) {
          savedCart = safelyParseJSON(Cookies.get(STORAGE_KEYS.CART));
        }
        
        if (!savedCart && 
            (storagePreference === StoragePreference.LOCAL_STORAGE || 
             storagePreference === StoragePreference.BOTH)) {
          savedCart = safelyParseJSON(localStorage.getItem(STORAGE_KEYS.CART));
        }

        if (savedCart && Array.isArray(savedCart)) {
          setCartItems(savedCart);
          updateTotalItems(savedCart);
        }
      } catch (error) {
        handleError(new CartError('Failed to initialize cart', ErrorType.INIT_ERROR));
      } finally {
        setIsLoading(false);
      }
    };

    initializeCart();
  }, [storagePreference]);

  useEffect(() => {
    if (cartItems.length > 0) {
      syncStorage(cartItems);
    }
  }, [cartItems, storagePreference]);

  const updateTotalItems = (items) => {
    const total = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    setTotalItems(total);
  };

  const handleError = (error) => {
    setErrors(prev => [...prev.slice(-4), error]); // Keep last 5 errors
    onError(error);
  };

  const addToCart = async (product) => {
    setIsLoading(true);
    try {
      if (!validateProduct(product)) {
        throw new CartError('Invalid product data', ErrorType.VALIDATION_ERROR);
      }

      const newItems = [...cartItems];
      const existingProductIndex = newItems.findIndex(item => item.id === product.id);
      
      if (existingProductIndex > -1) {
        newItems[existingProductIndex] = {
          ...newItems[existingProductIndex],
          quantity: (Number(newItems[existingProductIndex].quantity) || 0) + 1,
          lastUpdated: new Date().toISOString()
        };
      } else {
        newItems.push({
          ...product,
          quantity: 1,
          addedAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString()
        });
      }

      await syncStorage(newItems);
      setCartItems(newItems);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId) => {
    setIsLoading(true);
    try {
      if (!productId) {
        throw new CartError('Invalid product ID', ErrorType.VALIDATION_ERROR);
      }

      const newItems = cartItems.filter(item => item.id !== productId);
      await syncStorage(newItems);
      setCartItems(newItems);

      // Explicitly update cookies when removing items
      if (storagePreference === StoragePreference.COOKIES || 
          storagePreference === StoragePreference.BOTH) {
        if (newItems.length === 0) {
          Cookies.remove(STORAGE_KEYS.CART);
        } else {
          Cookies.set(STORAGE_KEYS.CART, JSON.stringify(newItems), COOKIE_OPTIONS);
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    setIsLoading(true);
    try {
      if (!productId || typeof newQuantity !== 'number' || newQuantity < 0) {
        throw new CartError('Invalid quantity update parameters', ErrorType.VALIDATION_ERROR);
      }

      if (newQuantity === 0) {
        await removeFromCart(productId);
        return;
      }

      const newItems = cartItems.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: newQuantity,
              lastUpdated: new Date().toISOString()
            }
          : item
      );

      await syncStorage(newItems);
      setCartItems(newItems);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateTotal = () => {
    try {
      return cartItems.reduce((total, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return total + (price * quantity);
      }, 0).toFixed(2);
    } catch (error) {
      handleError(new CartError('Failed to calculate total', ErrorType.CALCULATION_ERROR));
      return '0.00';
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      setCartItems([]);
      if (storagePreference === StoragePreference.COOKIES || 
          storagePreference === StoragePreference.BOTH) {
        Cookies.remove(STORAGE_KEYS.CART);
      }
      if (storagePreference === StoragePreference.LOCAL_STORAGE || 
          storagePreference === StoragePreference.BOTH) {
        localStorage.removeItem(STORAGE_KEYS.CART);
      }
      await syncStorage([]);
    } catch (error) {
      handleError(new CartError('Failed to clear cart', ErrorType.CLEAR_ERROR));
    } finally {
      setIsLoading(false);
    }
  };

  const isInCart = (productId) => {
    return productId ? cartItems.some(item => item.id === productId) : false;
  };
  
  const getItemQuantity = (productId) => {
    if (!productId) return 0;
    const item = cartItems.find(item => item.id === productId);
    return item ? Number(item.quantity) || 0 : 0;
  };

  const cartContextValue = {
    cartItems,
    totalItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    isInCart,
    getItemQuantity,
    isLoading
  };

  const cartMetaContextValue = {
    lastUpdate,
    errors,
    clearErrors: () => setErrors([]),
    storagePreference
  };

  return (
    <CartMetaContext.Provider value={cartMetaContextValue}>
      <CartContext.Provider value={cartContextValue}>
        {children}
      </CartContext.Provider>
    </CartMetaContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new CartError(
      'useCart must be used within a CartProvider',
      ErrorType.CONTEXT_ERROR
    );
  }
  return context;
};

export const useCartMeta = () => {
  const context = useContext(CartMetaContext);
  if (!context) {
    throw new CartError(
      'useCartMeta must be used within a CartProvider',
      ErrorType.CONTEXT_ERROR
    );
  }
  return context;
};

export { StoragePreference, ErrorType };