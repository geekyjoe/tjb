import React, { useEffect } from "react";
import { CopyrightCircleOutlined } from "@ant-design/icons";
import { Button } from "../components/ui/button";
import { Separator } from "../components/ui/separator";
import { useCart } from "../components/CartContext";
import CartItemCard from "../components/CartItemCard";
import OrderSummaryCard from "../components/OrderSummaryCard";
import { Link } from "react-router-dom";
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
} from "../components/ui/alert-dialog";
import Footer from "../components/Footer";
import { Toaster } from "../components/ui/sonner";

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
    document.title = "Shopping Bag";
  }, []);

  return (
    <div className="bg-cornsilk dark:bg-cornsilk-d1 min-h-full">
      <Toaster richcolors/>
      <div className="h-full font-inter grow text-neutral-800 dark:text-neutral-200">
        <div className="flex justify-between items-center p-5">
          <h2 className="text-2xl font-semibold text-left">Bag</h2>
          {cartItems.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="bg-red-400 hover:ring-2 hover:ring-offset-1 hover:ring-red-400 focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Clear Cart
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="p-0 rounded-xl w-5/6 sm:w-full">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-left text-lg p-3 pb-0">
                    Clear Cart
                  </AlertDialogTitle>
                  <Separator
                    className="bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
                    orientation="horizontal"
                  />
                  <AlertDialogDescription className="text-sm md:text-md text-center px-5 pt-5 w-full">
                    Are you sure you want to remove all the items from your
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
                    onClick={clearCart}
                    className="rounded-lg m-0"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <Separator
          className="bg-gray-300 dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
          orientation="horizontal"
        />

        {cartItems.length === 0 ? (
          <div className="grid place-content-center space-y-2 my-24 xl:my-7 2xl:my-20 h-96">
            <svg
              className="p-5"
              height={150}
              width={150}
              viewBox="0 0 500 500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="empty-delete-remove-shopping-cart">
                <g>
                  <polygon
                    points="500,250 473.216,279.409 491.536,314.718 458.049,336.172 466.532,375.03 428.619,387.055     426.778,426.778 387.044,428.619 375.02,466.543 336.161,458.049 314.707,491.547 279.409,473.226 250,500 220.581,473.226     185.282,491.547 163.818,458.049 124.959,466.543 112.945,428.619 73.222,426.778 71.371,387.044 33.458,375.021 41.941,336.172     8.453,314.718 26.774,279.409 0,250 26.774,220.591 8.453,185.282 41.941,163.829 33.458,124.97 71.371,112.956 73.222,73.222     112.956,71.381 124.97,33.468 163.829,41.952 185.282,8.463 220.581,26.784 250,0 279.409,26.784 314.718,8.463 336.172,41.962     375.03,33.468 387.044,71.381 426.778,73.232 428.619,112.966 466.532,124.98 458.049,163.839 491.536,185.282 473.216,220.591       "
                    style={{ fill: "#9DD2D8" }}
                  />
                  <g id="_x32_0">
                    <g>
                      <g>
                        <path
                          d="M340.942,158.595c-16.876,0-30.823,12.344-33.396,28.493c-0.274,1.75-0.458,3.53-0.458,5.361       c0,3.799,0.651,7.441,1.811,10.854c3.348,9.878,11.129,17.7,20.986,21.113c3.469,1.206,7.172,1.887,11.058,1.887       c1.719,0,3.397-0.173,5.046-0.417c16.296-2.446,28.809-16.48,28.809-33.437C374.797,173.742,359.64,158.595,340.942,158.595z"
                          style={{ fill: "#FC6E51" }}
                        />
                        <path
                          d="M357.839,197.825h-2.787h-8.738h-10.752h-11.516c-2.96,0-5.382-2.416-5.382-5.376       c0-2.93,2.35-5.29,5.25-5.361c0.051,0,0.081-0.025,0.132-0.025h11.516h10.752h11.525c0.041,0,0.081,0.025,0.122,0.025       c0.184,0.005,0.346,0.081,0.519,0.102c2.665,0.336,4.721,2.513,4.721,5.26C363.2,195.409,360.819,197.825,357.839,197.825z"
                          style={{ fill: "#F4F8F8" }}
                        />
                      </g>
                    </g>
                    <path
                      d="M300.09,324.081c0,9.573,7.762,17.329,17.334,17.329c9.572,0,17.334-7.756,17.334-17.329     c0-9.577-7.762-17.344-17.334-17.344C307.852,306.737,300.09,314.504,300.09,324.081z"
                      style={{ fill: "#484B4D" }}
                    />
                    <path
                      d="M216.776,324.081c0-9.577-7.751-17.344-17.324-17.344c-9.582,0-17.334,7.767-17.334,17.344     c0,9.573,7.751,17.329,17.334,17.329C209.025,341.41,216.776,333.654,216.776,324.081z"
                      style={{ fill: "#484B4D" }}
                    />
                    <path
                      d="M341.207,234.278c-9.095,0-17.486-2.96-24.333-7.914h-23.021l1.984-23.062h5.137     c-0.905-3.418-1.444-6.998-1.444-10.701c0-1.872,0.173-3.703,0.406-5.514H182.21l-8.27-27.969h-0.132h-18.178h-30.426v14.755     h34.79l13.081,44.261l25.249,85.815H320.78l22.532-69.779C342.61,234.207,341.919,234.278,341.207,234.278z M187.001,203.303     h41.168l1.973,23.062h-36.326L187.001,203.303z M195.557,235.591h35.38l1.984,23.203h-30.904L195.557,235.591z M210.907,290.807     l-6.328-22.786h29.134l1.953,22.786H210.907z M279.083,290.807h-34.159l-1.953-22.786h38.056L279.083,290.807z M281.819,258.794     h-39.642l-1.983-23.203h43.61L281.819,258.794z M284.597,226.364H239.41l-1.973-23.062h49.133L284.597,226.364z M310.16,290.807     h-21.82l1.953-22.786h26.632L310.16,290.807z M319.661,258.794h-28.585l1.994-23.203h33.488L319.661,258.794z"
                      style={{ fill: "#484B4D" }}
                    />
                  </g>
                </g>
              </g>
              <g id="Layer_1" />
            </svg>
            <p className="text-md">Your Cart is empty</p>
            <Button variant="link">
              <Link className="mt-5 p-2 rounded-md" to="..\products">
                <p className="text-sm">Start Shopping</p>
              </Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-4 mt-5 mx-5">
            {/* Cart Items */}
            <div className="space-y-2 flex-1">
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
              orientation="vertical"
              className="h-auto hidden lg:block"
            />

            {/* Responsive Separator */}
            <Separator className="my-4 lg:hidden" />

            {/* Order Summary */}
            <div className="lg:w-1/3">
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
