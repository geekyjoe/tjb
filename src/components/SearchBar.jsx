import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { searchProducts } from '../api/api';

const SearchBar = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

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

  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  };

  const debouncedSearch = debounce(handleSearch, 300);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
    setShowResults(true);
  };

  const handleResultClick = (productId) => {
    navigate(`/products/${productId}`);
    setShowResults(false);
    setQuery('');
  };

  return (
    <div className="relative w-fit p-0" ref={searchRef}>
      <div className="relative w-fit p-0">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setShowResults(true)}
          placeholder="Search..."
          className="w-32 md:w-44 px-3 py-1.5 pl-8 text-sm rounded-md md:border border-neutral-300 dark:border-neutral-600 bg-cornsilk dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
        <Search className="absolute left-2 top-2 h-4 w-4 text-neutral-400" />
      </div>

      {showResults && (query.length > 0) && (
        <div className="absolute right-0 md:left-0 mt-1 w-64 bg-white dark:bg-neutral-800 rounded shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-72 overflow-y-auto z-50">
          {isSearching ? (
            <div className="p-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <ul className="py-1">
              {results.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleResultClick(product.id)}
                  className="px-3 py-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="w-8 h-8 object-cover rounded"
                    />
                    <div>
                      <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                        {product.title}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        ${product.price}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
              No products found
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;