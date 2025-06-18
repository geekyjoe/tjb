import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SearchBar from './SearchBar';
import { UserAuthButton } from '../context/authContext';
import Cart from './SidebarCart';

const Header = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTrail, setShowTrail] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const location = useLocation();

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Catalogue', path: '/collections' },
  ];

  const jewelryCategories = [
    { name: 'Earrings', path: '#' },
    { name: 'Chains', path: '#' },
    { name: 'Kada', path: '#' },
    { name: 'Ring', path: '#' },
    { name: 'Necklace', path: '#' },
    { name: 'Bracelet', path: '#' },
  ];

  // Combine menu items and categories for trail animation
  const allMenuItems = [
    ...menuItems,
    { name: 'Shop by Category', path: '#', isDropdown: true },
    ...(isDropdownOpen
      ? jewelryCategories.map((cat) => ({ ...cat, isSubItem: true }))
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  // Toggle menu function
  const toggleMenu = () => {
    if (!isMenuOpen) {
      setIsMenuOpen(true);
      // Start trail animation after background appears (200ms delay)
      setTimeout(() => {
        setShowTrail(true);
      }, );
    } else {
      setShowTrail(false);
      setIsDropdownOpen(false);
      // Close menu after trail disappears
      setTimeout(() => {
        setIsMenuOpen(false);
      }, );
    }
  };

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
  }, [isMenuOpen]);

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
  }, [isMenuOpen]);

  // Spring animation for the overlay background
  const overlaySpring = useSpring({
    config: config.stiff,
    opacity: isMenuOpen ? 1 : 0,
    transform: isMenuOpen ? 'scale(1)' : 'scale(0.95)',
  });

  // Trail animation for menu items
  const trail = useTrail(allMenuItems.length, {
    config: {
      tension: 300,
      friction: 30,
      delay: showTrail ? 100 : 0,
    },
    opacity: showTrail ? 1 : 0,
    transform: showTrail ? 'translateX(0px)' : 'translateX(30px)',
    from: { opacity: 0, transform: 'translateX(30px)' },
    delay: showTrail ? 0 : 0,
  });
  // Trail animation specifically for submenu items
  const subMenuTrail = useTrail(jewelryCategories.length, {
    config: {
      tension: 400,
      friction: 25,
    },
    opacity: isDropdownOpen && showTrail ? 1 : 0,
    transform:
      isDropdownOpen && showTrail ? 'translateX(0px)' : 'translateX(20px)',
    height: isDropdownOpen && showTrail ? 'auto' : '0px',
    from: { opacity: 0, transform: 'translateX(20px)', height: '0px' },
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
            <div className='flex items-center justify-between w-full px-2 md:hidden'>
              {/* Mobile Brand */}
              <div className='flex-shrink-0'>
                <Link
                  to='/'
                  className='text-sm font-karla font-bold dark:text-cornsilk focus:outline-none'
                >
                  The Jeweller Bee Store
                </Link>
              </div>

              {/* Mobile Actions */}
              <div className='flex items-center'>
                <SearchBar />
                <Cart />
                {/* Mobile Menu Button */}
                <animated.button
                  className='p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none'
                  aria-label='Toggle menu'
                  onClick={toggleMenu}
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
            <div className='hidden md:flex items-center justify-between w-full'>
              {/* Desktop Brand */}
              <div className='flex-shrink-0'>
                <Link to='/' className='text-xl font-bold '>
                  The Jeweller Bee Store
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className='flex items-center gap-2'>
                <SearchBar />
                <NavLink
                  to='/collections'
                  className={({ isActive }) =>
                    `px-2.5 py-3 hover:bg-cornsilk-hover dark:hover:bg-gray-800 focus:outline-none focus:underline focus:decoration-solid focus:underline-offset-4 text-cornsilk-dark dark:text-cornsilk dark:hover:text-neutral-100 hover:text-neutral-900 hover:underline hover:decoration-solid hover:underline-offset-4 ${
                      isActive
                        ? 'text-neutral-900 dark:text-cornsilk underline underline-offset-4'
                        : ''
                    }`
                  }
                >
                  Catalogue
                </NavLink>
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
                <div className='space-y-6 p-5 overflow-x-hidden'>
                  {trail.map((style, index) => {
                    const item = allMenuItems[index];
                    if (!item) return null;

                    // Handle dropdown toggle item
                    if (item.isDropdown) {
                      return (
                        <animated.div key={`dropdown-${index}`} style={style}>
                          <button
                            onClick={toggleDropdown}
                            className={`flex items-center justify-between w-full focus:outline-none rounded-md transition-colors p-3 duration-300 group ${
                              isDropdownOpen && 'bg-black/5'
                            }`}
                          >
                            <span className='mr-2'>{item.name}</span>
                            <div className='w-4 h-4 flex flex-col justify-center items-center'>
                              <span
                                className={`block h-0.5 bg-black/75 dark:bg-white rounded-full transition-all duration-300 ${
                                  isDropdownOpen
                                    ? 'w-5 translate-y-0.5'
                                    : '-rotate-45 w-2.5 translate-x-1 translate-y-0.5'
                                }`}
                              />
                              <span
                                className={`block h-0.5 bg-black/75 dark:bg-white rounded-full transition-all duration-300 ${
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

                    // Handle sub-items (dropdown content) - only show non-dropdown items first
                    if (item.isSubItem) {
                      return null; // We'll handle these separately below
                    }

                    // Handle regular menu items
                    return (
                      <animated.div key={`menuitem-${index}`} style={style}>
                        <NavLink
                          to={item.path}
                          className={`block px-3 py-3 rounded-md text-lg transition-colors ${
                            isActive(item.path)
                              ? 'text-black dark:text-white underline underline-offset-8'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white focus:bg-gray-200 dark:focus:bg-gray-800 focus:text-gray-900 dark:focus:text-white'
                          }`}
                          onClick={toggleMenu}
                        >
                          {item.name}
                        </NavLink>
                      </animated.div>
                    );
                  })}

                  {/* Submenu items with separate trail animation */}
                  <div className='ml-4'>
                    {subMenuTrail.map((style, index) => {
                      const item = jewelryCategories[index];
                      if (!item) return null;

                      return (
                        <animated.div
                          key={`subitem-${index}`}
                          style={style}
                          className='overflow-hidden'
                        >
                          <NavLink
                            to={item.path}
                            className={`block px-3 py-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 focus:bg-gray-50 dark:focus:bg-gray-800 rounded-md transition-colors ${
                              isActive(item.path)
                                ? 'text-white underline underline-offset-8'
                                : 'text-gray-600 hover:text-gray-700 focus:text-gray-800 dark:hover:text-white hover:bg-gray-200'
                            }`}
                            onClick={toggleMenu}
                          >
                            {item.name}
                          </NavLink>
                        </animated.div>
                      );
                    })}
                  </div>
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
