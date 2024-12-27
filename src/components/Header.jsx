import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  MenuOutlined,
  CloseOutlined,
  ProductOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { DarkModeToggle } from "../DarkModeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { useAdminAuth } from "../context/AdminAuthContext";
import { MdShoppingBag } from "react-icons/md";
import { useCart } from "./CartContext";
import { MenuSquare, Search, X } from "lucide-react";
import SearchBar from "./SearchBar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";

const Header = () => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { isAdmin, logoutAdmin } = useAdminAuth();
  const mobileMenuRef = useRef(null);

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

  const linkBaseStyle = "";
  const activeLinkStyle =
    "text-neutral-900 dark:text-neutral-100 underline underline-offset-4";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
  };

  const MobileSearch = () => (
    <Popover open={isSearchOpen} onOpenChange={setIsSearchOpen}>
      <PopoverTrigger asChild>
        <button
          className="p-2 hover:bg-cornsilk-hover dark:hover:bg-neutral-700 rounded-full transition-transform duration-200"
          aria-label={isSearchOpen ? "Close search" : "Open search"}
        >
          {isSearchOpen ? <X size={20} /> : <Search size={20} />}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-fit p-0.5 rounded-lg" align={"end"}>
        <SearchBar />
      </PopoverContent>
    </Popover>
  );

  const NavLinks = ({ isMobile = false }) => (
    <>
      <NavLink
        to="/products"
        className={({ isActive }) =>
          `${linkBaseStyle} ${isActive ? activeLinkStyle : ""} ${
            isMobile
              ? "block px-4 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 flex items-center justify-between hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
              : "px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-700 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-neutral-600 dark:text-neutral-300 dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
          }`
        }
        onClick={isMobile ? toggleMobileMenu : undefined}
      >
        Products
        <ProductOutlined
          className="md:hidden ml-2"
          style={{ fontSize: "20px" }}
        />
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
    <header className="max-sm:sticky max-sm:top-0 max-sm:inset-x-0 z-10 border-b-2 dark:border-stone-500 max-md:py-1 max-md:px-2 max-md:pr-3 md:flex md:justify-between md:items-center font-inter w-full bg-cornsilk dark:bg-zinc-800 relative">
      <a
        href="/"
        className="hidden md:block py-1 focus:outline-none font-karla font-bold dark:text-neutral-100"
      >
        <h2 className="max-xl:text-xl max-md:text-sm p-2 pl-4">
          The Jeweller Bee Store
        </h2>
      </a>

      <nav className="hidden md:flex items-center">
        <div className="md:flex items-center space-x-1">
          <SearchBar />
          <NavLinks />
        </div>
        {!isAdmin && (
          <div className="inline-flex space-x-2 mr-2">
            <DarkModeToggle />
          </div>
        )}
      </nav>

      <div
        className="md:hidden flex justify-between items-center relative"
        ref={mobileMenuRef}
      >
        <div className="flex gap-1 items-center">
          <button
            onClick={toggleMobileMenu}
            className="relative h-8 w-8 rounded-md focus:outline-none"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="sr-only">
              {isMobileMenuOpen ? "Close menu" : "Open menu"}
            </span>

            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                isMobileMenuOpen
                  ? "rotate-45 opacity-0 scale-0"
                  : "rotate-0 opacity-100 scale-100"
              }`}
            >
              <MenuSquare className="text-neutral-700 dark:text-neutral-200" />
            </span>

            <span
              className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${
                isMobileMenuOpen
                  ? "rotate-0 opacity-100 scale-100"
                  : "-rotate-45 opacity-0 scale-0"
              }`}
            >
              <CloseOutlined className="text-neutral-700 dark:text-neutral-200" />
            </span>
          </button>
          <a
            href="/"
            className="py-1 focus:outline-none font-karla font-bold dark:text-neutral-100"
          >
            <h2 className="max-xl:text-xl max-md:text-sm p-2">
              The Jeweller Bee Store
            </h2>
          </a>
        </div>

        <div className="flex items-center">
          <MobileSearch />

          <Link
            to="..\cart"
            className="relative md:hidden hover:bg-cornsilk-hover p-2 rounded-full"
          >
            <MdShoppingBag size={23} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>

        <div
          className={`absolute top-full left-0 mt-2 w-56 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 transition-all duration-75 ease-in-out ${
            isMobileMenuOpen
              ? "opacity-100 origin-top-left scale-1"
              : "opacity-25 origin-top-left scale-0"
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
