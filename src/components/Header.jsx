import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import {
  Check,
  ChevronDown,
  ChevronRight,
  Home,
  MoveUpRight,
} from 'lucide-react';
import { BiCategoryAlt } from 'react-icons/bi';
import {
  GiDiamondRing,
  GiDropEarrings,
  GiGemChain,
  GiNecklaceDisplay,
} from 'react-icons/gi';
import SearchBar from './SearchBar';
import { UserAuthButton } from '../context/authContext';
import Cart from './SidebarCart';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

const Header = () => {
  const [open, setOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const location = useLocation();

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setOpen(true);
    }, 200);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150); // 150ms delay
  };

  // Ref to track timeouts and prevent conflicts
  const timeoutRef = useRef(null);

  // Keep menu items consistent to prevent useTrail recalculation issues
  const baseMenuItems = [
    { name: 'Home', icon: <Home className='size-5' />, path: '/' },
    {
      name: 'Catalogue',
      icon: <BiCategoryAlt className='size-5' />,
      path: '/collections',
    },
    { name: 'Shop by Category', isDropdown: true },
  ];

  const jewelryCategories = [
    { name: 'Earrings', icon: <GiDropEarrings />, path: '#' },
    { name: 'Chains', icon: <GiGemChain />, path: '#' },
    { name: 'Kada', icon: '', path: '#' },
    { name: 'Ring', icon: <GiDiamondRing />, path: '#' },
    { name: 'Necklace', icon: <GiNecklaceDisplay />, path: '#' },
    { name: 'Bracelet', path: '#' },
  ];

  const isActive = (path) => location.pathname === path;

  // Fixed toggle menu function with timeout cleanup
  const toggleMenu = useCallback(() => {
    // Prevent toggling if already animating
    if (isAnimating) return;

    setIsAnimating(true);

    // Clear any existing timeout to prevent conflicts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (!isMenuOpen) {
      setIsMenuOpen(true);
      // Reduced delay for better responsiveness
      timeoutRef.current = setTimeout(() => {
        setShowTrail(true);
        setIsAnimating(false);
        timeoutRef.current = null;
      }, 100);
    } else {
      setShowTrail(false);
      setIsDropdownOpen(false);
      // Shorter delay for closing
      timeoutRef.current = setTimeout(() => {
        setIsMenuOpen(false);
        setIsAnimating(false);
        timeoutRef.current = null;
      }, 150);
    }
  }, [isMenuOpen, isAnimating]);

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle scroll visibility
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Always show header when menu is open
      if (isMenuOpen) {
        setIsVisible(true);
        return;
      }

      // Show header when at top or scrolling up
      if (currentScrollY === 0) {
        setIsVisible(true);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, [lastScrollY, isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Close menu when route changes
  useEffect(() => {
    if (isMenuOpen) {
      toggleMenu();
    }
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMenuOpen) {
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen, toggleMenu]);

  // Close menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMenuOpen) {
        toggleMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isMenuOpen, toggleMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Spring animation for the overlay background
  const overlaySpring = useSpring({
    config: config.stiff,
    opacity: isMenuOpen ? 1 : 0,
    transform: isMenuOpen ? 'translateX(0px)' : 'translateX(30px)',
  });

  // Optimized trail animation for main menu items only
  const mainMenuTrail = useTrail(baseMenuItems.length, {
    config: {
      tension: 400,
      friction: 30,
    },
    opacity: showTrail ? 1 : 0,
    transform: showTrail ? 'translateX(0px)' : 'translateX(20px)',
  });

  // Replace dropdownSpring with dropdownTrail
  const dropdownTrail = useTrail(jewelryCategories.length, {
    config: { tension: 400, friction: 30 },
    opacity: open ? 1 : 0,
    transform: open ? 'translateX(0px)' : 'translateX(10px)',
    scale: open ? 1 : 0.95,
  });

  // Simplified submenu animation using useSpring instead of useTrail
  const subMenuSpring = useSpring({
    config: {
      tension: 400,
      friction: 30,
    },
    opacity: isDropdownOpen && showTrail ? 1 : 0,
    maxHeight: isDropdownOpen && showTrail ? '300px' : '0px',
    transform:
      isDropdownOpen && showTrail ? 'translateX(0px)' : 'translateX(20px)',
  });

  return (
    <>
      <header
        className={`sticky top-0 left-0 right-0 z-40 bg-white dark:bg-cornsilk-d1 transition-transform duration-300 ease-linear ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }
        ${
          isMenuOpen
            ? ''
            : 'border-b shadow border-stone-300 dark:border-stone-700'
        }`}
      >
        <nav className='max-w-screen-2xl mx-auto px-3 md:px-6'>
          <div className='flex items-center justify-between h-12'>
            {/* Mobile Layout */}
            <div className='flex items-center justify-between w-full px-1 sm:hidden'>
              {/* Mobile Brand */}
              <div className='flex-shrink-0'>
                <Link
                  to='/'
                  className='text-sm p-2 font-karla font-bold dark:text-cornsilk focus:outline-none'
                >
                  The Jeweller Bee Store
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className='flex items-center gap-2'>
                <SearchBar />
                <Cart />
                {/* Mobile Menu Button */}
                <animated.button
                  className='p-2.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 rounded-full transition-colors focus:outline-none'
                  aria-label='Toggle menu'
                  onClick={toggleMenu}
                  disabled={isAnimating}
                >
                  <div className='w-4 h-4 flex flex-col justify-center items-center'>
                    <span
                      className={`block h-0.5 bg-black dark:bg-white rounded-full transition-all duration-300 self-end ${
                        isMenuOpen ? '-rotate-45 w-4 translate-y-1.5' : 'w-2.5'
                      }`}
                    />
                    <span
                      className={`block w-4 h-0.5 bg-black dark:bg-white my-1 rounded-full transition-all duration-300 ${
                        isMenuOpen ? 'opacity-0' : ''
                      }`}
                    />
                    <span
                      className={`block h-0.5 bg-black dark:bg-white rounded-full transition-all duration-300 self-start ${
                        isMenuOpen ? 'rotate-45 w-4 -translate-y-1.5' : 'w-2.5'
                      }`}
                    />
                  </div>
                </animated.button>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className='hidden sm:flex items-center justify-between w-full'>
              {/* Desktop Brand */}
              <div className='flex-shrink-0'>
                <Link to='/' className='text-lg md:text-xl font-bold '>
                  The Jeweller Bee Store
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className='flex items-center gap-2'>
                <SearchBar />
                <NavLink
                  to='/collections'
                  className={({ isActive }) =>
                    `px-2.5 py-3 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4 ${
                      isActive
                        ? 'text-neutral-900 dark:text-cornsilk underline underline-offset-4'
                        : ''
                    }`
                  }
                >
                  Catalogue
                </NavLink>

                <DropdownMenu.Root
                  modal={false}
                  open={open}
                  onOpenChange={setOpen}
                >
                  <DropdownMenu.Trigger
                    className='px-2.5 py-3 hover:bg-neutral-200  dark:hover:bg-neutral-800 focus:outline-none'
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                  >
                    Shop By
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    {open && (
                      // Find and replace the DropdownMenu.Content section
                      <DropdownMenu.Content
                        className='min-w-[220px] bg-white dark:bg-[#1F2421] rounded-lg p-1 shadow-lg z-50'
                        sideOffset={5}
                        alignOffset={0}
                        align='center'
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        asChild
                      >
                        <div>
                          {dropdownTrail.map((style, index) => {
                            const item = jewelryCategories[index];
                            return (
                              <animated.div key={item.name} style={style}>
                                <DropdownMenu.Item>
                                  <NavLink
                                    to={item.path}
                                    className={`group inline-flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-stone-200 dark:hover:bg-neutral-700 focus:bg-gray-50 dark:focus:bg-neutral-700 rounded-md outline-none ${
                                      isActive(item.path)
                                        ? 'text-black dark:text-white underline underline-offset-8'
                                        : 'text-gray-600 dark:text-white/69 hover:text-gray-700 focus:text-gray-800 dark:hover:text-white hover:bg-gray-200'
                                    }`}
                                  >
                                    {item.name}
                                    {/* {item.icon} */}
                                    <MoveUpRight
                                      className={`size-4 hidden ml-auto ${
                                        isActive(item.path)
                                          ? 'group-hover:hidden'
                                          : 'group-hover:block group-focus:block'
                                      }`}
                                    />
                                    <Check
                                      className={`size-4 ml-auto ${
                                        isActive(item.path) ? 'block' : 'hidden'
                                      }`}
                                    />
                                  </NavLink>
                                </DropdownMenu.Item>
                              </animated.div>
                            );
                          })}
                        </div>
                      </DropdownMenu.Content>
                    )}
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>

                <Cart />
                <UserAuthButton />
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Full-Screen Menu Overlay */}
      {(isMenuOpen || overlaySpring.opacity.get() > 0) && (
        <animated.div
          style={{
            opacity: overlaySpring.opacity,
            transform: overlaySpring.transform,
            pointerEvents: isMenuOpen ? 'auto' : 'none',
          }}
          className='fixed inset-0 z-30 bg-black/75 top-12'
        >
          {/* Menu Content */}
          <div className='h-full flex flex-col bg-white dark:bg-cornsilk-d1'>
            {/* Navigation Content */}
            <div className='flex-1 overflow-y-auto'>
              <nav className=' w-full max-w-md'>
                <div className='space-y-6 p-5 '>
                  {mainMenuTrail.map((style, index) => {
                    const item = baseMenuItems[index];
                    if (!item) return null;

                    // Handle dropdown toggle item
                    if (item.isDropdown) {
                      return (
                        <animated.div key={`dropdown-${index}`} style={style}>
                          <button
                            onClick={toggleDropdown}
                            className={`flex items-center justify-between w-full focus:outline-none rounded-md transition-colors p-3 duration-300 group ${
                              isDropdownOpen
                                ? 'bg-black/5 dark:bg-white/5'
                                : 'hover:text-stone-600'
                            }`}
                          >
                            <span className='mr-2'>{item.name}</span>
                            <div className='w-4 h-4 flex flex-col justify-center items-center'>
                              <span
                                className={`block h-0.5 bg-black/50 dark:bg-white rounded-full transition-all duration-300 ${
                                  isDropdownOpen
                                    ? 'w-5 translate-y-0.5'
                                    : '-rotate-45 w-2.5 translate-x-1 translate-y-0.5'
                                }`}
                              />
                              <span
                                className={`block h-0.5 bg-black/50 dark:bg-white rounded-full transition-all duration-300 ${
                                  isDropdownOpen
                                    ? 'w-5'
                                    : 'rotate-45 w-2.5 -translate-x-0.5'
                                }`}
                              />
                            </div>
                          </button>
                        </animated.div>
                      );
                    }

                    // Handle regular menu items
                    return (
                      <animated.div key={`menuitem-${index}`} style={style}>
                        <NavLink
                          to={item.path}
                          className={`group inline-flex items-center gap-2 w-full px-3 py-3 rounded-md text-lg ${
                            isActive(item.path)
                              ? 'text-black dark:text-white underline underline-offset-8'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-stone-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:bg-gray-200 dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white'
                          }`}
                          onClick={toggleMenu}
                        >
                          {item.icon}
                          {item.name}
                          <MoveUpRight
                            className={`size-4 hidden ml-auto ${
                              isActive(item.path)
                                ? 'group-hover:hidden'
                                : 'group-hover:block group-focus:block'
                            }`}
                          />
                          <Check
                            className={`size-4 ml-auto ${
                              isActive(item.path) ? 'block' : 'hidden'
                            }`}
                          />
                        </NavLink>
                      </animated.div>
                    );
                  })}

                  {/* Submenu items with simplified spring animation */}
                  {isDropdownOpen && (
                    <animated.div
                      style={{
                        opacity: subMenuSpring.opacity,
                        maxHeight: subMenuSpring.maxHeight,
                        transform: subMenuSpring.transform,
                      }}
                      className='p-1'
                    >
                      {jewelryCategories.map((item, index) => (
                        <div key={`subitem-${index}`} className='p-1'>
                          <NavLink
                            to={item.path}
                            className={`group inline-flex items-center gap-2 w-full px-3 py-2 rounded-md hover:bg-stone-200 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 rounded-md ${
                              isActive(item.path)
                                ? 'text-black dark:text-white underline underline-offset-8'
                                : 'text-gray-600 dark:text-white/69 hover:text-gray-700 focus:text-gray-800 dark:hover:text-white hover:bg-gray-200'
                            }`}
                            onClick={toggleMenu}
                          >
                            {item.name}
                            {/* {item.icon} */}
                            <MoveUpRight
                              className={`size-4 hidden ml-auto ${
                                isActive(item.path)
                                  ? 'group-hover:hidden'
                                  : 'group-hover:block group-focus:block'
                              }`}
                            />
                            <Check
                              className={`size-4 ml-auto ${
                                isActive(item.path) ? 'block' : 'hidden'
                              }`}
                            />
                          </NavLink>
                        </div>
                      ))}
                    </animated.div>
                  )}
                </div>
              </nav>
            </div>

            {/* Bottom Section */}
            <div className='flex items-center justify-end px-2 py-4'>
              <div className='dark:text-white mr-2'>
                <UserAuthButton />
              </div>
            </div>
          </div>

          {/* Close on background click */}
          <div
            className='absolute inset-0 -z-10'
            onClick={toggleMenu}
            aria-label='Close menu'
          />
        </animated.div>
      )}
    </>
  );
};

export default Header;
