import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, X } from 'lucide-react';

const ProductImageGallery = ({ images, productTitle, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
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
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      navigator.msMaxTouchPoints > 0;

    setIsTouchDevice(isTouchEnabled);
  }, []);

  // Initialize the zoom functionality when the image is loaded or selectedImage changes
  useEffect(() => {
    if (images.length > 0 && imageContainerRef.current && !isTouchDevice) {
      // Clean up previous zoom elements
      cleanupZoomElements();
      // Setup new zoom elements
      setupImageZoom();
    }

    // Cleanup on unmount
    return () => {
      cleanupZoomElements();
    };
  }, [images, selectedImage, isTouchDevice]);

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
    const lens = document.createElement('div');
    lens.className =
      'absolute pointer-events-none bg-sky-200/25';
    lens.style.width = '250px';
    lens.style.height = '250px';
    lens.style.display = 'none';
    lens.style.position = 'absolute';
    lens.style.zIndex = '5';

    // Create grid overlay
    const grid = document.createElement('div');
    grid.style.position = 'absolute';
    grid.style.top = '0';
    grid.style.left = '0';
    grid.style.width = '100%';
    grid.style.height = '100%';
    grid.style.pointerEvents = 'none';
    grid.style.zIndex = '6';

    // Create dot grid using CSS
    grid.style.backgroundImage = `
    radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 1px, transparent 1px)
  `;
    grid.style.backgroundSize = '5px 5px'; // 10x10 dot grid (250px / 25px = 10 dots per row/column)

    // Append grid to lens
    lens.appendChild(grid);

    imageContainerRef.current.style.position = 'relative';
    imageContainerRef.current.appendChild(lens);
    lensRef.current = lens;

    // Create result element
    const result = document.createElement('div');
    result.className =
      'fixed bg-white size-100 border border-gray-300 rounded-lg overflow-hidden shadow-lg z-50';
    result.style.display = 'none';
    result.style.backgroundRepeat = 'no-repeat';

    const containerRect = imageContainerRef.current.getBoundingClientRect();
    result.style.width = `${containerRect.width}px`;
    result.style.height = `${containerRect.height - 50}px`;

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
      !images.length ||
      !lensRef.current ||
      !resultRef.current ||
      !imgRef.current
    )
      return;

    e.preventDefault();

    // Show lens and result
    lensRef.current.style.display = 'block';
    resultRef.current.style.display = 'block';
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
    lensRef.current.style.left = x + 'px';
    lensRef.current.style.top = y + 'px';

    // Calculate the ratio between result div and lens
    const { cx, cy } = calculateZoomRatio();

    // Position the result area to the right of the image container
    const containerRect = imageContainerRef.current.getBoundingClientRect();
    resultRef.current.style.left = containerRect.right + 10 + 'px';
    resultRef.current.style.top = containerRect.top + 'px';

    // Set the background of the result div
    resultRef.current.style.backgroundImage = `url('${images[selectedImage]}')`;
    resultRef.current.style.backgroundSize = `${imgRect.width * cx}px ${
      imgRect.height * cy
    }px`;
    resultRef.current.style.backgroundPosition = `-${x * cx}px -${y * cy}px`;
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || !lensRef.current || !resultRef.current) return;

    // Hide lens and result when mouse leaves the image
    lensRef.current.style.display = 'none';
    resultRef.current.style.display = 'none';
    setShowZoomResult(false);
  };

  // Gallery image navigation handlers
  const goToPreviousImage = () => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    resetZoom();
  };

  const goToNextImage = () => {
    if (!images.length) return;
    setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
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
  }, [galleryOpen, images]);

  useEffect(() => {
    if (galleryOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    // Cleanup in case the component unmounts while modal is open
    return () => {
      document.body.style.overflow = '';
    };
  }, [galleryOpen]);

  // Return null if no images
  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Thumbnails Column */}
      <div className='flex flex-col gap-2 w-14'>
        {images.map((image, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 ${
              selectedImage === index
                ? 'border-neutral-400 p-0.5'
                : 'border-transparent'
            } hover:border-neutral-300 dark:hover:border-neutral-500 transition-colors`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`${productTitle} ${index + 1}`}
              className='w-full h-full object-cover'
            />
          </div>
        ))}
      </div>

      {/* Main Image Container - With improved mouse overlay */}
      <div className='flex-1 relative'>
        <div
          ref={imageContainerRef}
          className='border border-neutral-200 dark:border-neutral-500 aspect-square rounded-lg overflow-hidden relative md:cursor-zoom-in'
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => setGalleryOpen(true)}
        >
          <img
            ref={imgRef}
            src={images[selectedImage]}
            alt={productTitle}
            className='size-full object-contain'
          />

          <div className='absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs'>
            {isTouchDevice ? 'Tap to expand' : 'Hover to zoom, click to expand'}
          </div>
        </div>
      </div>

      {/* Enhanced Full-screen Image Gallery Modal */}
      {galleryOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center'>
          <div className='relative w-full h-full flex flex-col touch-none text-black dark:text-white overflow-hidden'>
            {/* Gallery Toolbar */}
            <div className='flex justify-between items-center p-4'>
              <div className='flex items-center space-x-2'>
                <button
                  onClick={zoomIn}
                  className='p-2 rounded-full text-white/75 hover:text-white bg-black/50 hover:bg-black transition'
                  aria-label='Zoom in'
                >
                  <ZoomIn className='size-5 md:size-6' />
                </button>
                <button
                  onClick={zoomOut}
                  className='p-2 rounded-full text-white/75 hover:text-white bg-black/50 hover:bg-black transition'
                  aria-label='Zoom out'
                >
                  <ZoomOut className='size-5 md:size-6' />
                </button>
                <span className='text-sm ml-2 text-white'>
                  {Math.round(zoomLevel * 100)}%
                </span>
              </div>
              <div className='text-sm text-white/69'>
                {!isTouchDevice
                  ? 'Use buttons to zoom'
                  : 'Drag to pan when zoomed'}
              </div>
              <button
                onClick={() => {
                  setGalleryOpen(false);
                  resetZoom();
                }}
                className='p-2 rounded-full text-white/75 hover:text-white bg-black/50 hover:bg-black transition'
                aria-label='Close gallery'
              >
                <X className='size-5 md:size-6' />
              </button>
            </div>

            {/* Gallery Main Area */}
            <div
              className='relative mx-1 flex-1 flex items-center justify-center overflow-hidden'
              onMouseDown={handleDragStart}
              onMouseMove={handleDragMove}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              style={{
                cursor:
                  zoomLevel > 1
                    ? isDragging
                      ? 'grabbing'
                      : 'grab'
                    : 'default',
                touchAction: 'auto',
              }}
            >
              <div className='absolute bottom-50% top-50% left-0 p-2'>
                {images.length > 1 && (
                  <button
                    onClick={goToPreviousImage}
                    className='p-1.5 md:p-3 rounded-full bg-black/50 hover:bg-black transition-all duration-400 hover:text-white text-white/75 z-100'
                    aria-label='Previous image'
                  >
                    <ChevronLeft className='w-6 h-6' />
                  </button>
                )}
              </div>
              <div
                ref={galleryImageRef}
                className='relative z-40'
                style={{
                  transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                  transition: isDragging ? 'none' : 'transform 0.2s ease',
                }}
              >
                <img
                  src={images[selectedImage]}
                  alt={productTitle}
                  className='max-h-140 max-w-140 object-contain'
                  draggable='false' // Prevent image dragging conflicts with our custom drag
                />
              </div>
              <div className='absolute bottom-50% top-50% right-0 p-2'>
                {images.length > 1 && (
                  <button
                    onClick={goToNextImage}
                    className='p-1.5 md:p-3 rounded-full bg-black/50 hover:bg-black transition-all duration-400 hover:text-white text-white/75 z-100'
                    aria-label='Next image'
                  >
                    <ChevronRight className='w-6 h-6' />
                  </button>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className='p-4 flex items-center justify-center'>
              <div className='flex space-x-2 overflow-x-auto pb-2 max-w-full'>
                {images.map((image, index) => (
                  <div
                    key={index}
                    className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedImage === index
                        ? 'border-white'
                        : 'border-transparent hover:border-white/75'
                    } transition-colors`}
                    onClick={() => {
                      setSelectedImage(index);
                      resetZoom();
                    }}
                  >
                    <img
                      src={image}
                      alt={`${productTitle} thumbnail ${index + 1}`}
                      className='w-full h-full object-cover'
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

export default ProductImageGallery;