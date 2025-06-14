import React from "react";
import { Button } from "./ui/button";
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
} from "./ui/alert-dialog";
import { X } from "lucide-react";
import * as Separator from "@radix-ui/react-separator";

const CartItemCard = ({ item, onUpdateQuantity, onRemove }) => (
  <div className="flex items-center bg-white dark:bg-neutral-800 border-2 rounded-lg p-4 space-x-4">
    <img
      src={item.thumbnail}
      alt={item.title}
      className="w-24 h-24 object-cover rounded-md"
    />
    <div className=" items-center justify-around w-full">
      <h4 className="text-lg font-semibold whitespace-normal">{item.title}</h4>
      <p className="text-gray-600 dark:text-gray-300">
        ${item.price.toFixed(2)} each
      </p>
      <div className="flex items-center space-x-3 mt-2">
        {item.quantity === 1 ? (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                size="icon"
                variant="destructive"
                className="bg-red-400 hover:ring-2 hover:ring-offset-1 hover:ring-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <X />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="p-0 rounded-xl w-5/6 sm:w-full">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-left text-lg p-4 pb-0">
                  Remove Item
                </AlertDialogTitle>
                <Separator.Root
                  className="bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
                  orientation="horizontal"
                />
                <AlertDialogDescription className="text-sm md:text-md text-center px-5 pt-5 w-full">
                  Are you sure you want to remove "
                  <span className="font-semibold">{item.title}</span>" from your
                  cart?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter
                className={
                  "flex flex-row-reverse items-center gap-1 space-y-5 px-2.5 pb-2.5"
                }
              >
                <AlertDialogCancel className="rounded-lg mt-5">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onRemove(item.id)}
                  className="rounded-lg m-0"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            className="hover:ring-2 hover:ring-offset-1 hover:ring-neutral-300 focus:ring-2 focus:ring-offset-2 focus:ring-stone-200"
            size="icon"
            variant="ghost"
            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
          >
            -
          </Button>
        )}
        <span className="text-lg">{item.quantity}</span>
        <Button
          className="hover:ring-2 hover:ring-offset-1 hover:ring-neutral-300 focus:ring-2 focus:ring-offset-2 focus:ring-stone-200"
          size="icon"
          variant="ghost"
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
    </div>
  </div>
);

export default CartItemCard;
