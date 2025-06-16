import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from '@heroui/navbar';
import SearchBar from './SearchBar';
import { UserAuthButton } from '../context/authContext';
import Cart from './SidebarCart';
import Menu from './Menu';

const Header = () => {
  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue', path: '/collections' },
  ];

  const isActive = (path) => window.location.pathname === path;

  return (
    <Navbar
      className='sticky top-0 inset-x-0 z-5 bg-white/75 border-b-2 dark:border-white/20 backdrop-blur-sm dark:bg-cornsilk-d1 py-1.5'
      maxWidth='full'
      shouldHideOnScroll
    >
      {/* Mobile Brand */}
      <NavbarContent className='sm:hidden' justify='center'>
        <NavbarBrand>
          <Link
            to='/'
            className='font-karla font-bold dark:text-cornsilk focus:outline-none'
          >
            <h2 className='text-sm p-1'>The Jeweller Bee Store</h2>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Mobile actions */}
      <NavbarContent className='sm:hidden w-auto gap-0.5' justify='end'>
        <NavbarItem>
          <SearchBar />
        </NavbarItem>
        <NavbarItem>
          <Cart />
        </NavbarItem>
        <NavbarItem>
          <Menu
            menuItems={menuItems}
            isActive={isActive}
          />
        </NavbarItem>
      </NavbarContent>

      {/* Desktop Brand */}
      <NavbarContent className='hidden sm:flex' justify='start'>
        <NavbarBrand>
          <Link
            to='/'
            className='font-karla font-bold dark:text-cornsilk focus:outline-none'
          >
            <h2 className='max-xl:text-xl p-1'>The Jeweller Bee Store</h2>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Desktop Navigation */}
      <NavbarContent className='hidden sm:flex gap-2' justify='end'>
        <NavbarItem>
          <SearchBar />
        </NavbarItem>
        <NavbarItem>
          <NavLink
            to='/collections'
            className={({ isActive }) =>
              `px-2.5 py-3.5 hover:bg-cornsilk-hover dark:hover:bg-zinc-800 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4 ${
                isActive
                  ? 'text-neutral-900 dark:text-cornsilk underline underline-offset-4'
                  : ''
              }`
            }
          >
            Catalogue
          </NavLink>
        </NavbarItem>
        <NavbarItem>
          <Cart />
        </NavbarItem>
        <NavbarItem className='inline-flex'>
          <UserAuthButton />
        </NavbarItem>
      </NavbarContent>

      {/* Mobile Sidebar - removed since it's now self-contained */}
    </Navbar>
  );
};

export default Header;