import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Undo2, Trash } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [undoTimeout, setUndoTimeout] = useState(null);

  const handleRemove = () => {
    setIsRemoving(true);
    
    // Set timeout to actually remove the item after 5 seconds
    const timeout = setTimeout(() => {
      onRemove(item.id);
      setIsRemoving(false);
    }, 5000);
    
    setUndoTimeout(timeout);
  };

  const handleUndo = () => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
      setUndoTimeout(null);
    }
    setIsRemoving(false);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (undoTimeout) {
        clearTimeout(undoTimeout);
      }
    };
  }, [undoTimeout]);

  if (isRemoving) {
    return (
      <div className='flex items-center justify-between border dark:border-white/25 p-1.5 md:p-2 bg-stone-100 dark:bg-stone-900/20'>
        <div className='space-x-4 p-1'>
          {/* <div className='size-18 md:size-24 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center'>
            <X className='size-6 text-gray-400' />
          </div> */}
          <div>
            <p className='text-sm md:text-base'>
              "{item.title}" removed from cart
            </p>
            {/* <p className='text-xs text-red-600 dark:text-red-400'>
               will be deleted in 5 seconds
            </p> */}
          </div>
        </div>
        <Button
          onClick={handleUndo}
          variant='outline'
          size='sm'
          className='flex items-center space-x-2 border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800/30'
        >
          <Undo2 className='size-4' />
          <span>Undo</span>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex items-center border dark:border-white/25 p-1.5 md:p-2 space-x-4'>
      <img
        src={item.thumbnail}
        alt={item.title}
        className='size-18 md:size-24 object-cover rounded-md'
      />
      <div className='w-full'>
        <h4 className='text-xs md:text-[0.9rem] truncate hyphens-auto'>{item.title}</h4>
        <p className='text-xs md:text-sm text-gray-600 dark:text-gray-300'>
          ${item.price.toFixed(2)} each
        </p>
        <div className='flex items-center space-x-3 mt-2'>
          {item.quantity === 1 ? (
            <button
              className='p-1.5 rounded-lg outline-none transition-all text-black/75 dark:text-red-600 hover:bg-red-200 dark:hover:bg-red-600 hover:text-red-600 dark:hover:bg-red-600  hover:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none'
              onClick={handleRemove}
            >
              <Trash className='size-4 '/>
            </button>
          ) : (
            <Button
              className='size-7.5 md:size-9 hover:bg-stone-200 hover:ring hover:ring-offset-1 hover:ring-white/25 focus:ring-2 focus:ring-offset-2 focus:ring-white/50'
              size='icon'
              variant='ghost'
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
            >
              -
            </Button>
          )}
          <span className='text-sm md:text-lg'>{item.quantity}</span>
          <Button
            className='size-7.5 md:size-9 hover:bg-stone-200 hover:ring hover:ring-offset-1 hover:ring-white/25 focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-25 disabled:cursor-not-allowed'
            size='icon'
            variant='ghost'
            disabled={item.quantity >= 10}
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
          >
            +
          </Button>
        </div>
      </div>
      <div className='text-xs md:text-[0.9rem] items-end'>
        <span className='font-semibold'>
          ${(item.price * item.quantity).toFixed(2)}
        </span>
      </div>
    </div>
  );
};

export default CartItemCard;