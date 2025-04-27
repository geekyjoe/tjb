import React, { useState, useRef, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { ProductOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { ThemeToggle } from "../ThemeToggle";
import { MdOutlineShoppingBag } from "react-icons/md";
import { useCart } from "./CartContext";
import { LogIn, Search, X } from "lucide-react";
import SearchBar from "./SearchBar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { TbMenu } from "react-icons/tb";
import MobileMenu from "./MobileMenu";
import { UserAuthButton } from "../services/authContext";
import Tooltip from "./ui/Tooltip";

const Header = () => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
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
    "text-neutral-900 dark:text-cornsilk underline underline-offset-4";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    setIsSearchOpen(false);
  };

  return (
    <header className="max-sm:sticky max-sm:top-0 max-sm:inset-x-0 z-10 max-md:py-1 max-md:px-2 max-md:pr-3 md:flex md:justify-between md:items-center font-inter w-full bg-cornsilk dark:bg-cornsilk-d1 relative">
      <a
        href="/"
        className="hidden md:block py-1 focus:outline-hidden font-karla font-bold dark:text-cornsilk"
      >
        <h2 className="max-xl:text-xl max-md:text-sm p-2 pl-4">
          The Jeweller Bee Store
        </h2>
      </a>

      <div className="hidden md:flex items-center gap-2 mr-3">
        <SearchBar />
        <NavLink
          to="/collections"
          className={
            "px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-700 focus:outline-hidden focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4"
          }
        >
          Catalogue
        </NavLink>
        <Link
          to="..\cart"
          className="relative text-cornsilk-dark hover:bg-cornsilk-hover dark:hover:bg-zinc-600 p-2 rounded-full"
        >
          <MdOutlineShoppingBag size={23} />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
        <div className="inline-flex mr-2">
          <UserAuthButton />
        </div>
        <div className="hover:bg-cornsilk-hover rounded-full">
          <Tooltip content="Toggle Theme">
            <ThemeToggle />
          </Tooltip>
        </div>
      </div>

      <div
        className="md:hidden flex justify-between items-center relative"
        ref={mobileMenuRef}
      >
        <div className="flex items-center">
          <a
            href="/"
            className="py-1 focus:outline-hidden font-karla font-bold dark:text-cornsilk"
          >
            <h2 className="max-xl:text-xl max-md:text-sm p-2">
              The Jeweller Bee Store
            </h2>
          </a>
        </div>

        <div className="flex items-center gap-2">
          <SearchBar />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
