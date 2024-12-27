import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCart } from "./CartContext";
import { toast } from "sonner";
import { Star, ArrowRight } from "lucide-react";

const ProductCard = ({ product, viewMode = "grid", className = "" }) => {
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const isInCart = cartItems.some(item => item.id === product.id);

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product);
    toast.success(`${product.title} added to cart`, {
      description: `Price: $${product.price.toFixed(2)}`,
      position: "bottom-right",
    });
  };

  const handleGoToCart = (e) => {
    e.stopPropagation();
    navigate('/cart');
  };

  if (viewMode === "list") {
    return (
      <div 
        className="flex gap-4 border dark:border-neutral-600 dark:hover:border-neutral-500 bg-white dark:bg-neutral-800 p-4 rounded-lg hover:shadow cursor-pointer"
        onClick={handleProductClick}
      >
        <div className="s:w-16 s:h-16 m:w-24 m:h-24 flex-shrink-0">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover rounded-md"
          />
        </div>
        <div className="flex flex-col flex-grow">
          <div>
            <h3 className="min-xl:text-xl l:text-sm s:text-xs font-semibold text-gray-800 dark:text-gray-100">
              {product.title}
            </h3>
            <p className="max-l:text-xs text-gray-600 line-clamp-2 dark:text-gray-300 mt-2">
              {product.description}
            </p>
            <div className="flex items-center mt-2">
              <Star className="max-l:w-3 max-l:h-3 w-4 h-4 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 max-l:text-xs text-sm text-gray-600 dark:text-gray-300">
                {product.rating}
              </span>
            </div>
          </div>
          <div className="mt-2 flex justify-between items-center">
            <span className="max-l:text-sm text-xl font-bold text-gray-800 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </span>
            {/* {!isInCart ? (
              <Button
                onClick={handleAddToCart}
                className="max-l:h-6 max-l:w-1/2 max-l:rounded bg-stone-800 hover:bg-stone-700 text-white"
              >
                <span className="max-l:text-xs">Add to Cart</span>
              </Button>
            ) : (
              <Button
                onClick={handleGoToCart}
                className="max-l:h-6 max-l:w-1/2 max-l:rounded bg-stone-800 hover:bg-stone-700 text-white"
              >
                <span className="max-l:text-xs">Go to Cart</span>
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            )} */}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
        className={`w-38 rounded-md border-none my-1 mx-1 dark:shadow-neutral-600 cursor-pointer ${className}`}
      onClick={handleProductClick}
    >
      <CardHeader className="p-0 border rounded-t-md">
        <div className="flex-shrink-0">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full pointer-events-none rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="max-l:p-2 p-4">
        <div className="max-sm:mb-2 mb-4">
          <CardTitle className="max-sm:text-sm text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2 line-clamp-1">
            {product.brand}
          </CardTitle>
          <CardDescription className="max-sm:text-xs text-md text-gray-600 dark:text-gray-300 line-clamp-1">
            {product.title}
          </CardDescription>
        </div>
        <div className="flex justify-between items-center">
          <span className="max-sm:text-sm text-lg font-bold text-gray-800 dark:text-gray-100">
            ${product.price.toFixed(2)}
          </span>
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            <span className="max-sm:text-xs ml-1 text-sm text-gray-600 dark:text-gray-300">
              {product.rating}
            </span>
          </div>
        </div>
        {/* {!isInCart ? (
          <div className="flex max-sm:justify-end">
            <Button
              onClick={handleAddToCart}
              className="max-sm:h-6 s:w-fit s:rounded w-full bg-stone-800 hover:bg-stone-700 text-white"
            >
              <span className="max-sm:text-xs text-lg">Add to Cart</span>
            </Button>
          </div>
        ) : (
          <div className="flex max-sm:justify-end">
            <Button
              onClick={handleGoToCart}
              className="max-sm:h-6 s:w-fit s:rounded w-full bg-stone-800 hover:bg-stone-700 text-white"
            >
              <span className="max-sm:text-xs text-lg">Go to Cart</span>
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        )} */}
      </CardContent>
    </Card>
  );
};

export default ProductCard;