import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { useTrail, animated, useSpring, config } from '@react-spring/web';
import { searchProducts } from '../api/api';
import { Button } from './ui/button';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [open, setOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // React Spring animations
  const searchBarSpring = useSpring({
    width: open ? 'auto' : '0px',
    opacity: open ? 1 : 0,
    transform: open ? 'translateX(-10px)' : 'translateX(10px)',
    transformOrigin: 'right center',
    config: config.gentle,
  });

  const mobileSearchSpring = useSpring({
    opacity: open ? 1 : 0.5,
    transform: open ? 'translateY(0px)' : 'translateY(-20px)',
    config: config.gentle,
  });

  const resultsSpring = useSpring({
    opacity: showResults && query.length > 0 ? 1 : 0,
    transform:
      showResults && query.length > 0 ? 'translateY(0px)' : 'translateY(-10px)',
    config: { tension: 200, friction: 20 },
  });

  const trail = useTrail(results.length, {
    from: { opacity: 0, transform: 'translateX(-20px)' },
    to: {
      opacity: showResults && !isSearching ? 1 : 0,
      transform:
        showResults && !isSearching ? 'translateX(0px)' : 'translateX(-20px)',
    },
    config: config.gentle,
    delay: 50,
  });

  const handleSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchResults = await searchProducts(searchQuery);
      setResults(searchResults.slice(0, 8));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore if search is not open
      if (!open) return;

      // Check if the click is outside search component
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
        // Smooth closing animation when clicking outside
        setTimeout(() => {
          setQuery('');
          setOpen(false);
        }, 200);
      }
    };

    const handleResize = () => {
      if (open) {
        setShowResults(false);
        setTimeout(() => {
          setQuery('');
          setOpen(false);
        }, 200);
      }
    };

    // Handle both mouse and touch events
    const events = ['mousedown', 'touchstart'];

    events.forEach((event) => {
      document.addEventListener(event, handleClickOutside, { passive: true });
    });

    window.addEventListener('resize', handleResize);

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleClickOutside);
      });
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
    setShowResults(true);
  };

  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowResults(false);
    // Smooth closing animation when selecting a result
    setTimeout(() => {
      setQuery('');
      setOpen(false);
    }, 200);
  };

  const toggleSearch = () => {
    if (open) {
      // Close animation: hide results first, then clear query after animation
      setShowResults(false);
      setTimeout(() => {
        setQuery('');
        setOpen(false);
      }, 200); // Delay to allow closing animation
    } else {
      setOpen(true);
    }
  };

  return (
    <div
      className={`md:relative ${
        open
          ? 'fixed left-0 right-0 top-0 md:w-fit bg-white dark:bg-cornsilk-d1 z-20'
          : 'w-fit'
      }`}
      ref={searchRef}
    >
      <div
        className={`relative flex items-center ${
          open && 'text-cornsilk-dark dark:text-cornsilk focus:outline-hidden'
        } ${
          open
            ? 'max-md:px-2 max-md:py-3 bg-white dark:bg-cornsilk-d1 z-30'
            : ''
        }`}
      >
        {/* Desktop search bar */}
        <animated.div
          style={searchBarSpring}
          className='hidden md:flex items-center gap-2 overflow-hidden'
        >
          {open && (
            <>
              <div className='relative flex items-center'>
                <Search className='absolute left-2.5 h-4 w-4 text-cornsilk-dark/50 dark:text-cornsilk/50 pointer-events-none' />
                <input
                  type='text'
                  value={query}
                  onChange={handleInputChange}
                  onFocus={() => setShowResults(true)}
                  placeholder='Search...'
                  className='w-90 border-b border-cornsilk-dark dark:border-neutral-600 py-1 pl-6 text-sm focus:outline-hidden bg-transparent ml-2'
                  autoFocus={open}
                />
              </div>
            </>
          )}
        </animated.div>

        {/* Mobile search bar */}
        {open && (
          <animated.div style={mobileSearchSpring} className='md:hidden flex-1'>
            <div className='relative flex items-center'>
              <Search className='absolute left-0 h-4 w-4 text-cornsilk-dark/50 dark:text-cornsilk/50 pointer-events-none' />
              <input
                type='text'
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                placeholder='Search...'
                className='w-full border-b border-cornsilk-dark dark:border-neutral-600 py-1 pl-6 text-sm focus:outline-hidden bg-transparent'
                autoFocus={open}
              />
            </div>
          </animated.div>
        )}
        {open ? (
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSearch}
            className='hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 rounded-full focus:outline-hidden'
          >
            <X className='h-4 w-4 text-cornsilk-dark dark:text-cornsilk' />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSearch}
            className={`rounded-full hover:bg-neutral-200 focus:outline-hidden flex-shrink-0`}
          >
            <Search className='h-4 w-4 text-cornsilk-dark dark:text-cornsilk' />
          </Button>
        )}
      </div>

      {showResults && query.length > 0 && (
        <>
          {/* Overlay */}
          {open && (
            <div
              className='fixed inset-0 top-10.5 bg-black/50 z-10 transition-opacity duration-300 ease-in-out'
              onClick={() => {
                setShowResults(false);
                setTimeout(() => {
                  setQuery('');
                  setOpen(false);
                }, 200);
              }}
            />
          )}
          <animated.div
            style={resultsSpring}
            className='absolute right-2 left-0 md:w-95 w-[calc(100%-0.5rem)] mx-0.5 md:mx-0 bg-white dark:bg-cornsilk-d3 rounded-b shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-130 overflow-y-auto z-50'
          >
            {isSearching ? (
              <div className='p-2 text-center text-sm text-neutral-600 dark:text-neutral-400'>
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className='py-1'>
                {trail.map((style, index) => {
                  const product = results[index];
                  return (
                    <animated.li
                      key={product.id}
                      style={style}
                      onClick={() => handleResultClick(product.id)}
                      className='px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer'
                    >
                      <div className='flex items-center gap-2'>
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className='w-16 h-16 object-cover'
                        />
                        <div>
                          <div className='text-md font-medium text-neutral-900 dark:text-neutral-100 whitespace-normal'>
                            {product.title}
                          </div>
                          <div className='text-sm text-neutral-500 dark:text-neutral-400'>
                            ${product.price}
                          </div>
                        </div>
                      </div>
                    </animated.li>
                  );
                })}
              </ul>
            ) : (
              <div className='p-2 flex flex-col items-center justify-center text-center text-sm text-neutral-600 dark:text-neutral-300'>
                <video
                  src='/searching1.mp4'
                  className='size-40 md:size-60 '
                  autoPlay
                  muted
                  loop
                ></video>
                <span className='mt-2 md:text-base'>
                  Oops! No results for
                  <span className='font-semibold ml-1'>'{query}'</span>
                </span>
                <p className='my-1 px-2 text-xs leading-5 whitespace-normal'>
                  We didn’t find any matching products. Try adjusting your
                  search or browse through our featured collections.
                </p>
              </div>
            )}
          </animated.div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
