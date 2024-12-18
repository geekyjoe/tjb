import React, { useEffect, useState } from 'react';
import { fetchProducts, fetchCategories } from '../api/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../components/CartContext';
import { CopyrightCircleOutlined } from '@ant-design/icons';
import { Select, Empty } from 'antd';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [pagination, setPagination] = useState({
    limit: 12,
    skip: 0,
    total: 0
  });

  const fetchProductsData = async (limit, skip, category = null) => {
    try {
      setLoading(true);
      const fetchedProducts = await fetchProducts(limit, skip, category);
      
      // If category is selected and no products found, reset to initial state
      if (category && fetchedProducts.length === 0) {
        setSelectedCategory(null);
        const initialProducts = await fetchProducts(limit, 0);
        setProducts(initialProducts);
      } else {
        // Replace products if it's the first fetch for a category
        if (skip === 0) {
          setProducts(fetchedProducts);
        } else {
          // Append products for load more functionality
          setProducts(prevProducts => [...prevProducts, ...fetchedProducts]);
        }
      }
      
      setPagination(prev => ({
        ...prev,
        skip: skip,
        total: fetchedProducts.length
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [initialProducts, initialCategories] = await Promise.all([
          fetchProducts(pagination.limit, pagination.skip),
          fetchCategories(),
        ]);
    
        setProducts(initialProducts);
    
        // Transform categories to a string array
        setCategories(initialCategories.map(cat => cat.name));
      } catch (error) {
        console.error("Error fetching initial data:", error);
      } finally {
        setLoading(false);
      }
    };    

    loadInitialData();
  }, []);

  const handleCategoryChange = async (category) => {
    if (category === undefined || category === null) {
      setSelectedCategory(null);
      await fetchProductsData(pagination.limit, 0, null);
      return;
    }

    setSelectedCategory(category);
    await fetchProductsData(pagination.limit, 0, category);
  };

  const handleLoadMore = async () => {
    const newSkip = pagination.skip + pagination.limit;
    
    await fetchProductsData(
      pagination.limit, 
      newSkip, 
      selectedCategory
    );
  };

  if (loading && products.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-5 w-full min-h-screen px-4 sm:px-6 lg:px-8 bg-cornsilk dark:bg-neutral-800 text-gray-700 dark:text-gray-200">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">
            {selectedCategory 
              ? `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Collection` 
              : 'Our Collection'
            }
          </h1>
          
          <Select
            placeholder="Filter by Category"
            style={{ width: 200 }}
            value={selectedCategory}
            onChange={handleCategoryChange}
            allowClear
          >
            {categories.map(category => (
              <Select.Option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Select.Option>
            ))}
          </Select>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(3,_minmax(0,_1fr))] lg:grid-cols-[repeat(4,_minmax(0,_1fr))] gap-6 sm:gap-8">
              {products.map((product) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  className="w-full h-full" 
                />
              ))}
            </div>

            <div className="text-center mt-8">
              <button 
                onClick={handleLoadMore}
                className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center min-h-[calc(100vh-300px)]">
            <Empty 
              description={
                <span className="text-gray-500 dark:text-gray-200">
                  No products found {selectedCategory ? `in ${selectedCategory} category` : ''}
                </span>
              } 
            />
          </div>
        )}

        <footer className='py-6 mt-6 text-center'>
          <p className="text-gray-500 dark:text-gray-200">
            <CopyrightCircleOutlined className='text-emerald-800 dark:text-emerald-100 mr-2 inline-block' />
            The JewellerBee 2024
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Products;