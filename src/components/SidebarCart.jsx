import React, { useState, useEffect } from 'react';
import { X, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import * as Separator from '@radix-ui/react-separator';
import { useCart } from '../components/CartContext';
import { Link } from 'react-router-dom';
import { useSpring, animated, useSprings, config } from '@react-spring/web';
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
  const [isClosing, setIsClosing] = useState(false);
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    totalItems,
  } = useCart();

  const openCart = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  const closeCart = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300);
  };

  // Animations
  const overlayAnimation = useSpring({
    opacity: isOpen && !isClosing ? 1 : 0,
    config: config.gentle,
  });

  const cartAnimation = useSpring({
    transform: isOpen && !isClosing ? 'translateX(0%)' : 'translateX(100%)',
    opacity: isOpen && !isClosing ? 1 : 0,
    config: {
      tension: 280,
      friction: 30,
      delay: isOpen && !isClosing ? 100 : 0,
    },
  });

  const cartItemSprings = useSprings(
    cartItems.length,
    cartItems.map((_, i) => ({
      // opacity: isOpen && !isClosing ? 1 : 0,
      transform: isOpen && !isClosing ? 'translateY(0px)' : 'translateY(-20px)',
      delay: isOpen && !isClosing ? i * 50 : 0,
      config: config.gentle,
    }))
  );

  // Enhanced body scroll prevention for mobile and desktop
  useEffect(() => {
    if (!isOpen) return;

    const body = document.body;
    const scrollY = window.scrollY;

    // Store original styles
    const originalStyles = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    // Apply scroll lock styles
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    const handleResize = () => closeCart();
    window.addEventListener('resize', handleResize);

    return () => {
      // Restore original styles
      Object.entries(originalStyles).forEach(([key, value]) => {
        body.style[key] = value || '';
      });

      // Restore scroll position
      window.scrollTo(0, scrollY);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isClosing) closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, isClosing]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isClosing) closeCart();
  };

  return (
    <>
      {/* Cart Trigger */}
      <button
        onClick={openCart}
        className='relative text-cornsilk-dark hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none p-2 rounded-full transition-colors duration-200'
      >
        <MdOutlineShoppingBag size={23} className='text-black/75 dark:text-white/75' />
        {totalItems > 0 && (
          <span className='absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full size-4 flex items-center justify-center'>
            {totalItems}
          </span>
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <animated.div
          style={overlayAnimation}
          className='fixed inset-0 bg-linear-to-l md:from-black/75 from-black/100 to-black/40 h-screen z-49 cursor-pointer'
          onClick={handleOverlayClick}
        />
      )}

      {/* Sidebar */}
      {isOpen && (
        <animated.div
          style={cartAnimation}
          className='fixed top-0 right-0 min-h-[100dvh] w-9/10 sm:w-110 bg-white dark:bg-cornsilk-d1 z-50 overflow-y-auto will-change-transform flex flex-col sm:rounded-l-xl'
        >
          {/* Header */}
          <div className='flex items-center justify-between p-4'>
            <h2 className='text-sm md:text-lg font-semibold'>Your Shopping Cart</h2>
            <div className='flex items-center gap-2'>
              {cartItems.length > 0 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size='icon'
                      className='size-7.5 md:size-9 p-1.5 rounded-lg outline-none text-black/75 dark:text-white/75 bg-transparent dark:bg-transparent shadow-none hover:bg-red-200 dark:hover:text-white hover:text-red-600 dark:hover:bg-red-600  hover:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:outline-none'
                    >
                      <Trash2 className='size-4' />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className='p-0 rounded-xl w-5/6 sm:w-full dark:bg-cornsilk-d2'>
                    <AlertDialogHeader>
                      <AlertDialogTitle className='text-left text-lg leading-7 px-2.5 pt-2.5'>
                        Clear Your Shopping Cart
                      </AlertDialogTitle>
                      <Separator.Root
                        className='h-px bg-black/25 dark:bg-white/25'
                        orientation='horizontal'
                      />
                      <AlertDialogDescription className='text-sm md:text-md text-center px-2.5 pt-2.5'>
                        Are you sure you want to remove all items from your
                        cart?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className='flex justify-end items-center gap-1 mb-2 px-2'>
                      <AlertDialogCancel className='rounded-lg px-2.5 md:px-4'>
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={clearCart}
                        className='rounded-lg m-0 dark:bg-red-700 px-2.5 md:px-4'
                      >
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
              <button
                onClick={closeCart}
                className='inline-flex shadow transition-all rounded-lg text-black/75 dark:text-white/75 hover:text-black dark:hover:text-white focus:text-black/50 dark:focus:text-white/50 focus:scale-90 p-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none'
                disabled={isClosing}
              >
                <X className='size-5' />
              </button>
            </div>
          </div>
          <Separator.Root
            className='h-px bg-black/25 dark:bg-white/25'
            orientation='horizontal'
          />
          {/* Content */}
          <div className='flex-1 overflow-y-auto'>
            {cartItems.length === 0 ? (
              <div className='flex flex-col items-center justify-center min-h-[90dvh] p-4 text-center'>
                <video
                  className='h-60 w-40 md:h-80 md:w-80 md:dark:w-50 object-cover p-0.5 rounded-t-full'
                  src='/cart.mp4'
                  autoPlay
                  loop
                  muted
                  playsInline
                />
                <h3 className='text-lg font-medium leading-12'>
                  Your cart is empty
                </h3>
                <p className='dark:text-gray-300 mb-2'>
                  Add some items to get started
                </p>
                <Link
                  to='/collections'
                  className='w-full hover:underline hover:underline-offset-4 focus:underline focus:underline-offset-4'
                  onClick={closeCart}
                >
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className='flex flex-col gap-4 mt-2 mx-1'>
                <div className='space-y-2 flex-1'>
                  {cartItems.map((item, i) => (
                    <animated.div key={item.id} style={cartItemSprings[i]}>
                      <CartItemCard
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeFromCart}
                      />
                    </animated.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          {cartItems.length > 0 && (
            <div className='p-1.5'>
              <OrderSummaryCard
                totalItems={totalItems}
                totalCost={calculateTotal()}
              />
            </div>
          )}
        </animated.div>
      )}
    </>
  );
};

export default Cart;
