import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ProductOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ThemeToggle } from "../ThemeToggle";
import ProfileDropdown from "./ProfileDropdown";
import { useAdminAuth } from "../context/AdminAuthContext";
import { MdOutlineShoppingBag } from "react-icons/md";
import { useCart } from "./CartContext";
import { Search, X } from "lucide-react";
import SearchBar from "./SearchBar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { TbMenu } from "react-icons/tb";
import MobileMenu from "./MobileMenu";
import AuthButton from "../auth/LoginButton";

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

      <div className="hidden md:flex items-center space-x-1">
        <SearchBar />
        <NavLinks />
      </div>
      <nav className="hidden md:flex items-center">
        <AuthButton />
        {!isAdmin && (
          <div className="inline-flex space-x-2 mr-2">
            <ThemeToggle />
          </div>
        )}
      </nav>

      <div
        className="md:hidden flex justify-between items-center relative"
        ref={mobileMenuRef}
      >
        <div className="flex items-center">
          <button
            onClick={toggleMobileMenu}
            className="p-1.5 rounded-full focus:outline-none dark:hover:bg-neutral-700"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <TbMenu
              size={24}
              className="text-neutral-700 dark:text-neutral-200"
            />
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
            className="relative md:hidden hover:bg-cornsilk-hover dark:hover:bg-zinc-600 p-2 rounded-full"
          >
            <MdOutlineShoppingBag size={23} />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
        <MobileMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          isAdmin={isAdmin}
          logoutAdmin={logoutAdmin}
        />
      </div>
    </header>
  );
};

export default Header;
