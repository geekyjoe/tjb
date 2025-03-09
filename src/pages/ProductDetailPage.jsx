import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCart } from "../components/CartContext";
import { fetchProductById } from "../api/api";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/tabs";
import {
  Star,
  Truck,
  Package,
  Calendar,
  ArrowRight,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import { calculateDeliveryDate } from "../components/ddc";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, cartItems } = useCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef(null);
  
  // Added state for gallery modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const galleryImageRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!imageContainerRef.current) return;

    const { left, top, width, height } =
      imageContainerRef.current.getBoundingClientRect();

    // Calculate the cursor position relative to image boundaries
    let mouseX = e.pageX - left;
    let mouseY = e.pageY - top;

    // Account for scroll position
    mouseX = mouseX - window.pageXOffset;
    mouseY = mouseY - window.pageYOffset;

    // Convert to a scale from -1 to 1 for smoother zooming
    const ratioX = (mouseX / width) * 2 - 1;
    const ratioY = (mouseY / height) * 2 - 1;

    // Apply constraints to keep zoom within bounds
    const boundedX = Math.max(-1, Math.min(1, ratioX));
    const boundedY = Math.max(-1, Math.min(1, ratioY));

    // Convert to percentage with adjustment for centered zoom
    const zoomX = (boundedX + 1) * 50;
    const zoomY = (boundedY + 1) * 50;

    setMousePosition({ x: zoomX, y: zoomY });
  };

  // Gallery image navigation handlers
  const goToPreviousImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
    resetZoom();
  };

  const goToNextImage = () => {
    if (!product) return;
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
    resetZoom();
  };

  // Zoom handlers for gallery modal
  const zoomIn = () => {
    if (zoomLevel < 4) {
      setZoomLevel((prev) => prev + 0.5);
    }
  };

  const zoomOut = () => {
    if (zoomLevel > 1) {
      setZoomLevel((prev) => prev - 0.5);
      // Reset drag offset if we're back to zoom level 1
      if (zoomLevel <= 1.5) {
        setDragOffset({ x: 0, y: 0 });
      }
    }
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
  };

  // Dragging handlers for gallery
  const handleDragStart = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleDragMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      // Calculate boundaries based on zoom level
      const maxOffset = (zoomLevel - 1) * 200; // Adjust this value based on your image size

      // Calculate new offsets with boundaries
      const newOffsetX = Math.min(maxOffset, Math.max(-maxOffset, dragOffset.x + deltaX));
      const newOffsetY = Math.min(maxOffset, Math.max(-maxOffset, dragOffset.y + deltaY));

      setDragOffset({
        x: newOffsetX,
        y: newOffsetY
      });

      setDragStart({
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Handle keyboard navigation for gallery
  const handleKeyDown = (e) => {
    if (galleryOpen) {
      switch (e.key) {
        case 'ArrowLeft':
          goToPreviousImage();
          break;
        case 'ArrowRight':
          goToNextImage();
          break;
        case 'Escape':
          setGalleryOpen(false);
          resetZoom();
          break;
        case '+':
          zoomIn();
          break;
        case '-':
          zoomOut();
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [galleryOpen, product]);

  // Reset zoom and drag when changing images
  useEffect(() => {
    resetZoom();
  }, [selectedImage]);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        const data = await fetchProductById(id);
        if (!data) {
          throw new Error("Product not found");
        }
        setProduct(data);

        // Update document title with product name
        document.title = `${data.title} - Product Details`;
      } catch (err) {
        setError(err.message);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    loadProduct();

    // Clean up to reset the title when the component unmounts
    // return () => {
    //   document.title = "E-Commerce App"; // Replace with your app's default title
    // };
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
    if (result.type === "same-day") {
      toast.success("Same day delivery available!");
    } else {
      toast.success(`Delivery estimated by ${result.estimatedDate}`);
    }
  };

  const handleAddToCart = () => {
    addToCart(product);
    toast.success(`${product.title} added to cart`, {
      description: `Price: $${product.price.toFixed(2)}`,
      position: "bottom-right",
    });
  };

  const goToCart = () => {
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-stone-800" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Product
        </h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto px-4 py-8">
      <Toaster richColors />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery with Left Thumbnails */}
        <div className="flex gap-4">
          {/* Thumbnails Column */}
          <div className="flex flex-col gap-2 w-14">
            {product.images.map((image, index) => (
              <div
                key={index}
                className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
                  selectedImage === index
                    ? "border-neutral-400 p-0.5"
                    : "border-transparent"
                } hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors`}
                onClick={() => setSelectedImage(index)}
              >
                <img
                  src={image}
                  alt={`${product.title} ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>

          {/* Main Image */}
          <div className="flex-1">
            <div
              ref={imageContainerRef}
              className="border border-neutral-200 dark:border-neutral-500 aspect-square w-full rounded-lg overflow-hidden relative cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              onClick={() => setGalleryOpen(true)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.title}
                className={`w-full h-full object-contain transition-transform duration-200 ${
                  isZoomed ? "scale-200" : "scale-100"
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }
                    : undefined
                }
              />
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs">
                Click to expand
              </div>
            </div>
          </div>
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {product.title}
            </h1>
            <div className="flex items-center mt-2">
              <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              <span className="ml-1 text-gray-600 dark:text-gray-300">
                {product.rating}
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({product.stock} items in stock)
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-baseline space-x-4">
              <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                ${product.price.toFixed(2)}
              </p>
              {product.discountPercentage > 0 && (
                <p className="text-lg text-green-600">
                  {product.discountPercentage}% OFF
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">Brand: {product.brand}</p>
            <p className="text-xs text-yellow-500">GST Excluded</p>

            {/* Add to Cart Button */}
            {!isInCart ? (
              <Button
                onClick={handleAddToCart}
                className="w-fit bg-yellow-500 hover:bg-yellow-600 text-neutral-700 hover:text-neutral-50"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            ) : (
              <Button
                onClick={goToCart}
                className="w-fit bg-yellow-500 hover:bg-yellow-600 text-neutral-700 hover:text-neutral-50"
              >
                <span className="max-l:text-xs">Go to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Tabs defaultValue="description" className="w-full">
            <TabsList>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Details</TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                {product.description}
              </p>
            </TabsContent>

            <TabsContent value="specifications" className="mt-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Brand</span>
                  <span className="text-gray-600">{product.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Category</span>
                  <span className="text-gray-600">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Availability</span>
                  <span className="text-gray-600">
                    {product.stock} items in stock
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Rating</span>
                  <span className="text-gray-600">{product.rating}/5</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Delivery Check - Modified */}
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <Input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) =>
                  setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    checkDelivery();
                  }
                }}
                className="w-40 dark:ring-zinc-400"
              />
              <Button onClick={checkDelivery} variant="outline" className="rounded-md dark:bg-stone-800">
                Check
              </Button>
            </div>
            {deliveryDate && (
              <div className="mt-4 flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>Estimated delivery by {deliveryDate}</span>
              </div>
            )}
          </div>

          {/* Offers - Modified */}
          <div className="border-2 border-neutral-200 dark:border-neutral-700 rounded-xl p-4">
            <h3 className="text-lg font-semibold mb-4">Available Offers</h3>
            <ul className="space-y-3">
              {product.discountPercentage > 0 && (
                <li className="flex items-center">
                  <Package className="w-4 h-4 mr-2" />
                  <span>
                    Special discount of {product.discountPercentage}% applied
                  </span>
                </li>
              )}
              <li className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                <span>Free shipping on orders above $999</span>
              </li>
              <li className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                <span>Express delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Full-screen Image Gallery Modal */}
      {galleryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Gallery Toolbar */}
            <div className="flex justify-between items-center p-4 text-white">
              <div className="flex items-center space-x-2">
                <button 
                  onClick={zoomIn} 
                  className="p-2 rounded-full hover:bg-gray-800 transition"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
                <button 
                  onClick={zoomOut} 
                  className="p-2 rounded-full hover:bg-gray-800 transition"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-6 h-6" />
                </button>
                <span className="text-sm ml-2">{Math.round(zoomLevel * 100)}%</span>
              </div>
              <button 
                onClick={() => {
                  setGalleryOpen(false);
                  resetZoom();
                }} 
                className="p-2 rounded-full hover:bg-gray-800 transition"
                aria-label="Close gallery"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Gallery Main Area */}
            <div 
              className="flex-1 flex items-center justify-center overflow-hidden"
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{ cursor: zoomLevel > 1 ? isDragging ? 'grabbing' : 'grab' : 'default' }}
            >
              <div 
                ref={galleryImageRef}
                className="relative"
                style={{
                  transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease'
                }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="max-h-screen max-w-screen object-contain"
                />
              </div>
            </div>

            {/* Image Navigation */}
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 p-4">
              <button 
                onClick={goToPreviousImage} 
                className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 p-4">
              <button 
                onClick={goToNextImage} 
                className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="p-4 flex justify-center">
              <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index ? "border-white" : "border-transparent"
                    } hover:border-gray-400 transition-colors`}
                    onClick={() => {
                      setSelectedImage(index);
                      resetZoom();
                    }}
                  >
                    <img
                      src={image}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;