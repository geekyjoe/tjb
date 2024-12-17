import React, { useEffect, useState } from 'react';
import { fetchProducts } from '../api/api';
import ProductCard from '../components/ProductCard';
import { CopyrightCircleOutlined } from '@ant-design/icons';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  return (
    <div className="container bg-gray-50 dark:bg-neutral-800 text-gray-700 dark:text-gray-200 w-full max-w-screen px-8 py-8">
      <h1 className="text-3xl font-bold mb-6 text-center">Our Collection</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {products.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-200">No products available</p>
      )}
      <footer className='p-2 mt-5'>
        <p className="text-center text-gray-500 dark:text-gray-200"><CopyrightCircleOutlined className='text-emerald-800 dark:text-emerald-100 mr-1' />The JewellerBee 2023</p>
      </footer>
    </div>
  );
};

export default Products;