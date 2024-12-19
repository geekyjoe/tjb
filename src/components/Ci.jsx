import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MdShoppingBag } from "react-icons/md";

const CartIndicator = ({ itemCount = 0 }) => {
  const [bounce, setBounce] = useState(false);
  
  useEffect(() => {
    if (itemCount > 0) {
      setBounce(true);
      const timer = setTimeout(() => setBounce(false), 200);
      return () => clearTimeout(timer);
    }
  }, [itemCount]);

  return (
    <Link 
      to="../cart" 
      className="relative inline-block transition-transform hover:scale-105"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <MdShoppingBag 
        className={`h-6 w-6 transition-transform duration-200 ${
          bounce ? 'scale-110' : 'scale-100'
        }`}
      />
      {itemCount > 0 && (
        <div 
          className={`absolute -top-2 -right-2 bg-amber-500 text-white 
            rounded-full h-5 w-5 flex items-center justify-center
            text-xs font-bold shadow-sm
            ${bounce ? 'animate-bounce' : ''}
          `}
        >
          {itemCount}
        </div>
      )}
    </Link>
  );
};

export default CartIndicator;