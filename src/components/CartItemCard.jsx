import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { X, Undo2, Trash, Loader } from 'lucide-react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, ChevronUp } from 'lucide-react';

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [undoTimeout, setUndoTimeout] = useState(null);
  const [isUpdatingQuantity, setIsUpdatingQuantity] = useState(false);

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

  const handleQuantityChange = async (value) => {
    setIsUpdatingQuantity(true);

    // Set a 5-second timeout before updating quantity and hiding loading state
    setTimeout(async () => {
      try {
        await onUpdateQuantity(item.id, parseInt(value));
      } finally {
        setIsUpdatingQuantity(false);
      }
    }, 3000);
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
      <div className='flex items-center justify-between border dark:border-white/25 p-2 bg-stone-200/80 dark:bg-stone-950 rounded-md'>
        <div className='p-1.5 text-black/90 dark:text-white/90'>
          <p className='text-xs md:text-base'>
            "{item.title}" removed from cart
          </p>
        </div>
        <Button
          onClick={handleUndo}
          variant='outline'
          size='sm'
          className='inline-flex items-center rounded gap-2 dark:bg-zinc-800 border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800/30'
        >
          <Undo2 className='size-4' />
          <span>Undo</span>
        </Button>
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center border dark:border-white/25 p-1.5 md:p-2 space-x-4'>
      <div className='flex items-center justify-between w-full'>
        <img
          src={item.thumbnail}
          alt={item.title}
          className='size-18 md:size-24 object-cover rounded-md'
        />
        <div className='w-full'>
          <h4 className='text-xs md:text-[0.9rem] truncate hyphens-auto'>
            {item.title}
          </h4>
          <p className='text-xs md:text-sm text-gray-600 dark:text-gray-300'>
            ${item.price.toFixed(2)} each
          </p>
        </div>
        <div className='text-xs md:text-[0.9rem] items-end'>
          <span className='font-semibold'>
            ${(item.price * item.quantity).toFixed(2)}
          </span>
        </div>
      </div>
      <div className='flex items-center justify-between w-full p-1'>
        <div className='relative'>
          <Select.Root
            value={item.quantity.toString()}
            onValueChange={handleQuantityChange}
            disabled={isUpdatingQuantity}
          >
            <Select.Trigger
              className={`inline-flex items-center justify-between px-3 py-2 text-sm md:text-lg ring-2 ring-stone-300 dark:ring-stone-600 rounded-lg outline-none transition-all duration-200 bg-white dark:bg-zinc-800 text-black dark:text-white hover:ring-2 hover:ring-offset-2 hover:ring-stone-400 dark:hover:ring-stone-500 gap-2 ${
                isUpdatingQuantity ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Select.Value />
              <Select.Icon>
                {isUpdatingQuantity ? (
                  <Loader className='size-4 animate-spin' />
                ) : (
                  <ChevronDown className='size-4 opacity-60' />
                )}
              </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content
                className='overflow-hidden bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 rounded-lg shadow-lg z-50'
                side='bottom'
                position='popper'
                align='center'
              >
                <Select.ScrollUpButton className='flex items-center justify-center h-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default'>
                  <ChevronUp className='size-4' />
                </Select.ScrollUpButton>

                <Select.Viewport className='p-1 '>
                  {[...Array(10)].map((_, i) => (
                    <Select.Item
                      key={i + 1}
                      value={(i + 1).toString()}
                      className='text-center items-center px-5 py-2.5 text-sm md:text-base text-gray-900 dark:text-gray-100 rounded hover:bg-stone-100 dark:hover:bg-stone-700 focus:bg-stone-100 dark:focus:bg-stone-700 outline-none select-none'
                    >
                      <Select.ItemText>{i + 1}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>

                <Select.ScrollDownButton className='flex items-center justify-center h-6 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 cursor-default'>
                  <ChevronDown className='size-4' />
                </Select.ScrollDownButton>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <button
          className='p-1.5 rounded-lg outline-none transition-all text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white hover:bg-stone-200 dark:hover:bg-stone-700 hover:ring-2 hover:ring-black/50 dark:hover:ring-stone-500 hover:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-500 dark:focus:ring-stone-900 focus:outline-none'
          onClick={handleRemove}
        >
          <Trash className='size-4' />
        </button>
      </div>
    </div>
  );
};

export default CartItemCard;
