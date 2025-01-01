import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ProductOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { X } from "lucide-react";
import { DarkModeToggle } from "../DarkModeToggle";
import ProfileDropdown from "./ProfileDropdown";

const MobileMenu = ({ isOpen, onClose, isAdmin, logoutAdmin }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayOpacity, setOverlayOpacity] = useState(false);
  const [menuOpacity, setMenuOpacity] = useState(false);

  // Handle menu visibility and animations
  useEffect(() => {
    if (isOpen) {
      // Opening sequence
      setShowOverlay(true);
      // Trigger opacity transitions after elements are mounted
      setTimeout(() => {
        setMenuOpacity(true);
        setOverlayOpacity(true);
      }, 10);
    } else {
      // Closing sequence
      setMenuOpacity(false);
      setOverlayOpacity(false);
      // Remove elements after transition
      setTimeout(() => {
        setShowOverlay(false);
      }, 300);
    }
  }, [isOpen]);

  // Handle body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ease-in-out
            ${overlayOpacity ? "opacity-100" : "opacity-0"}`}
          onClick={onClose}
        />
      )}

      {/* Menu */}
      <div
        className={`fixed inset-2 bg-white dark:bg-neutral-800 transform-gpu z-50 
            transition-all duration-200 ease-in-out
            ${menuOpacity ? "translate-x-0" : "-translate-x-full invisible	"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center flex-row-reverse justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
            <h2 className="font-jost text-xl text-sm p-2">
              The Jeweller Bee Store
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-neutral-900 dark:text-neutral-100" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto">
            <NavLink
              to="/products"
              className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline hover:decoration-solid hover:underline-offset-4"
              onClick={onClose}
            >
              Products
              <ProductOutlined className="text-xl" />
            </NavLink>

            <NavLink
              to="/cart"
              className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between hover:text-neutral-900 dark:hover:text-neutral-100 hover:underline hover:decoration-solid hover:underline-offset-4"
              onClick={onClose}
            >
              Cart
              <ShoppingCartOutlined className="text-xl" />
            </NavLink>

            {isAdmin && (
              <div className="px-6 py-4 border-b border-neutral-100 dark:border-neutral-700">
                <ProfileDropdown />
                <button
                  onClick={() => {
                    logoutAdmin();
                    onClose();
                  }}
                  className="mt-4 w-full py-2 px-4 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </nav>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center justify-end">
              <DarkModeToggle />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileMenu;
