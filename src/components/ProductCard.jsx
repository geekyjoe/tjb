/** @type {import("react")} */
import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCart } from './CartContext.jsx';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();

  return (
    <Card className='bg-gray-300 dark:bg-gray-700 w-7/8 m-2'>
      <CardHeader className='p-0'>
        <img 
          src={product.image} 
          alt={product.title} 
          className='w-full h-[450px] object-cover'
        />
      </CardHeader>
      <CardContent className='p-4'>
        <CardTitle className='text-gray-500 dark:text-gray-200 text-lg mb-2'>
          {product.title}
        </CardTitle>
        <CardDescription className="dark:text-gray-300 text-base">
          ${product.price}
        </CardDescription>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => addToCart(product)}
          className='w-full bg-indigo-500 dark:bg-indigo-500 hover:bg-indigo-400 dark:hover:bg-indigo-600'
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;