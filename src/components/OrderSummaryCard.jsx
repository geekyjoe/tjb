import React from "react";
import { Button } from "./ui/button";

const OrderSummaryCard = ({ totalItems, totalCost }) => (
  <div className="bg-white dark:bg-cornsilk-d4 border dark:border-white/25 rounded-t-lg p-3 h-fit">
    <h3 className="text-base font-bold leading-10">Order Summary</h3>
    <div className="space-y-4">
      <div className="flex justify-between text-sm md:text-md">
        <span>Total Items:</span>
        <span>{totalItems}</span>
      </div>
      <div className="flex justify-between text-xl md:text-2xl">
        <span className="font-semibold">Total:</span>
        <span className="font-bold">${totalCost}</span>
      </div>
      <Button 
        type="primary" 
        className="w-fit bg-green-600 hover:bg-green-700"
      >
        Proceed to Checkout
      </Button>
    </div>
  </div>
);

export default OrderSummaryCard;
