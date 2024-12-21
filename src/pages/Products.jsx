import React, { useEffect, useState } from "react";
import { fetchProducts, fetchCategories } from "../api/api";
import ProductCard from "../components/ProductCard";
import { useCart } from "../components/CartContext";
import { CopyrightCircleOutlined } from "@ant-design/icons";
import { Empty } from "antd";
import { Toaster } from "../components/ui/sonner";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { ScrollArea } from "../components/ui/scroll-area";
import { Filter, LayoutGrid, LayoutList, X } from "lucide-react";
import { MdShoppingBag } from "react-icons/md";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Link } from "react-router-dom";
import * as Separator from "@radix-ui/react-separator";

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
      const fetchedProducts = await fetchProducts(
        limit,
        skip,
        categories && categories.size > 0 ? Array.from(categories)[0] : null
      );

      if (skip === 0) {
        setProducts(fetchedProducts);
      } else {
        setProducts((prevProducts) => [...prevProducts, ...fetchedProducts]);
      }

      setHasMore(fetchedProducts.length === limit);

      setPagination((prev) => ({
        ...prev,
        skip: skip,
        total: skip + fetchedProducts.length,
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
    <div className="pt-5 w-full min-h-screen px-4 sm:px-6 lg:px-8 bg-cornsilk dark:bg-neutral-800 text-gray-700 dark:text-gray-200">
      <Toaster richColors />
      <div className="container mx-auto">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="max-lg:hidden w-64 flex-shrink-0">
            <div className="bg-white dark:bg-neutral-700 p-4 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-lg">Categories</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearCategories}
                  className="text-sm hover:text-red-500"
                  disabled={selectedCategories.size === 0}
                >
                  Clear All
                </Button>
              </div>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div className="flex items-center max-lg:justify-between gap-4 w-full sm:w-auto">
                <h2 className="max-sm:text-lg text-2xl font-bold">
                  {selectedCategories.size > 0
                    ? `${
                        Array.from(selectedCategories)[0]
                          .charAt(0)
                          .toUpperCase() +
                        Array.from(selectedCategories)[0].slice(1)
                      } Collection`
                    : "Our Collection"}
                </h2>
                <Link to="..\cart" className="relative md:hidden">
                  <MdShoppingBag size={30} />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </Link>
              </div>
              <div className="flex items-center max-sm:justify-between gap-4 w-full sm:w-auto">
                <Separator.Root
                  className="bg-gray-300 md:hidden dark:bg-gray-600 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px"
                  orientation="horizontal"
                />
              </div>
              <div className="flex items-center flex-row-reverse justify-between gap-4 w-full sm:w-auto">
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
                    className="max-l:rounded-lg"
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
                      ? "grid grid-cols-2 lg:grid-cols-3 gap-4"
                      : "space-y-4"
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
                        <div className="flex justify-center items-center min-h-screen">
                          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
                        </div>
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

        <footer className="py-6 mt-6 text-center">
          <p className="text-gray-500 dark:text-gray-200">
            <CopyrightCircleOutlined className="text-emerald-800 dark:text-emerald-100 mr-2 inline-block" />
            The JewellerBee 2024
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Products;
