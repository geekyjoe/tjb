import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../components/CartContext';
import { fetchProductById } from '../api/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '../components/ui/tabs';
import {
  Star,
  Truck,
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  ShoppingBag,
  ArchiveX,
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { calculateDeliveryDate } from '../components/ddc';
import ProductImageGallery from '../components/ImageGallery';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [pincode, setPincode] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) {
          throw new Error('Product not found');
        }
        setProduct(data);

        // Update document title with product name
        document.title = `${data.title} - Product Details`;
      } catch (err) {
        setError(err.message);
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const isInCart = product && cartItems.some((item) => item.id === product.id);

  const checkDelivery = () => {
    const result = calculateDeliveryDate(pincode);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setDeliveryDate(result.estimatedDate);

    // Show appropriate toast message
    if (result.type === 'same-day') {
      toast.success('Same day delivery available!');
    } else {
      toast.success(`Delivery estimated by ${result.estimatedDate}`);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`, {
      description: `Price: $${product.price.toFixed(2)}`,
      position: 'bottom-right',
    });
  };

  const goToCart = () => {
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-[400px]'>
        <Loader2 className='w-8 h-8 animate-spin text-stone-800' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <h2 className='text-2xl font-bold text-red-600 mb-4'>
          Error Loading Product
        </h2>
        <p className='text-gray-600 mb-4'>{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className='container mx-auto px-4 py-8 text-center'>
        <h2 className='text-2xl font-bold mb-4'>Product Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className='mx-auto px-2.5 py-4 md:px-4 md:py-8 bg-white dark:bg-cornsilk-d1'>
      <Toaster richColors />
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Image Gallery Component */}
        <ProductImageGallery 
          images={product.images} 
          productTitle={product.title}
        />

        {/* Product Details */}
        <div className='space-y-6'>
          <div>
            <h1 className='text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100'>
              {product.title}
            </h1>
            <div className='flex items-center mt-2'>
              <Star className='size-5 text-yellow-400 fill-yellow-400' />
              <span className='ml-1.5 text-gray-600 dark:text-gray-300'>
                {product.rating}
              </span>
              <span className='ml-2 text-xs md:text-sm text-gray-500'>
                ({product.stock} items in stock)
              </span>
            </div>
          </div>

          <div className='space-y-3'>
            <div className='flex items-baseline space-x-4'>
              <p className='text-xl md:text-3xl font-bold text-gray-900 dark:text-gray-100'>
                ${product.price.toFixed(2)}
              </p>
              {product.discountPercentage > 0 && (
                <p className='text-sm md:text-lg text-green-600'>
                  {product.discountPercentage}% OFF
                </p>
              )}
            </div>
            <p className='text-sm text-gray-500'>Brand: {product.brand}</p>
            <p className='text-xs text-yellow-500'>GST Excluded</p>

            {/* Add to Cart Button */}
            {!isInCart ? (
              <Button
                onClick={handleAddToCart}
                className='w-fit bg-yellow-500 hover:bg-yellow-400 text-neutral-700'
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? <ArchiveX /> : <ShoppingBag />}
                {product.stock === 0 ? 'Sold Out' : 'Add to Cart'}
              </Button>
            ) : (
              <Button
                onClick={goToCart}
                className='w-fit text-xs md:text-[0.9rem] bg-yellow-500 hover:bg-yellow-400 text-neutral-700'
              >
                <span className=''>Go to Cart</span>
                <ArrowRight className='w-4 h-4' />
              </Button>
            )}
          </div>

          <Tabs defaultValue='description' className='w-full m-0'>
            <TabsList>
              <TabsTrigger value='description'>Description</TabsTrigger>
              <TabsTrigger value='specifications'>Details</TabsTrigger>
            </TabsList>

            <TabsContent value='description' className='mt-4'>
              <p className='text-sm md:text-lg text-gray-600 dark:text-gray-300'>
                {product.description}
              </p>
            </TabsContent>

            <TabsContent value='specifications' className='mt-4'>
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm md:text-md font-medium'>Brand</span>
                  <span className='text-sm md:text-md text-gray-600'>
                    {product.brand}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm md:text-md font-medium'>
                    Category
                  </span>
                  <span className='text-sm md:text-md text-gray-600'>
                    {product.category}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm md:text-md font-medium'>
                    Availability
                  </span>
                  <span className='text-sm md:text-md text-gray-600'>
                    {product.stock} items in stock
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm md:text-md font-medium'>Rating</span>
                  <span className='text-sm md:text-md text-gray-600'>
                    {product.rating}/5
                  </span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Delivery Check */}
          <div className='p-2 md:p-4 my-2 md:my-4'>
            <div className='flex items-center space-x-4'>
              <Input
                type='text'
                placeholder='Enter Pincode'
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    checkDelivery();
                  }
                }}
                className='w-40 dark:ring-zinc-400'
              />
              <Button
                onClick={checkDelivery}
                variant='outline'
                className='rounded-md dark:bg-stone-800'
              >
                Check
              </Button>
            </div>
            {deliveryDate && (
              <div className='mt-4 text-sm md:text-md flex items-center space-x-2'>
                <Calendar className='w-4 h-4' />
                <span>Estimated delivery by {deliveryDate}</span>
              </div>
            )}
          </div>

          {/* Offers */}
          <div className='border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4'>
            <h3 className='md:text-lg font-semibold mb-4'>Available Offers</h3>
            <ul className='space-y-3'>
              {product.discountPercentage > 0 && (
                <li className='text-sm md:text-md flex items-center'>
                  <Package className='w-4 h-4 mr-2' />
                  <span>
                    Special discount of {product.discountPercentage}% applied
                  </span>
                </li>
              )}
              <li className='text-sm md:text-md flex items-center'>
                <Package className='w-4 h-4 mr-2' />
                <span>Free shipping on orders above ₹499</span>
              </li>
              <li className='text-sm md:text-md flex items-center'>
                <Truck className='w-4 h-4 mr-2' />
                <span>Express delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;