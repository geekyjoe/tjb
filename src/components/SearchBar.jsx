import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Search, X } from 'lucide-react';
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
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });

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
    opacity: showResults ? 1 : 0,
    transform: showResults ? 'translateY(0px)' : 'translateY(-10px)',
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
    // Prevent background scroll when results are shown
    if (showResults && query.length > 0) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showResults, query]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ignore if search is not open
      if (!open) return;

      const isSearchButton = event.target.closest('button');
      if (isSearchButton) return;

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
      // Only close on resize if window width changes significantly
      const width = window.innerWidth;
      if (open && Math.abs(width - previousWidth) > 100) {
        setShowResults(false);
        setTimeout(() => {
          setQuery('');
          setOpen(false);
        }, 200);
      }
      previousWidth = width;
    };

    let previousWidth = window.innerWidth;

    // Use mousedown for desktop and touchend for mobile
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, [open]);

  const handleInputChange = (e) => {
    e.preventDefault(); // Prevent any default behavior
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
    setShowResults(true);
  };

  const toggleSearch = (e) => {
    e.preventDefault(); // Prevent event bubbling
    e.stopPropagation(); // Stop event propagation

    if (open) {
      setShowResults(false);
      setTimeout(() => {
        setQuery('');
        setOpen(false);
      }, 200);
    } else {
      setOpen(true);
    }
  };

  // Add this function after other handlers
  const addToSearchHistory = (searchTerm) => {
    const newHistory = [
      searchTerm,
      ...searchHistory.filter((term) => term !== searchTerm),
    ].slice(0, 5); // Keep only last 5 searches
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
  };

  // Modify handleResultClick to include search history
  const handleResultClick = (productId) => {
    addToSearchHistory(query);
    navigate(`/collections/${productId}`);
    setShowResults(false);
    setTimeout(() => {
      setQuery('');
      setOpen(false);
    }, 200);
  };

  // Add function to clear search history
  const clearSearchHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    if (!query) {
      setShowResults(false);
    }
  };

  return (
    <div
      className={`md:relative ${
        open
          ? 'absolute left-0 right-0 top-0 md:w-fit bg-white dark:bg-cornsilk-d1 z-20'
          : 'w-fit'
      }`}
      ref={searchRef}
    >
      <div
        className={`relative flex items-center ${
          open &&
          'pl-2.5 py-1.5 md:p-0 z-12 backdrop-blur-sm bg-white dark:bg-cornsilk-d1 text-cornsilk-dark dark:text-cornsilk focus:outline-hidden'
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
                  className='md:w-80 lg:w-90 border-b border-cornsilk-dark dark:border-neutral-600 py-1 pl-6 text-sm focus:outline-hidden bg-transparent ml-2'
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
            className='p-2 text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none focus:outline-hidden shrink-0'
          >
            <X className='h-4 w-4 text-cornsilk-dark dark:text-cornsilk' />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleSearch}
            className='p-2 text-black/75 hover:text-black dark:text-white/75 dark:hover:text-white rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-80 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 outline-none focus:outline-none shrink-0'
          >
            <Search className='h-4 w-4 text-black/75 dark:text-white/75' />
          </Button>
        )}
      </div>

      {showResults && (
        <>
          {/* Overlay */}
          <div
            className='fixed inset-0 top-10.5 md:top-12 h-screen bg-black/50 z-10 transition-opacity duration-300 ease-in-out'
            onClick={() => {
              setShowResults(false);
              setTimeout(() => {
                setQuery('');
              }, 200);
            }}
          />

          <animated.div
            style={resultsSpring}
            className='absolute right-2 left-0 md:w-90 lg:w-95 w-[calc(100%-0.5rem)] mx-0.5 md:mx-0 bg-white dark:bg-cornsilk-d3 rounded-b shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-130 overflow-y-auto z-50'
          >
            {query.length === 0 ? (
              searchHistory.length > 0 ? (
                // Show search history
                <div className='p-2'>
                  <div className='flex items-center justify-between px-2 py-1.5'>
                      
                      <h3 className='text-sm font-medium text-neutral-600 dark:text-neutral-400'>
                        Recent Searches
                      </h3>
                    <button
                      onClick={clearSearchHistory}
                      className='text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none p-1 rounded'
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className=''>
                    {searchHistory.map((term, index) => (
                      <li
                        key={index}
                        className='flex items-center gap-2 text-sm md:text-lg text-neutral-700 dark:text-neutral-200 px-2 py-1 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none rounded-sm'
                        onClick={() => {
                          setQuery(term);
                          handleSearch(term);
                        }}
                      >
                        <Clock className='size-4 text-neutral-400' />
                        <span className='mb-1'>{term}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                setShowResults(false)
              )
            ) : isSearching ? (
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
                      className='px-3 py-1.5 hover:bg-neutral-200 dark:hover:bg-neutral-800 focus:bg-neutral-300 dark:focus:bg-neutral-700 hover:ring hover:ring-stone-300 dark:hover:ring-stone-700 focus:ring-2 focus:ring-stone-400 dark:focus:ring-stone-700 outline-none cursor-pointer'
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
            ) : query.length > 0 ? (
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
            ) : null}
          </animated.div>
        </>
      )}
    </div>
  );
};

export default SearchBar;
