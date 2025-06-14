import React, { useEffect } from 'react';
import { CopyrightCircleOutlined } from '@ant-design/icons';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { useCart } from '../components/CartContext';
import CartItemCard from '../components/CartItemCard';
import OrderSummaryCard from '../components/OrderSummaryCard';
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
import Footer from '../components/Footer';
import { Toaster } from '../components/ui/sonner';

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    calculateTotal,
    clearCart,
    totalItems,
  } = useCart();

  useEffect(() => {
    document.title = 'Shopping Bag';
  }, []);

  return (
    <div className='bg-cornsilk dark:bg-cornsilk-d1 min-h-full'>
      <Toaster richcolors />
      <div className='h-full font-inter grow text-neutral-800 dark:text-neutral-200'>
        <div className='flex justify-between items-center p-5'>
          <h2 className='text-2xl font-semibold text-left'>Bag</h2>
          {cartItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant='destructive'
                  size='sm'
                  className='bg-red-400 hover:ring-2 hover:ring-offset-1 hover:ring-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500'
                >
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className='p-0 rounded-xl w-5/6 sm:w-full'>
                <AlertDialogHeader>
                  <AlertDialogTitle className='text-left text-lg p-3 pb-0'>
                    Clear Cart
                  </AlertDialogTitle>
                  <Separator
                    className='bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px'
                    orientation='horizontal'
                  />
                  <AlertDialogDescription className='text-sm md:text-md text-center px-5 pt-5 w-full'>
                    Are you sure you want to remove all the items from your
                    cart?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter
                  className={
                    'flex flex-row-reverse items-center gap-1 space-y-5 px-2.5 pb-2.5'
                  }
                >
                  <AlertDialogCancel className='rounded-lg mt-5'>
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
        </div>
        <Separator
          className='bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px'
          orientation='horizontal'
        />

        {cartItems.length === 0 ? (
          <div className='grid place-content-center space-y-2 my-24 xl:my-7 2xl:my-20 h-96'>
            <div className='p-1 transform-gpu'>
              <video
                className='size-80 object-cover rounded-lg'
                src='./cart.mp4'
                autoPlay
                loop
                muted
                playsInline
              >
                {/* Fallback icon if video fails to load */}
              </video>
            </div>
            <p className='text-md'>Your Cart is empty</p>
            <Button variant='link'>
              <Link className='mt-5 p-2 rounded-md' to='..\products'>
                <p className='text-sm'>Start Shopping</p>
              </Link>
            </Button>
          </div>
        ) : (
          <div className='flex flex-col lg:flex-row gap-4 mt-5 mx-5'>
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
            <Separator
              orientation='vertical'
              className='h-auto hidden lg:block'
            />

            {/* Responsive Separator */}
            <Separator className='my-4 lg:hidden' />

            {/* Order Summary */}
            <div className='lg:w-1/3'>
              <OrderSummaryCard
                totalItems={totalItems}
                totalCost={calculateTotal()}
              />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
