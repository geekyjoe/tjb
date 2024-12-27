import React, { useEffect, useState } from "react";
import { fetchProducts, fetchCategories } from "../api/api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../components/CartContext";
import { Empty } from "antd";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Filter, LayoutGrid, LayoutList, Loader, X } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import * as Separator from "@radix-ui/react-separator";
import Footer from "../components/Footer";

const Products = () => {
  // In Products.jsx
  const { totalItems } = useCart(); // Add this to your existing useCart destructuring
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(new Set());
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [pagination, setPagination] = useState({
    limit: 12,
    skip: 0,
    total: 0,
  });

  const fetchProductsData = async (limit, skip, categories = null) => {
    try {
      setLoading(true);
      let allProducts = [];
      
      if (categories && categories.size > 0) {
        // Fetch products for each selected category
        const categoryPromises = Array.from(categories).map(category =>
          fetchProducts(limit, skip, category)
        );
        
        const productsArrays = await Promise.all(categoryPromises);
        
        // Combine and deduplicate products
        allProducts = Array.from(new Set(
          productsArrays.flat().map(product => JSON.stringify(product))
        )).map(product => JSON.parse(product));
        
        // Apply pagination to the combined results
        allProducts = allProducts.slice(skip, skip + limit);
      } else {
        allProducts = await fetchProducts(limit, skip, null);
      }

      if (skip === 0) {
        setProducts(allProducts);
      } else {
        setProducts(prevProducts => [...prevProducts, ...allProducts]);
      }

      setHasMore(allProducts.length === limit);
      setPagination(prev => ({
        ...prev,
        skip: skip,
        total: skip + allProducts.length,
      }));
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const sortProducts = (products, sortBy) => {
    const sortedProducts = [...products];
    switch (sortBy) {
      case "price-high-low":
        return sortedProducts.sort((a, b) => b.price - a.price);
      case "price-low-high":
        return sortedProducts.sort((a, b) => a.price - b.price);
      case "rating-high-low":
        return sortedProducts.sort((a, b) => b.rating - a.rating);
      case "rating-low-high":
        return sortedProducts.sort((a, b) => a.rating - b.rating);
      default:
        return sortedProducts;
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setInitialLoading(true);
        const [initialProducts, initialCategories] = await Promise.all([
          fetchProducts(pagination.limit, pagination.skip),
          fetchCategories(),
        ]);

        setProducts(initialProducts);
        setCategories(initialCategories.map((cat) => cat.name));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    if (sortBy) {
      setProducts((prev) => sortProducts(prev, sortBy));
    }
  }, [sortBy]);

  const handleCategoryChange = async (category) => {
    const newSelectedCategories = new Set(selectedCategories);

    if (newSelectedCategories.has(category)) {
      newSelectedCategories.delete(category);
    } else {
      newSelectedCategories.add(category);
    }

    setSelectedCategories(newSelectedCategories);
    setPagination({ ...pagination, skip: 0 }); // Reset pagination
    setHasMore(true); // Reset hasMore state
    await fetchProductsData(pagination.limit, 0, newSelectedCategories);
  };

  const handleClearCategories = async () => {
    setSelectedCategories(new Set());
    await fetchProductsData(pagination.limit, 0, null);
    toast.info("Filters cleared", {
      description: "Showing all products",
      position: "bottom-right",
    });
  };

  const handleLoadMore = async () => {
    if (!hasMore || loading) return;
    const newSkip = pagination.skip + pagination.limit;
    await fetchProductsData(pagination.limit, newSkip, selectedCategories);
  };

  // Mobile Sidebar Component
  const MobileSidebar = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 w-72 bg-white dark:bg-neutral-800 
          shadow-lg z-50 transform transition-transform duration-200 ease-in-out
          md:hidden
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <div className="h-full flex flex-col">
            <div className="p-4 border-b dark:border-neutral-700 flex justify-between items-center">
              <h3 className="font-semibold text-lg">Categories</h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 border-b dark:border-neutral-700">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  handleClearCategories();
                  onClose();
                }}
                className="text-sm hover:text-red-500 w-full justify-start"
                disabled={selectedCategories.size === 0}
              >
                Clear All Filters
              </Button>
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mobile-${category}`}
                      checked={selectedCategories.has(category)}
                      onCheckedChange={() => {
                        handleCategoryChange(category);
                      }}
                    />
                    <label
                      htmlFor={`mobile-${category}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </>
    );
  };

  if (setInitialLoading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-3 w-full min-h-screen text-gray-700 dark:text-gray-200">
      <Toaster richColors />
      <div className="px-1 lg:px-2">
        <div className="flex gap-2">
          {/* Desktop Sidebar */}
          <aside className="max-lg:hidden w-64 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg border dark:border-neutral-600">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                {selectedCategories.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearCategories}
                    className="text-sm hover:text-red-500"
                  >
                    Clear All
                  </Button>
                )}
              </div>
              <ScrollArea className="h-60">
                <div className="space-y-3 p-1.5">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        className="border-none ring ring-1 ring-zinc-300"
                        id={category}
                        checked={selectedCategories.has(category)}
                        onCheckedChange={() => handleCategoryChange(category)}
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </aside>


          {/* Mobile Sidebar */}
          <MobileSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />

          {/* Main Content */}
          <div className="flex-1">
            {/* Header with sorting and view options */}
            <div className="font-oSans flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <div className="flex items-center max-lg:justify-between gap-4 w-full sm:w-auto">
              <h2 className="max-sm:text-lg text-2xl pl-2 font-inter font-medium">
                  {selectedCategories.size > 0
                    ? `${Array.from(selectedCategories).map(cat => 
                        cat.charAt(0).toUpperCase() + cat.slice(1)
                      ).join(', ')} Collection`
                    : "All Collection"}
                </h2>
              </div>
              <div className="flex items-center max-sm:justify-between gap-4 w-full sm:w-auto">
                <Separator.Root
                  className="bg-gray-300 md:hidden dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
                  orientation="horizontal"
                />
              </div>
              <div className="flex items-center flex-row-reverse justify-between gap-4 px-2 w-full sm:w-auto">
                <Select
                  value={sortBy}
                  onValueChange={(value) => {
                    if (value === sortBy) {
                      setSortBy("");
                    } else {
                      setSortBy(value);
                    }
                  }}
                >
                  <SelectTrigger className="w-fit max-l:text-[12px] border-2 max-l:rounded-md dark:border-zinc-500">
                    <SelectValue placeholder="Sort by..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-high-low">
                      Price: High to Low
                    </SelectItem>
                    <SelectItem value="price-low-high">
                      Price: Low to High
                    </SelectItem>
                    <SelectItem value="rating-high-low">
                      Rating: High to Low
                    </SelectItem>
                    <SelectItem value="rating-low-high">
                      Rating: Low to High
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    className="max-l:rounded-lg md:hidden"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                  <Button
                    className="max-l:rounded-md"
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    className="max-l:rounded-md"
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {products.length > 0 ? (
              <>
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 lg:gap-1"
                      : "space-y-2"
                  }
                >
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {hasMore && (
                  <div className="text-center mt-8">
                    <Button
                      onClick={handleLoadMore}
                      className="bg-stone-800 hover:bg-stone-700 text-white"
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader className="animate-spin" />
                      ) : (
                        "Load More"
                      )}
                    </Button>
                  </div>
                )}
                {!hasMore && products.length > pagination.limit && (
                  <p className="text-center mt-8 text-gray-500 dark:text-gray-400">
                    No more products to display{" "}
                    {selectedCategories.size > 0 ? "in this category" : ""}
                  </p>
                )}
              </>
            ) : (
              <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
                <Empty
                  description={
                    <span className="text-gray-500 dark:text-gray-200">
                      No products found
                      {selectedCategories.size > 0
                        ? ` in ${Array.from(selectedCategories)[0]} category`
                        : ""}
                    </span>
                  }
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
