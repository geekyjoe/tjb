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
    setOpen(false);
  };

  const toggleSearch = () => {
    setOpen((prev) => !prev);
    if (open) {
      setQuery("");
      setShowResults(false);
    }
  };

  return (
    <div
      className={`relative ${
        open
          ? "md:w-fit max-md:absolute max-md:left-0 max-md:right-0 max-md:top-0 max-md:bg-cornsilk dark:max-md:bg-cornsilk-d1 max-md:z-20"
          : "w-fit"
      }`}
      ref={searchRef}
    >
      <div
        className={`relative flex items-center ${
          open && "text-cornsilk-dark dark:text-cornsilk focus:outline-hidden"
        } ${
          open
            ? "max-md:px-2 max-md:py-1 max-md:w-full max-md:justify-between"
            : ""
        }`}
      >
        {!open && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSearch}
            className="rounded-full hover:bg-cornsilk-hover focus:outline-hidden"
          >
            <Search className="h-4 w-4 text-cornsilk-dark dark:text-cornsilk" />
          </Button>
        )}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ width: 0, opacity: 0, x: -20 }}
              animate={{ width: "100%", opacity: 1, x: 0 }}
              exit={{ width: 0, opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="flex items-center gap-2 max-md:w-full overflow-hidden"
            >
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                <Search
                  size={20}
                  className="max-md:mr-2 max-md:h-5 max-md:w-5 text-cornsilk-dark dark:text-cornsilk"
                />
              </motion.div>
              <motion.input
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowResults(true)}
                placeholder="Search..."
                className="md:w-44 max-md:w-full max-md:flex-1 border-b border-cornsilk-dark dark:border-neutral-600 py-1 text-sm focus:outline-hidden bg-transparent"
                autoFocus={open}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.15 }}
              />
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.2 }}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleSearch}
                  className="hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50 rounded-full hover:bg-cornsilk-hover focus:outline-hidden"
                >
                  <X className="h-4 w-4 text-cornsilk-dark dark:text-cornsilk" />
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showResults && query.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 md:left-0 mt-1 w-80 max-md:w-full max-md:right-0 bg-white dark:bg-cornsilk-dark rounded shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-72 overflow-y-auto z-50"
          >
            {isSearching ? (
              <div className="p-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                Searching...
              </div>
            ) : results.length > 0 ? (
              <ul className="py-1">
                {results.map((product, index) => (
                  <motion.li
                    key={product.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
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
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="p-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
                No products found
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;