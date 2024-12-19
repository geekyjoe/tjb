import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCart } from "./CartContext.jsx";
import { toast } from "sonner";
import { Star } from "lucide-react";

const ProductCard = ({ product, viewMode = "grid", className = "" }) => {
  const { addToCart, removeFromCart, cartItems, updateQuantity } = useCart();

  const cartItem = cartItems.find((item) => item.id === product.id);
  const isInCart = !!cartItem;

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`, {
      description: `Price: $${product.price.toFixed(2)}`,
      position: "bottom-right",
    });
  };

  const handleIncreaseQuantity = (e) => {
    e.stopPropagation();
    const newQuantity = (cartItem?.quantity || 0) + 1;
    updateQuantity(product.id, newQuantity);
    toast.info(`${product.title} quantity updated`, {
      description: `New quantity: ${newQuantity}`,
      position: "bottom-right",
    });
  };

  const handleDecreaseQuantity = (e) => {
    e.stopPropagation();
    if (cartItem?.quantity > 1) {
      const newQuantity = cartItem.quantity - 1;
      updateQuantity(product.id, newQuantity);
      toast.info(`${product.title} quantity updated`, {
        description: `New quantity: ${newQuantity}`,
        position: "bottom-right",
      });
    } else {
      removeFromCart(product.id);
      toast.warning(`${product.title} removed from cart`, {
        position: "bottom-right",
      });
    }
  };

  const QuantityControls = () => (
    <div className="flex items-center max-sm:justify-end s:space-x-2 max-lg:space-x-5">
      <Button
        variant="outline"
        onClick={handleDecreaseQuantity}
        size="sm"
        className="s:h-5 s:2-fit max-sm:w-6 max-sm:h-6 bg-indigo-50 hover:bg-stone-200 dark:hover:bg-stone-700"
      >
        -
      </Button>
      <div className="max-sm:text-xs text-md font-semibold text-stone-800 dark:text-stone-200">
        {cartItem?.quantity || 0}
      </div>
      <Button
        variant="outline"
        onClick={handleIncreaseQuantity}
        size="sm"
        className="s:h-5 s:2-fit max-sm:w-6 max-sm:h-6 bg-indigo-50 hover:bg-stone-200 dark:hover:bg-stone-700"
      >
        +
      </Button>
    </div>
  );

  if (viewMode === "list") {
    return (
      <div className="flex gap-4 bg-white dark:bg-neutral-700 p-4 rounded-lg shadow hover:shadow-md transition-shadow">
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
          <div className="mt-auto flex justify-between items-center">
            <span className="max-l:text-sm text-xl font-bold text-gray-800 dark:text-gray-100">
              ${product.price.toFixed(2)}
            </span>
            {!isInCart ? (
              <Button
                onClick={handleAddToCart}
                className="max-l:h-6 max-l:w-1/2 max-l:rounded bg-stone-800 hover:bg-stone-700 text-white"
              >
                <span className="max-l:text-xs">Add to Cart</span>
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
    <Card
      className={`bg-white dark:bg-neutral-700 hover:shadow-md transition-shadow ${className}`}
    >
      <CardHeader className="p-0">
        <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0">
          <img
            src={product.thumbnail}
            alt={product.title}
            className="w-full h-full object-cover rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="max-l:p-2 p-4">
        <div className="max-sm:mb-2 mb-4">
          <CardTitle className="max-sm:text-sm max-sm:line-clamp-1 text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
            {product.title}
          </CardTitle>
          <CardDescription className="max-sm:text-xs text-md text-gray-600 dark:text-gray-300 line-clamp-2">
            {product.description}
          </CardDescription>
        </div>
        <div className="flex justify-between items-center mb-4">
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
        {!isInCart ? (
          <div className="flex max-sm:justify-end">
            <Button
              onClick={handleAddToCart}
              className="max-sm:h-6 s:w-fit s:rounded w-full bg-stone-800 hover:bg-stone-700 text-white"
            >
              <span className="max-sm:text-xs text-lg">Add to Cart</span>
            </Button>
          </div>
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
