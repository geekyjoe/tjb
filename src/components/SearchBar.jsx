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
    opacity: open ? 1 : 0,
    transform: open ? 'translateY(0px)' : 'translateY(-10px)',
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
      setResults(searchResults.slice(0, 5));
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (searchRef.current && !searchRef.current.contains(event.target)) {
  //       setShowResults(false);
  //       // Smooth closing animation when clicking outside
  //       if (open) {
  //         setTimeout(() => {
  //           setQuery('');
  //           setOpen(false);
  //         }, 200);
  //       }
  //     }
  //   };

  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, [open]);

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
      className={`relative ${
        open
          ? 'md:w-fit max-md:fixed max-md:left-0 max-md:right-0 max-md:top-0 max-md:w-full max-md:bg-cornsilk dark:max-md:bg-cornsilk-d1 max-md:z-20'
          : 'w-fit'
      }`}
      ref={searchRef}
    >
      <div
        className={`relative flex items-center ${
          open && 'text-cornsilk-dark dark:text-cornsilk focus:outline-hidden'
        } ${
          open
            ? 'max-md:px-4 max-md:py-3 max-md:w-full max-md:justify-between'
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
              <input
                type='text'
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                placeholder='Search...'
                className='w-90 border-b border-cornsilk-dark dark:border-neutral-600 py-1 text-sm focus:outline-hidden bg-transparent ml-2'
                autoFocus={open}
              />
            </>
          )}
        </animated.div>

        {/* Mobile search bar */}
        {open && (
          <animated.div
            style={mobileSearchSpring}
            className='md:hidden flex-1'
          >
            <input
              type='text'
              value={query}
              onChange={handleInputChange}
              onFocus={() => setShowResults(true)}
              placeholder='Search...'
              className='w-full border-b border-cornsilk-dark dark:border-neutral-600 py-1 text-sm focus:outline-hidden bg-transparent'
              autoFocus={open}
            />
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
            className={`rounded-full hover:bg-cornsilk-hover focus:outline-hidden flex-shrink-0`}
          >
            <Search className='h-4 w-4 text-cornsilk-dark dark:text-cornsilk' />
          </Button>
        )}
      </div>

      {showResults && query.length > 0 && (
        <animated.div
          style={resultsSpring}
          className='absolute right-0 md:left-0 md:w-95 w-full bg-white dark:bg-cornsilk-d3 rounded shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-72 overflow-y-auto z-50'
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
                        <div className='text-md font-medium text-neutral-900 dark:text-neutral-100'>
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
            <div className='p-2 text-center text-sm text-neutral-600 dark:text-neutral-400'>
              No products found
            </div>
          )}
        </animated.div>
      )}
    </div>
  );
};

export default SearchBar;
