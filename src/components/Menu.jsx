import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { useSpring, animated, config } from '@react-spring/web';
import { X } from 'lucide-react';
import { UserAuthButton } from '../context/authContext';
import { TbMenu3 } from "react-icons/tb";

const Menu = ({ menuItems }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  // Handle closing animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 250);
  };

  // Handle opening
  const handleOpen = () => {
    setIsOpen(true);
    setIsClosing(false);
  };

  // Reset closing state when opening
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
    }
  }, [isOpen]);

  // Enhanced React Spring animations with better easing
  const overlayAnimation = useSpring({
    opacity: isOpen && !isClosing ? 1 : 0,
    config: {
      tension: 220,
      friction: 26,
      // Use different easing for opening vs closing
      easing: isClosing ? 'ease-in' : 'ease-out',
    },
  });

  const sidebarAnimation = useSpring({
    transform: isOpen && !isClosing ? 'translateX(0%)' : 'translateX(100%)',
    config: config.stiff,
  });

  // Enhanced content animation for smooth fade
  // const contentAnimation = useSpring({
  //   opacity: isOpen && !isClosing ? 1 : 0,
  //   transform: isOpen && !isClosing ? 'translateY(0px)' : 'translateY(-10px)',
  //   config: config.gentle,
  // });

  return (
    <>
      {/* Menu Button */}
      <button
        className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'
        aria-label='Open menu'
        onClick={handleOpen}
      >
        <TbMenu3 className='h-5 w-5 text-gray-700 dark:text-gray-300' />
      </button>

      {/* Sidebar Dialog */}
      <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      {isOpen && (
        <Dialog.Portal>
          <Dialog.Overlay asChild>
            <animated.div 
              style={overlayAnimation}
              className='fixed inset-0 bg-black/50 z-50'
            />
          </Dialog.Overlay>
          <Dialog.Content asChild>
            <animated.div
              style={sidebarAnimation}
              className='fixed rounded-l-md right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-lg z-50'
            >
              <animated.div  className='flex flex-col h-full'>
                {/* Header */}
                <div className='flex items-center justify-between p-3 border-b dark:border-gray-700'>
                  <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
                    The Jeweler Bee
                  </h2>
                  <Dialog.Close asChild>
                    <button
                      className='p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors'
                      aria-label='Close menu'
                      onClick={handleClose}
                    >
                      <X className='h-5 w-5 text-gray-700 dark:text-gray-300' />
                    </button>
                  </Dialog.Close>
                </div>

                {/* Navigation Links */}
                <nav className='flex-1 px-2 py-3 space-y-2'>
                  {menuItems.map((item, index) => (
                    <Link
                      key={`${item.name}-${index}`}
                      to={item.path}
                      className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${
                        isActive(item.path)
                          ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                      }`}
                      onClick={handleClose}
                    >
                      {item.name}
                    </Link>
                  ))}
                </nav>

                {/* Bottom Section */}
                <div className='p-4 border-t dark:border-gray-700'>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-end'>
                      <UserAuthButton />
                    </div>
                  </div>
                </div>
              </animated.div>
            </animated.div>
          </Dialog.Content>
        </Dialog.Portal>
      )}
    </Dialog.Root>
    </>
  );
};

export default Menu;
