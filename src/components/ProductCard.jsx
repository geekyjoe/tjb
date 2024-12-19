import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCart } from './CartContext.jsx';
import { toast } from "sonner";
import { Star } from "lucide-react";

const ProductCard = ({ product, viewMode = 'grid', className = '' }) => {
  const { 
    addToCart, 
    removeFromCart, 
    cartItems, 
    updateQuantity 
  } = useCart();

  const cartItem = cartItems.find(item => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`, {
      description: `Price: $${product.price.toFixed(2)}`,
      position: 'bottom-right',
    });
  };

  const handleIncreaseQuantity = (e) => {
    e.stopPropagation();
    const newQuantity = (cartItem?.quantity || 0) + 1;
    updateQuantity(product.id, newQuantity);
    toast.info(`${product.title} quantity updated`, {
      description: `New quantity: ${newQuantity}`,
      position: 'bottom-right',
    });
  };

  const handleDecreaseQuantity = (e) => {
    e.stopPropagation();
    if (cartItem?.quantity > 1) {
      const newQuantity = cartItem.quantity - 1;
      updateQuantity(product.id, newQuantity);
      toast.info(`${product.title} quantity updated`, {
        description: `New quantity: ${newQuantity}`,
        position: 'bottom-right',
      });
    } else {
      removeFromCart(product.id);
      toast.warning(`${product.title} removed from cart`, {
        position: 'bottom-right',
      });
    }
  };

  const QuantityControls = () => (
    <div className='flex items-center gap-2'>
      <Button 
        variant="outline"
        onClick={handleDecreaseQuantity}
        size="sm"
        className='hover:bg-stone-200 dark:hover:bg-stone-700'
      >
        -
      </Button>
      <span className='text-base font-medium mx-2'>
        {cartItem.quantity}
      </span>
      <Button 
        variant="outline"
        onClick={handleIncreaseQuantity}
        size="sm"
        className='hover:bg-stone-200 dark:hover:bg-stone-700'
      >
        +
      </Button>
    </div>
  );

  if (viewMode === 'list') {
    return (
      <div className="flex gap-4 bg-white dark:bg-neutral-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <div className="w-48 h-48 flex-shrink-0">
          <img 
            src={product.thumbnail}
            alt={product.title} 
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
              {product.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
              {product.description}
            </p>
            <div className="flex items-center mt-2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
                {product.rating}
              </span>
            </div>
          </div>
          <div className="mt-auto flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </span>
            {!isInCart ? (
              <Button 
                onClick={handleAddToCart}
                className="bg-stone-800 hover:bg-stone-700 text-white"
              >
                Add to Cart
              </Button>
            ) : (
              <QuantityControls />
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`bg-white dark:bg-neutral-700 hover:shadow-md transition-shadow ${className}`}>
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <img 
            src={product.thumbnail}
            alt={product.title} 
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="mb-4">
          <CardTitle className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {product.title}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </CardDescription>
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className="text-lg font-bold text-gray-800 dark:text-gray-100">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="ml-1 text-sm text-gray-600 dark:text-gray-300">
              {product.rating}
            </span>
          </div>
        </div>
        {!isInCart ? (
          <Button 
            onClick={handleAddToCart}
            className="w-full bg-stone-800 hover:bg-stone-700 text-white"
          >
            Add to Cart
          </Button>
        ) : (
          <div className="flex justify-center">
            <QuantityControls />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductCard;