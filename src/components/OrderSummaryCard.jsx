import React from "react";
import { Button } from "./ui/button";

const OrderSummaryCard = ({ totalItems, totalCost }) => (
  <div className="bg-white dark:bg-neutral-800 border rounded-lg p-6 h-fit">
    <h3 className="text-2xl font-bold mb-4">Order Summary</h3>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span>Total Items:</span>
        <span>{totalItems}</span>
      </div>
      <div className="flex justify-between">
        <span className="font-semibold">Total:</span>
        <span className="text-2xl font-bold">${totalCost}</span>
      </div>
      <Button 
        type="primary" 
        className="w-full bg-green-600 hover:bg-green-700"
      >
        Proceed to Checkout
      </Button>
    </div>
  </div>
);

export default OrderSummaryCard;
