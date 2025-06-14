import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useCart } from '../components/CartContext';
import { Link } from 'react-router-dom';
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
} from '../components/ui/alert-dialog';
import { MdOutlineShoppingBag } from 'react-icons/md';
import CartItemCard from '../components/CartItemCard';
import OrderSummaryCard from '../components/OrderSummaryCard';

const Cart = () => {
  const [isOpen, setIsOpen] = useState(false);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow style
      const originalStyle = window.getComputedStyle(document.body).overflow;

      // Prevent scrolling
      document.body.style.overflow = 'hidden';

      // Cleanup function to restore original overflow
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    totalItems,
  } = useCart();

  const handleClearCart = () => {
    clearCart();
    closeCart();
  };

  const handleCheckout = () => {
    // Navigate to checkout or handle checkout logic
    closeCart();
  };

  return (
    <>
      {/* Cart Trigger Button */}
      <button
        onClick={openCart}
        className='relative text-cornsilk-dark hover:bg-cornsilk-hover dark:hover:bg-zinc-800 p-2 rounded-full'
      >
        <MdOutlineShoppingBag size={23} className='dark:text-cornsilk' />
        {totalItems > 0 && (
          <span className='absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center'>
            {totalItems}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 z-1 transition-opacity duration-300'
          onClick={closeCart}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-110 bg-white dark:bg-gray-900 shadow-xl z-10 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='flex flex-col h-full'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700'>
            <div className='flex items-center gap-2'>
              <h2 className='text-lg font-semibold'>Your Shopping Cart</h2>

              {/* {totalItems > 0 && (
                <span className='bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center'>
                  {totalItems}
                </span>
              )} */}
            </div>

            <div className='inline-flex items-center gap-2'>
              {cartItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant='destructive'
                      size='icon'
                      className='bg-red-400 hover:ring-2 hover:ring-offset-1 hover:ring-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                    >
                      <Trash2 className='size-2' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className='p-0 rounded-xl w-5/6 sm:w-full'>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-left text-lg leading-7 px-2.5 pt-2.5'>
                        Clear Your Shopping Cart
                      </AlertDialogTitle>
                      <Separator
                        className='bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px'
                        orientation='horizontal'
                      />
                      <AlertDialogDescription className='text-sm md:text-md text-center px-2.5 pt-2.5 w-full'>
                        Are you sure, you want to remove all the items from your
                        cart?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter
                      className={
                        'flex flex-row-reverse items-center gap-1 mb-2 px-2'
                      }
                    >
                      <AlertDialogCancel className='rounded-lg '>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className='rounded-lg m-0'
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <Button
                variant='ghost'
                size='sm'
                onClick={closeCart}
                className='h-8 w-8 p-0'
              >
                <X className='size-5' />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {cartItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center h-full p-8 text-center'>
                <div className='p-1 transform-gpu'>
                  <video
                    className='size-70 md:size-80 object-cover rounded-lg'
                    src='/cart.mp4'
                    autoPlay
                    loop
                    muted
                    playsInline
                  ></video>
                </div>
                <h3 className='text-lg font-medium mb-2'>Your cart is empty</h3>
                <p className='text-gray-500 mb-4'>
                  Add some items to get started
                </p>
                <Button onClick={closeCart} className='w-fit'>
                  <Link to='/collections' className='w-full'>
                    Continue Shopping
                  </Link>
                </Button>
              </div>
            ) : (
              <div className='flex flex-col gap-4 mt-5 mx-5'>
                {/* Cart Items */}
                <div className='space-y-2 flex-1'>
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onUpdateQuantity={updateQuantity}
                      onRemove={removeFromCart}
                    />
                  ))}
                </div>

                {/* Separator */}
                {/* <Separator
              orientation='vertical'
              className='h-auto hidden lg:block'
            /> */}

                {/* Responsive Separator */}
                <Separator className='my-4' />
              </div>
            )}
          </div>

          {/* Order Summary */}
          {!cartItems.length === 0 && (
            <OrderSummaryCard
              totalItems={totalItems}
              totalCost={calculateTotal()}
            />
          )}

          {/* Footer */}
        </div>
      </div>
    </>
  );
};

export default Cart;
