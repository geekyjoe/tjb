import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MenuOutlined,
  CloseOutlined,
  ProductOutlined,
} from "@ant-design/icons";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { DarkModeToggle } from "../DarkModeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { useAdminAuth } from "../context/AdminAuthContext";
import { MdShoppingBag } from "react-icons/md";
import { useCart } from "./CartContext";
import { MenuSquare } from "lucide-react";

const Header = () => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAdmin, logoutAdmin } = useAdminAuth();
  const mobileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Shared link styling
  const linkBaseStyle = "";
  const activeLinkStyle =
    "text-neutral-900 dark:text-neutral-100 underline underline-offset-4";

  // Mobile menu toggle handler
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Render navigation links
  const NavLinks = ({ isMobile = false }) => (
    <>
      <NavLink
        to="/products"
        className={({ isActive }) =>
          `${linkBaseStyle} ${isActive ? activeLinkStyle : ""} ${
            isMobile
              ? "block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between"
              : "px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-700 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
          }`
        }
        onClick={isMobile ? toggleMobileMenu : undefined}
      >
        <ProductOutlined
          className="md:hidden ml-2"
          style={{ fontSize: "20px" }}
        />
        Products
      </NavLink>
      <NavLink
        to="/cart"
        className={({ isActive }) =>
          `${linkBaseStyle} ${isActive ? activeLinkStyle : ""} ${
            isMobile
              ? "hidden px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between"
              : "px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-700 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
          }`
        }
        onClick={isMobile ? toggleMobileMenu : undefined}
      >
        <ShoppingCartOutlined
          className="md:hidden ml-2"
          style={{ fontSize: "20px" }}
        />
        Cart
      </NavLink>
      {isAdmin && (
        <div
          className={`${
            isMobile
              ? "block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              : "inline-flex space-x-2"
          }`}
        >
          <ProfileDropdown />
          <button
            onClick={
              isMobile
                ? () => {
                    logoutAdmin();
                    toggleMobileMenu();
                  }
                : logoutAdmin
            }
            className="text-red-500"
          >
            Logout
          </button>
        </div>
      )}
      {isMobile && (
        <div className="block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700">
          <DarkModeToggle />
        </div>
      )}
    </>
  );

  return (
    <header className="max-md:py-1 max-md:px-2 max-md:pr-3 inline-flex justify-between items-center font-inter w-full bg-cornsilk dark:bg-zinc-800 relative">
      {/* Logo */}
      <a href="/" className="py-1 font-karla font-bold dark:text-neutral-100">
        <h2 className="max-xl:text-xl max-md:text-sm p-2">
          The JewellerBee Store
        </h2>
      </a>

      {/* Desktop Navigation */}
      <nav className="hidden md:flex items-center">
        <div className="md:flex items-center space-x-1">
          <NavLinks />
        </div>
        {!isAdmin && (
          <div className="inline-flex space-x-2 mr-2">
            <DarkModeToggle />
          </div>
        )}
      </nav>

      {/* Mobile Menu Container */}
      <div className="md:hidden flex relative" ref={mobileMenuRef}>
        {/* Mobile Menu Toggle with Animation */}
        <button
          onClick={toggleMobileMenu}
          className="flex focus:outline-none relative w-6 h-6"
        >
          {/* Menu Icon */}
          <span
            className={`absolute inset-0 transition-all duration-150 ease-in-out ${
              isMobileMenuOpen
                ? "rotate-45 opacity-0 scale-0"
                : "rotate-0 opacity-100 scale-100"
            }`}
          >
            <MenuSquare />
          </span>

          {/* Close Icon */}
          <span
            className={`absolute inset-0 transition-all duration-150 ease-in-out ${
              isMobileMenuOpen
                ? "rotate-0 opacity-100 scale-100"
                : "-rotate-45 opacity-0 scale-0"
            }`}
          >
            <CloseOutlined />
          </span>
        </button>
        <Link to="..\cart" className="ml-2 relative md:hidden">
          <MdShoppingBag size={23} />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        {/* Mobile Dropdown Menu */}
        <div
          className={`absolute top-full right-0 mt-2 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 transition-all duration-75 ease-in-out ${
            isMobileMenuOpen
              ? "opacity-100 origin-top-right scale-1"
              : "opacity-25 origin-top-right scale-0"
          }`}
        >
          {isMobileMenuOpen && (
            <div className="flex flex-col py-1 space-y-1">
              <NavLinks isMobile={true} />
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
