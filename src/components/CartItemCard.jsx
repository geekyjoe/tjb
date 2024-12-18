import React from "react";
import { Button } from "antd";

const CartItemCard = ({ 
  item, 
  onUpdateQuantity, 
  onRemove 
}) => (
  <div className="flex items-center bg-white dark:bg-neutral-800 shadow-md rounded-lg p-4 space-x-4">
    <img
      src={item.thumbnail}
      alt={item.title}
      className="w-24 h-24 object-cover rounded-md"
    />
    <div className="flex-grow">
      <h4 className="text-lg font-semibold">{item.title}</h4>
      <p className="text-gray-600 dark:text-gray-300">
        ${item.price.toFixed(2)} each
      </p>
      <div className="flex items-center space-x-3 mt-2">
        <Button 
          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          disabled={item.quantity <= 1}
        >
          -
        </Button>
        <span className="text-lg">{item.quantity}</span>
        <Button 
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </Button>
      </div>
    </div>
    <div className="flex flex-col items-end space-y-2">
      <span className="font-bold text-lg">
        ${(item.price * item.quantity).toFixed(2)}
      </span>
      <Button 
        type="text" 
        danger 
        onClick={() => onRemove(item.id)}
      >
        Remove
      </Button>
    </div>
  </div>
);

export default CartItemCard;
