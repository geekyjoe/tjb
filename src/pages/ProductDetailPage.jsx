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
  const imgRef = useRef(null);
  const lensRef = useRef(null);
  const resultRef = useRef(null);

  // Added state for gallery modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const galleryImageRef = useRef(null);

  // State for the separate zoom result window
  const [showZoomResult, setShowZoomResult] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect if the device is touch-enabled
  useEffect(() => {
    const isTouchEnabled =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(isTouchEnabled);
  }, []);

  // Initialize the zoom functionality when the image is loaded or selectedImage changes
  useEffect(() => {
    if (product && imageContainerRef.current && !isTouchDevice) {
      // Clean up previous zoom elements
      cleanupZoomElements();
      // Setup new zoom elements
      setupImageZoom();
    }

    // Cleanup on unmount
    return () => {
      cleanupZoomElements();
    };
  }, [product, selectedImage, isTouchDevice]);

  // Clean up zoom elements
  const cleanupZoomElements = () => {
    if (lensRef.current && lensRef.current.parentNode) {
      lensRef.current.parentNode.removeChild(lensRef.current);
      lensRef.current = null;
    }
    if (resultRef.current && resultRef.current.parentNode) {
      resultRef.current.parentNode.removeChild(resultRef.current);
      resultRef.current = null;
    }
  };

  // Setup image zoom functionality
  const setupImageZoom = () => {
    // Create lens element
    const lens = document.createElement("div");
    lens.className =
      "absolute pointer-events-none border border-cyan-400 bg-cyan-200 opacity-40";
    lens.style.width = "100px";
    lens.style.height = "100px";
    lens.style.display = "none";
    lens.style.position = "absolute";
    lens.style.zIndex = "5";
    imageContainerRef.current.style.position = "relative";
    imageContainerRef.current.appendChild(lens);
    lensRef.current = lens;

    // Create result element
    const result = document.createElement("div");
    result.className =
      "fixed bg-white size-100 border border-gray-300 rounded-lg overflow-hidden shadow-lg z-50";
    // result.style.width = "300px";
    // result.style.height = "300px";
    result.style.display = "none";
    result.style.backgroundRepeat = "no-repeat";
    result.style.position = "absolute";
    document.body.appendChild(result);
    resultRef.current = result;
  };

  // Calculate zoom ratio and position the result window
  const calculateZoomRatio = () => {
    if (!imgRef.current || !lensRef.current || !resultRef.current)
      return { cx: 0, cy: 0 };

    const cx = resultRef.current.offsetWidth / lensRef.current.offsetWidth;
    const cy = resultRef.current.offsetHeight / lensRef.current.offsetHeight;

    return { cx, cy };
  };

  const handleMouseMove = (e) => {
    if (
      isTouchDevice ||
      !product ||
      !lensRef.current ||
      !resultRef.current ||
      !imgRef.current
    )
      return;

    e.preventDefault();

    // Show lens and result
    lensRef.current.style.display = "block";
    resultRef.current.style.display = "block";
    setShowZoomResult(true);

    // Get cursor position
    const img = imgRef.current;
    const imgRect = img.getBoundingClientRect();

    // Calculate cursor position relative to image
    let x = e.clientX - imgRect.left;
    let y = e.clientY - imgRect.top;

    // Calculate lens position
    const lensWidth = lensRef.current.offsetWidth;
    const lensHeight = lensRef.current.offsetHeight;

    x = x - lensWidth / 2;
    y = y - lensHeight / 2;

    // Constrain lens to image boundaries
    if (x > imgRect.width - lensWidth) x = imgRect.width - lensWidth;
    if (x < 0) x = 0;
    if (y > imgRect.height - lensHeight) y = imgRect.height - lensHeight;
    if (y < 0) y = 0;

    // Position the lens
    lensRef.current.style.left = x + "px";
    lensRef.current.style.top = y + "px";

    // Calculate the ratio between result div and lens
    const { cx, cy } = calculateZoomRatio();

    // Position the result area to the right of the image container
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    resultRef.current.style.left = containerRect.right + 10 + "px";
    resultRef.current.style.top = containerRect.top + "px";

    // Set the background of the result div
    resultRef.current.style.backgroundImage = `url('${product.images[selectedImage]}')`;
    resultRef.current.style.backgroundSize = `${imgRect.width * cx}px ${
      imgRect.height * cy
    }px`;
    resultRef.current.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || !lensRef.current || !resultRef.current) return;

    // Hide lens and result when mouse leaves the image
    lensRef.current.style.display = "none";
    resultRef.current.style.display = "none";
    setShowZoomResult(false);
  };

  // Gallery image navigation handlers
  const goToPreviousImage = () => {
    if (!product) return;
    setSelectedImage((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1
    );
    resetZoom();
  };

  const goToNextImage = () => {
    if (!product) return;
    setSelectedImage((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1
    );
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
        y: e.clientY,
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
      const newOffsetX = Math.min(
        maxOffset,
        Math.max(-maxOffset, dragOffset.x + deltaX)
      );
      const newOffsetY = Math.min(
        maxOffset,
        Math.max(-maxOffset, dragOffset.y + deltaY)
      );

      setDragOffset({
        x: newOffsetX,
        y: newOffsetY,
      });

      setDragStart({
        x: e.clientX,
        y: e.clientY,
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
        case "ArrowLeft":
          goToPreviousImage();
          break;
        case "ArrowRight":
          goToNextImage();
          break;
        case "Escape":
          setGalleryOpen(false);
          resetZoom();
          break;
        case "+":
          zoomIn();
          break;
        case "-":
          zoomOut();
          break;
        default:
          break;
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryOpen, product]);

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
    <div className="mx-auto px-4 py-8 bg-cornsilk dark:bg-cornsilk-d1">
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

          {/* Main Image Container - With improved mouse overlay */}
          <div className="flex-1 relative">
            <div
              ref={imageContainerRef}
              className="md:size-140 border border-neutral-200 dark:border-neutral-500 aspect-square rounded-lg overflow-hidden relative md:cursor-zoom-in"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              onClick={() => setGalleryOpen(true)}
            >
              <img
                ref={imgRef}
                src={product.images[selectedImage]}
                alt={product.title}
                className="w-full h-full object-contain"
              />

              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs">
                {isTouchDevice
                  ? "Tap to expand"
                  : "Hover to zoom, click to expand"}
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
                className="w-fit bg-yellow-500 hover:bg-yellow-400 text-neutral-700"
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </Button>
            ) : (
              <Button
                onClick={goToCart}
                className="w-fit bg-yellow-500 hover:bg-yellow-400 text-neutral-700"
              >
                <span className="max-l:text-xs">Go to Cart</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>

          <Tabs defaultValue="description" className="w-full m-0">
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

          {/* Delivery Check */}
          <div className="p-4 my-4">
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
              <Button
                onClick={checkDelivery}
                variant="outline"
                className="rounded-md dark:bg-stone-800"
              >
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

          {/* Offers */}
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
                <span>Free shipping on orders above ₹499</span>
              </li>
              <li className="flex items-center">
                <Truck className="w-4 h-4 mr-2" />
                <span>Express delivery available</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enhanced Full-screen Image Gallery Modal without pinch-to-zoom */}
      {galleryOpen && (
        <div className="fixed inset-0 bg-zinc-100 bg-opacity-90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col touch-none bg-cornsilk dark:bg-cornsilk-d1 text-black dark:text-white overflow-hidden">
            {/* Gallery Toolbar */}
            <div className="flex justify-between items-center p-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={zoomIn}
                  className="p-2 rounded-full hover:bg-gray-200 transition"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-6 h-6" />
                </button>
                <button
                  onClick={zoomOut}
                  className="p-2 rounded-full hover:bg-gray-200 transition"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-6 h-6" />
                </button>
                <span className="text-sm ml-2">
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              <div className="text-sm text-gray-500">
                {!isTouchDevice
                  ? "Use buttons to zoom"
                  : "Drag to pan when zoomed"}
              </div>
              <button
                onClick={() => {
                  setGalleryOpen(false);
                  resetZoom();
                }}
                className="p-2 rounded-full hover:bg-gray-200 transition"
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
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? "grabbing"
                      : "grab"
                    : "default",
                touchAction: "auto",
              }}
            >
              <div
                ref={galleryImageRef}
                className="relative"
                style={{
                  transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transition: isDragging ? "none" : "transform 0.2s ease",
                }}
              >
                <img
                  src={product.images[selectedImage]}
                  alt={product.title}
                  className="max-h-screen max-w-screen object-contain"
                  draggable="false" // Prevent image dragging conflicts with our custom drag
                />
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className="p-4 flex items-center justify-between">
              <button
                onClick={goToPreviousImage}
                className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="flex space-x-2 overflow-x-auto pb-2 max-w-full">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index
                        ? "border-black"
                        : "border-transparent"
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
              <button
                onClick={goToNextImage}
                className="p-3 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 text-white transition"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;