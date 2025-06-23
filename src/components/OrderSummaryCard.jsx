import React from 'react';

const OrderSummaryCard = ({ totalItems, totalCost }) => (
  <div className='bg-white dark:bg-cornsilk-d4 border border-black/25 dark:border-white/25 rounded-lg p-3 h-fit'>
    <h3 className='text-base font-bold leading-10'>Order Summary</h3>
    <div className='space-y-4'>
      <div className='flex justify-between items-center text-sm text-gray-600 dark:text-gray-400'>
        <span>Total Items:</span>
        <span className='font-medium text-gray-900 dark:text-white'>
          {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>
      <hr className='border-gray-200 dark:border-gray-700' />
      <div className='flex justify-between text-lg md:text-2xl'>
        <span className='font-semibold'>Total:</span>
        <span className='font-bold'>${totalCost}</span>
      </div>
      <button
        type='primary'
        className='w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-1.5 px-2 rounded transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
        disabled
      >
        Checkout
      </button>
    </div>
  </div>
);

export default OrderSummaryCard;
