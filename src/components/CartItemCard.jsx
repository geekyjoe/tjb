import React from 'react';
import { Button } from './ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './ui/alert-dialog';
import { X } from 'lucide-react';
import * as Separator from '@radix-ui/react-separator';

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => (
  <div className='flex items-center border dark:border-white/25 p-2 space-x-4'>
    <img
      src={item.thumbnail}
      alt={item.title}
      className='w-24 h-24 object-cover rounded-md'
    />
    <div className='w-full'>
      <h4 className='truncate'>{item.title}</h4>
      <p className='text-xs md:text-sm text-gray-600 dark:text-gray-300'>
        ${item.price.toFixed(2)} each
      </p>
      <div className='flex items-center space-x-3 mt-2'>
        {item.quantity === 1 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size='icon'
                variant='destructive'
                className='bg-red-400 dark:bg-red-600 hover:ring-2 hover:ring-offset-1 hover:ring-red-400 hover:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
              >
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className='p-2.5 rounded-xl w-5/6 sm:w-full dark:bg-cornsilk-d2 outline-none'>
              <AlertDialogHeader>
                <AlertDialogTitle className='text-left text-md md:text-lg leading-8 dark:text-white/85'>
                  Remove Item
                </AlertDialogTitle>
                <Separator.Root
                  className='bg-black/50 dark:bg-white/25 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px'
                  orientation='horizontal'
                />
                <AlertDialogDescription className='text-sm md:text-md text-center dark:text-white/75 py-0.5 w-full'>
                  Are you sure you want to remove "
                  <span className='font-semibold'>{item.title}</span>" from your
                  cart?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter
                className={'flex justify-end items-center gap-1'}
              >
                <AlertDialogCancel className='rounded-lg px-2.5 md:px-4'>
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(item.id)}
                  className='rounded-lg dark:bg-red-700 px-2.5 md:px-4 m-0'
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            className='hover:ring-2 hover:ring-offset-1 hover:ring-white/25 focus:ring-2 focus:ring-offset-2 focus:ring-white/50'
            size='icon'
            variant='ghost'
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            -
          </Button>
        )}
        <span className='text-lg'>{item.quantity}</span>
        <Button
          className='hover:ring-2 hover:ring-offset-1 hover:ring-white/25 focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-50 disabled:cursor-not-allowed'
          size='icon'
          variant='ghost'
          disabled={item.quantity >= 10}
          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
        >
          +
        </Button>
      </div>
    </div>
    <div className='flex flex-col items-end space-y-2'>
      <span className='font-bold text-md whitespace-normal'>
        ${(item.price * item.quantity).toFixed(2)}
      </span>
    </div>
  </div>
);

export default CartItemCard;