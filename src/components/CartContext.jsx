import React, { createContext, useState, useContext, useEffect } from 'react';

// Create a CartContext
const CartContext = createContext();

// Cart Provider Component
export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalItems, setTotalItems] = useState(0);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      
      // Update total items count
      const totalCount = parsedCart.reduce((total, item) => total + item.quantity, 0);
      setTotalItems(totalCount);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Update total items count
    const totalCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    setTotalItems(totalCount);
  }, [cartItems]);

  // Add to cart function
  const addToCart = (product) => {
    // Check if product already exists in cart
    const existingProductIndex = cartItems.findIndex(
      (item) => item.id === product.id
    );

    if (existingProductIndex > -1) {
      // If product exists, increase quantity
      const updatedCart = [...cartItems];
      updatedCart[existingProductIndex] = {
        ...updatedCart[existingProductIndex],
        quantity: updatedCart[existingProductIndex].quantity + 1
      };
      setCartItems(updatedCart);
    } else {
      // If product is new, add to cart with quantity 1
      setCartItems([...cartItems, { 
        ...product, 
        quantity: 1 
      }]);
    }
  };

  // Remove from cart function
  const removeFromCart = (productId) => {
    setCartItems(cartItems.filter((item) => item.id !== productId));
  };

  // Update quantity function
  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      const updatedCart = cartItems.map((item) => 
        item.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      );
      setCartItems(updatedCart);
    }
  };

  // Calculate total cart value
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    ).toFixed(2);
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider 
      value={{ 
        cartItems, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        calculateTotal,
        clearCart,
        totalItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};