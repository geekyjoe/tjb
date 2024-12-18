import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCart } from './CartContext.jsx';

const ProductCard = ({ product }) => {
  const { 
    addToCart, 
    removeFromCart, 
    cartItems, 
    updateQuantity 
  } = useCart();

  // Find the current item in the cart
  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product);
  };

  const handleIncreaseQuantity = (e) => {
    e.stopPropagation();
    updateQuantity(product.id, (cartItem?.quantity || 0) + 1);
  };

  const handleDecreaseQuantity = (e) => {
    e.stopPropagation();
    if (cartItem?.quantity > 1) {
      updateQuantity(product.id, cartItem.quantity - 1);
    } else {
      removeFromCart(product.id);
    }
  };

  return (
    <Card className='bg-gray-300 dark:bg-gray-700 w-full h-full flex flex-col'>
      <CardHeader className='p-0 flex-grow-0'>
        <img 
          src={product.thumbnail}
          alt={product.title} 
          className='w-full h-48 object-cover'
        />
      </CardHeader>
      <CardContent className='p-4 flex-grow flex flex-col justify-between'>
        <div>
          <CardTitle className='text-gray-500 dark:text-gray-200 text-lg mb-2'>
            {product.title}
          </CardTitle>
          <CardDescription className="dark:text-gray-300 text-base mb-2">
            {product.description}
          </CardDescription>
        </div>
        <div className='flex justify-between items-center'>
          <span className='text-lg font-bold text-gray-700 dark:text-gray-200'>
            ${product.price.toFixed(2)}
          </span>
          <span className='text-sm text-gray-500 dark:text-gray-400'>
            Rating: {product.rating}/5
          </span>
        </div>
      </CardContent>
      <CardFooter className='mt-auto'>
        {!isInCart ? (
          <Button 
            onClick={handleAddToCart}
            className='w-full bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-600'
          >
            Add to Cart
          </Button>
        ) : (
          <div className='flex w-full items-center justify-between'>
            <Button 
              variant="outline"
              onClick={handleDecreaseQuantity}
              className='px-3'
            >
              -
            </Button>
            <span className='text-lg font-semibold mx-4'>
              {cartItem.quantity}
            </span>
            <Button 
              variant="outline"
              onClick={handleIncreaseQuantity}
              className='px-3'
            >
              +
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProductCard;