import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";
import { UserAuthButton } from "../context/authContext";

const MobileMenu = ({}) => {
  const { totalItems } = useCart();
  return (
    <>
      <div className="md:hidden z-9 sticky bottom-0 flex justify-between items-center p-2 bg-linear-to-tl from-cornsilk to-cornsilk-hover dark:from-cornsilk-d1 dark:to-cornsilk-d4">
        <Link
          to="/collections"
          className={
            "px-2.5 py-3.5 dark:hover:bg-zinc-700 focus:outline-hidden focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
          }
        >
          Catalogue
        </Link>
        <div className="flex items-center gap-2">
          <UserAuthButton />
          {/* <Link
            to="..\cart"
            className="relative md:hidden text-cornsilk-dark dark:text-cornsilk hover:bg-cornsilk-hover dark:hover:bg-zinc-600 p-2 rounded-full"
          >
            <MdOutlineShoppingBag size={23} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link> */}
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
