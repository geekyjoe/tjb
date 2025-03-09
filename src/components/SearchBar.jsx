import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { searchProducts } from "../api/api";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";

const SearchBar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [open, setOpen] = useState(false);
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
      console.error("Search failed:", error);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    setQuery("");
  };

  return (
    <div className="relative w-fit p-0" ref={searchRef}>
      <div
        className={`relative w-fit flex items-center ${
          open && "text-cornsilk-dark dark:text-cornsilk focus:outline-hidden"
        }`}
      >
        {!open && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setOpen((prev) => !prev)}
            className="rounded-full hover:bg-cornsilk-hover focus:outline-hidden"
          >
            <Search className="h-4 w-4 text-cornsilk-dark dark:text-cornsilk" />
          </Button>
        )}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 250, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ overflow: "hidden", marginLeft: 8 }}
              className="flex items-center gap-1 max-md:w-44"
            >
              <Search size={20} className="max-md:mr-2 max-md:h-4 max-md:w-4 text-cornsilk-dark dark:text-cornsilk" />
              <input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                placeholder="Search..."
                className="md:w-44 border-b border-cornsilk-dark dark:border-neutral-600 py-1 text-sm focus:outline-hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => !setOpen((prev) => !prev)}
                className="hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 rounded-full hover:bg-cornsilk-hover focus:outline-hidden"
              >
                <X className="h-4 w-4 text-cornsilk-dark dark:text-cornsilk" />
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showResults && query.length > 0 && (
        <div className="absolute right-0 md:left-0 mt-1 w-80 bg-white dark:bg-cornsilk-dark rounded shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-72 overflow-y-auto z-50">
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
                      className="w-16 h-16 object-cover"
                    />
                    <div>
                      <div className="text-md font-medium text-neutral-900 dark:text-neutral-100">
                        {product.title}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
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
