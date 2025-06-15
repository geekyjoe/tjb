import React, { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import SearchBar from "./SearchBar";
import { UserAuthButton } from "../context/authContext";
import Cart from "./SidebarCart";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Navbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      className="sticky top-0 inset-x-0 bg-white/75 backdrop-blur-sm dark:bg-cornsilk-d1 py-1.5"
      maxWidth="full"
      shouldHideOnScroll
      isBordered
    >
      {/* Mobile menu toggle */}
      {/* <NavbarContent className="md:hidden" justify="start">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="md:hidden"
        />
      </NavbarContent> */}

      {/* Mobile Brand */}
      <NavbarContent className="md:hidden">
        <NavbarBrand>
          <Link
            to="/"
            className="font-karla font-bold dark:text-cornsilk focus:outline-none"
          >
            <h2 className="text-sm p-1">The Jeweller Bee Store</h2>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Mobile actions */}
      <NavbarContent className="md:hidden">
        <NavbarItem>
          <SearchBar />
        </NavbarItem>
        <NavbarItem>
          <Cart />
        </NavbarItem>
      </NavbarContent>

      {/* Desktop Brand */}
      <NavbarContent className="hidden md:flex" justify="start">
        <NavbarBrand>
          <Link
            to="/"
            className="font-karla font-bold dark:text-cornsilk focus:outline-none"
          >
            <h2 className="max-xl:text-xl p-1">
              The Jeweller Bee Store
            </h2>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className="hidden md:flex gap-2">
        <NavbarItem>
          <SearchBar />
        </NavbarItem>
        <NavbarItem>
          <NavLink
            to="/collections"
            className={({ isActive }) =>
              `px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-800 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4 ${
                isActive
                  ? "text-neutral-900 dark:text-cornsilk underline underline-offset-4"
                  : ""
              }`
            }
          >
            Catalogue
          </NavLink>
        </NavbarItem>
        <NavbarItem>
          <Cart />
        </NavbarItem>
        <NavbarItem className="inline-flex">
          <UserAuthButton />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Menu */}
      {/* <NavbarMenu className="pt-6">
        {menuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              to={item.path}
              className={`w-full text-lg ${
                isActive(item.path)
                  ? "text-neutral-900 dark:text-cornsilk font-semibold"
                  : "text-cornsilk-dark dark:text-cornsilk"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <UserAuthButton />
          </div>
        </NavbarMenuItem>
      </NavbarMenu> */}
    </Navbar>
  );
};

export default Header;