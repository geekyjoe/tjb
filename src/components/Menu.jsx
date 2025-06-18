import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSpring, useTrail, animated, config } from '@react-spring/web';
import { X, ChevronDown, ChevronRight } from 'lucide-react';
import { UserAuthButton } from '../context/authContext';
import { TbMenu3 } from 'react-icons/tb';

const Menu = ({ onMenuToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    { name: 'Shop From', path: '#', isDropdown: true },
    ...(isDropdownOpen
      ? jewelryCategories.map((cat) => ({ ...cat, isSubItem: true }))
      : []),
  ];

  const isActive = (path) => location.pathname === path;

  // Toggle menu function similar to Header
  const toggleMenu = () => {
    if (!isOpen) {
      setIsOpen(true);
      // Notify parent component that menu is opening
      onMenuToggle?.(true);
      // Start trail animation after background appears (200ms delay)
      setTimeout(() => {
        setShowTrail(true);
      }, 200);
    } else {
      setShowTrail(false);
      setIsDropdownOpen(false);
      // Close menu after trail disappears
      setTimeout(() => {
        setIsOpen(false);
        // Notify parent component that menu is closed
        onMenuToggle?.(false);
      }, 200);
    }
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Prevent body scroll when menu is open (from Header)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu when route changes
  useEffect(() => {
    if (isOpen) {
      toggleMenu();
    }
  }, [location.pathname]);

  // Close menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleMenu();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  // Close menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        toggleMenu();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  // Spring animation for the overlay background (same as Header)
  const overlaySpring = useSpring({
    config: config.slow,
    opacity: isOpen ? 1 : 0,
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
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

  return (
    <>
      {/* Menu Button */}
      <animated.button
        className='p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors focus:outline-none'
        aria-label='Toggle menu'
        onClick={toggleMenu}
      >
        {/* <TbMenu3 className='h-5 w-5 text-gray-700 dark:text-gray-300' /> */}
        <div className='w-4 h-4 flex flex-col justify-center items-center'>
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 self-end ${
              isOpen ? '-rotate-45 w-4 translate-y-1.5' : 'w-2.5'
            }`}
          />
          <span
            className={`block w-4 h-0.5 bg-white my-1 rounded-full transition-all duration-300 ${
              isOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block h-0.5 bg-white rounded-full transition-all duration-300 self-start ${
              isOpen ? 'rotate-45 w-4 -translate-y-1.5' : 'w-2.5'
            }`}
          />
        </div>
      </animated.button>

      {/* Full-Screen Menu Overlay (same structure as Header) */}
      {(isOpen || overlaySpring.opacity.get() > 0) && (
        <animated.div
          style={{
            opacity: overlaySpring.opacity,
            transform: overlaySpring.transform,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          className='fixed h-screen inset-0 z-30 bg-black/75 overflow-y-auto'
        >
          {/* Menu Content */}
          <div className='relative h-full top-12 flex flex-col p-5'>
            {/* Navigation Content */}
            <div className='flex-1'>
              <nav className=' w-full max-w-md'>
                <div className='space-y-6 p-5'>
                  {trail.map((style, index) => {
                    const item = allMenuItems[index];
                    if (!item) return null;

                    // Handle dropdown toggle item
                    if (item.isDropdown) {
                      return (
                        <animated.div key={`dropdown-${index}`} style={style}>
                          <button
                            onClick={toggleDropdown}
                            className='flex items-center justify-start w-full text-4xl md:text-5xl font-light text-white hover:text-gray-300 transition-colors duration-300 group'
                          >
                            <span className='mr-2'>{item.name}</span>
                            {isDropdownOpen ? (
                              <ChevronDown className='h-8 w-8 group-hover:scale-110 transition-transform' />
                            ) : (
                              <ChevronRight className='h-8 w-8 group-hover:scale-110 transition-transform' />
                            )}
                          </button>
                        </animated.div>
                      );
                    }

                    // Handle sub-items (dropdown content)
                    if (item.isSubItem) {
                      return (
                        <animated.div key={`subitem-${index}`} style={style}>
                          <NavLink
                            to={item.path}
                            className={`block text-2xl md:text-3xl font-light transition-colors duration-300 py-2 ${
                              isActive(item.path)
                                ? 'text-white underline underline-offset-8'
                                : 'text-gray-300 hover:text-white'
                            }`}
                            onClick={toggleMenu}
                          >
                            {item.name}
                          </NavLink>
                        </animated.div>
                      );
                    }

                    // Handle regular menu items
                    return (
                      <animated.div key={`menuitem-${index}`} style={style}>
                        <NavLink
                          to={item.path}
                          className={`block text-4xl md:text-5xl font-light transition-colors duration-300 hover:scale-105 transform ${
                            isActive(item.path)
                              ? 'text-white underline underline-offset-8'
                              : 'text-gray-200 hover:text-white'
                          }`}
                          onClick={toggleMenu}
                        >
                          {item.name}
                        </NavLink>
                      </animated.div>
                    );
                  })}
                </div>
              </nav>
            </div>

            {/* Bottom Section */}
            <div className='p-6 border-t border-white/10'>
              <div className='flex items-center justify-center'>
                <div className='text-white'>
                  <UserAuthButton />
                </div>
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

export default Menu;