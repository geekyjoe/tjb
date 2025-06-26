import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const ProductImageGallery = ({ images, productTitle, className = '' }) => {
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [showZoomResult, setShowZoomResult] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Swipe states
  const [swipeState, setSwipeState] = useState({
    isActive: false,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    velocity: 0,
    startTime: 0,
  });

  // Touch states
  const [touchState, setTouchState] = useState({
    lastTap: 0,
    tapCount: 0,
    initialPinchDistance: 0,
    lastPinchDistance: 0,
  });

  const [clickTimeout, setClickTimeout] = useState(null);

  // Refs
  const refs = {
    imageContainer: useRef(null),
    img: useRef(null),
    lens: useRef(null),
    result: useRef(null),
    galleryImage: useRef(null),
    galleryContainer: useRef(null),
  };

  // Demo images
  const demoImages = [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&h=800&fit=crop',
    'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=800&h=800&fit=crop',
  ];

  const finalImages = images?.length ? images : demoImages;
  const finalProductTitle = productTitle || 'Product';

  // Detect touch device and handle resize
  useEffect(() => {
    const checkDevice = () => {
      setIsTouchDevice(
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      );
    };

    const handleResize = () => {
      // Reset zoom and position on resize for better UX
      if (galleryOpen) {
        resetZoom();
      }
    };

    checkDevice();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [galleryOpen]);

  // Setup zoom functionality for desktop
  useEffect(() => {
    if (
      finalImages.length > 0 &&
      refs.imageContainer.current &&
      !isTouchDevice
    ) {
      cleanupZoom();
      setupZoom();
    }
    return cleanupZoom;
  }, [finalImages, selectedImage, isTouchDevice]);

  // Body overflow control
  useEffect(() => {
    document.body.style.overflow = galleryOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [galleryOpen]);

  // Cleanup timeout
  useEffect(() => {
    return () => clickTimeout && clearTimeout(clickTimeout);
  }, [clickTimeout]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!galleryOpen) return;
      switch (e.key) {
        case 'ArrowLeft':
          navigateGallery(-1);
          break;
        case 'ArrowRight':
          navigateGallery(1);
          break;
        case 'Escape':
          closeGallery();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [galleryOpen, galleryIndex]);

  const cleanupZoom = () => {
    [refs.lens, refs.result].forEach((ref) => {
      if (ref.current?.parentNode) {
        ref.current.parentNode.removeChild(ref.current);
        ref.current = null;
      }
    });
  };

  const setupZoom = () => {
    // Create lens
    const lens = document.createElement('div');
    lens.className = 'absolute pointer-events-none bg-sky-200/25';
    Object.assign(lens.style, {
      width: '250px',
      height: '250px',
      display: 'none',
      position: 'absolute',
      zIndex: '5',
    });

    const grid = document.createElement('div');
    Object.assign(grid.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      backgroundImage:
        'radial-gradient(circle at center, rgba(59, 130, 246, 0.8) 1px, transparent 1px)',
      backgroundSize: '5px 5px',
    });

    lens.appendChild(grid);
    refs.imageContainer.current.style.position = 'relative';
    refs.imageContainer.current.appendChild(lens);
    refs.lens.current = lens;

    // Create result window
    const result = document.createElement('div');
    result.className =
      'fixed bg-white border border-gray-300 rounded-lg overflow-hidden shadow-lg z-50';
    Object.assign(result.style, {
      display: 'none',
      backgroundRepeat: 'no-repeat',
    });

    const containerRect = refs.imageContainer.current.getBoundingClientRect();
    result.style.width = `${containerRect.width}px`;
    result.style.height = `${containerRect.height - 50}px`;

    document.body.appendChild(result);
    refs.result.current = result;
  };

  const handleMouseMove = (e) => {
    if (
      isTouchDevice ||
      !finalImages.length ||
      !refs.lens.current ||
      !refs.result.current ||
      !refs.img.current ||
      isDragging
    )
      return;

    e.preventDefault();
    refs.lens.current.style.display = 'block';
    refs.result.current.style.display = 'block';
    setShowZoomResult(true);

    const img = refs.img.current;
    const imgRect = img.getBoundingClientRect();
    let x = Math.max(
      0,
      Math.min(e.clientX - imgRect.left - 125, imgRect.width - 250)
    );
    let y = Math.max(
      0,
      Math.min(e.clientY - imgRect.top - 125, imgRect.height - 250)
    );

    refs.lens.current.style.left = x + 'px';
    refs.lens.current.style.top = y + 'px';

    const containerRect = refs.imageContainer.current.getBoundingClientRect();
    const cx = refs.result.current.offsetWidth / 250;
    const cy = refs.result.current.offsetHeight / 250;

    Object.assign(refs.result.current.style, {
      left: containerRect.right + 10 + 'px',
      top: containerRect.top + 'px',
      backgroundImage: `url('${finalImages[selectedImage]}')`,
      backgroundSize: `${imgRect.width * cx}px ${imgRect.height * cy}px`,
      backgroundPosition: `-${x * cx}px -${y * cy}px`,
    });
  };

  const handleMouseLeave = () => {
    if (isTouchDevice || !refs.lens.current || !refs.result.current) return;
    refs.lens.current.style.display = 'none';
    refs.result.current.style.display = 'none';
    setShowZoomResult(false);
  };

  const navigateMain = (direction) => {
    const newIndex =
      direction > 0
        ? (selectedImage + 1) % finalImages.length
        : (selectedImage - 1 + finalImages.length) % finalImages.length;
    setSelectedImage(newIndex);
  };

  // Simplified navigation with CSS transitions
  const navigateGallery = (direction) => {
    const newIndex =
      direction > 0
        ? (galleryIndex + 1) % finalImages.length
        : (galleryIndex - 1 + finalImages.length) % finalImages.length;

    if (newIndex === galleryIndex) return;

    setGalleryIndex(newIndex);
    resetZoom();
  };

  const openGallery = () => {
    setGalleryIndex(selectedImage);
    setGalleryOpen(true);
    resetZoom();
  };

  const closeGallery = () => {
    setGalleryOpen(false);
    resetZoom();
  };

  const resetZoom = () => {
    setZoomLevel(1);
    setDragOffset({ x: 0, y: 0 });
  };

  const getTouchDistance = (t1, t2) =>
    Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2);

  const handleClick = (e) => {
    if (isTouchDevice || isDragging) return;

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    const timeout = setTimeout(() => {
      // Only proceed if we haven't started dragging
      if (!isDragging) {
        if (zoomLevel > 1) {
          resetZoom();
        } else {
          setZoomLevel(2);
          const rect = refs.galleryImage.current?.getBoundingClientRect();
          if (rect) {
            const x = ((e.clientX - rect.left) / rect.width - 0.5) * -100;
            const y = ((e.clientY - rect.top) / rect.height - 0.5) * -100;
            setDragOffset({
              x: Math.max(-200, Math.min(200, x)),
              y: Math.max(-200, Math.min(200, y)),
            });
          }
        }
      }
      setClickTimeout(null);
    }, 100);

    setClickTimeout(timeout);
  };

  const handleDoubleClick = (e) => {
    if (isTouchDevice || isDragging) return;

    if (clickTimeout) {
      clearTimeout(clickTimeout);
      setClickTimeout(null);
    }

    if (zoomLevel > 1) {
      resetZoom();
    } else {
      setZoomLevel(3);
      const rect = refs.galleryImage.current?.getBoundingClientRect();
      if (rect) {
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * -150;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -150;
        setDragOffset({
          x: Math.max(-300, Math.min(300, x)),
          y: Math.max(-300, Math.min(300, y)),
        });
      }
    }
  };

  const handleGestureStart = (e) => {
    const isTouch = e.type.includes('touch');
    const touches = e.touches;
    const clientX = isTouch
      ? touches?.[0]?.clientX || e.changedTouches?.[0]?.clientX
      : e.clientX;
    const clientY = isTouch
      ? touches?.[0]?.clientY || e.changedTouches?.[0]?.clientY
      : e.clientY;
    const currentTime = Date.now();

    // Handle pinch start
    if (isTouch && touches.length === 2) {
      const distance = getTouchDistance(touches[0], touches[1]);
      setTouchState((prev) => ({
        ...prev,
        initialPinchDistance: distance,
        lastPinchDistance: distance,
      }));
      return;
    }

    // Handle drag start for zoom
    if (zoomLevel > 1) {
      setIsDragging(true);
      setSwipeState((prev) => ({ ...prev, startX: clientX, startY: clientY }));

      // Clear any pending click timeouts when starting to drag
      if (clickTimeout) {
        clearTimeout(clickTimeout);
        setClickTimeout(null);
      }
      return;
    }

    // Handle swipe start
    setSwipeState({
      isActive: true,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      velocity: 0,
      startTime: currentTime,
    });

    if (!isTouch) e.preventDefault();
  };

  const handleGestureMove = (e) => {
    const isTouch = e.type.includes('touch');
    const touches = e.touches;
    const clientX = isTouch
      ? touches?.[0]?.clientX || e.changedTouches?.[0]?.clientX
      : e.clientX;
    const clientY = isTouch
      ? touches?.[0]?.clientY || e.changedTouches?.[0]?.clientY
      : e.clientY;

    if (isTouch) e.preventDefault();

    // Handle pinch zoom
    if (
      isTouch &&
      touches.length === 2 &&
      touchState.initialPinchDistance > 0
    ) {
      const currentDistance = getTouchDistance(touches[0], touches[1]);
      const newZoom = Math.min(
        4,
        Math.max(
          1,
          zoomLevel * (currentDistance / touchState.lastPinchDistance)
        )
      );
      setZoomLevel(newZoom);
      setTouchState((prev) => ({
        ...prev,
        lastPinchDistance: currentDistance,
      }));
      if (newZoom <= 1) setDragOffset({ x: 0, y: 0 });
      return;
    }

    // Handle zoom drag
    if (zoomLevel > 1 && isDragging) {
      const deltaX = clientX - swipeState.startX;
      const deltaY = clientY - swipeState.startY;
      const maxOffset = (zoomLevel - 1) * 200;

      setDragOffset({
        x: Math.min(maxOffset, Math.max(-maxOffset, dragOffset.x + deltaX)),
        y: Math.min(maxOffset, Math.max(-maxOffset, dragOffset.y + deltaY)),
      });
      setSwipeState((prev) => ({ ...prev, startX: clientX, startY: clientY }));
      return;
    }

    // Handle swipe for navigation
    if (swipeState.isActive && zoomLevel === 1) {
      const deltaX = clientX - swipeState.startX;
      const deltaY = clientY - swipeState.startY;
      const currentTime = Date.now();
      const velocity =
        (clientX - swipeState.currentX) /
        Math.max(1, currentTime - swipeState.startTime);

      setSwipeState((prev) => ({
        ...prev,
        currentX: clientX,
        currentY: clientY,
        velocity,
      }));

      // Handle swipe down to close
      if (deltaY > 100 && Math.abs(deltaX) < 100) {
        if (refs.galleryContainer.current) {
          refs.galleryContainer.current.style.transform = `translateY(${
            deltaY * 0.5
          }px)`;
          refs.galleryContainer.current.style.opacity = Math.max(
            0.3,
            1 - deltaY / 300
          );
        }
      }
    }
  };

  const handleGestureEnd = (e) => {
    const isTouch = e.type.includes('touch');
    const clientX = isTouch ? e.changedTouches?.[0]?.clientX : e.clientX;
    const clientY = isTouch ? e.changedTouches?.[0]?.clientY : e.clientY;
    const currentTime = Date.now();

    // Handle pinch end
    if (isTouch && e.touches.length === 0) {
      setTouchState((prev) => ({ ...prev, initialPinchDistance: 0 }));
    }

    // Handle zoom drag end
    if (isDragging) {
      setIsDragging(false);
      return;
    }

    if (!swipeState.isActive) return;

    const deltaX = clientX - swipeState.startX;
    const deltaY = clientY - swipeState.startY;
    const timeDiff = currentTime - swipeState.startTime;
    const distance = Math.abs(deltaX);

    // Reset gallery container transform
    if (refs.galleryContainer.current) {
      refs.galleryContainer.current.style.transform = '';
      refs.galleryContainer.current.style.opacity = '';
      refs.galleryContainer.current.style.transition =
        'transform 300ms ease-out, opacity 300ms ease-out';
      setTimeout(() => {
        if (refs.galleryContainer.current) {
          refs.galleryContainer.current.style.transition = '';
        }
      }, 300);
    }

    // Close on swipe down
    if (isTouch && deltaY > 100 && Math.abs(deltaX) < 100 && timeDiff < 500) {
      closeGallery();
      return;
    }

    // Determine navigation with simplified logic
    const shouldNavigate =
      (Math.abs(swipeState.velocity) > 0.5 && distance > 50) ||
      distance > window.innerWidth * 0.25;

    if (shouldNavigate && Math.abs(deltaY) < 100) {
      if (deltaX > 0 && galleryIndex > 0) {
        navigateGallery(-1);
      } else if (deltaX < 0 && galleryIndex < finalImages.length - 1) {
        navigateGallery(1);
      }
    }

    // // Handle tap for zoom (fixed double tap logic)
    // if (isTouch && distance < 10 && Math.abs(deltaY) < 10 && timeDiff < 300) {
    //   handleTouchTap();
    // }

    setSwipeState({
      isActive: false,
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      velocity: 0,
      startTime: 0,
    });
  };

  // Fixed double tap logic for touch devices
  //   const handleTouchTap = () => {
  //     const currentTime = Date.now();

  //     if (currentTime - touchState.lastTap < 300) {
  //       // Double tap detected
  //       if (zoomLevel > 1) {
  //         resetZoom();
  //       } else {
  //         setZoomLevel(2.5);
  //       }
  //       setTouchState((prev) => ({
  //         ...prev,
  //         lastTap: 0, // Reset to prevent triple tap issues
  //         tapCount: 0,
  //       }));
  //     } else {
  //       // Single tap
  //       setTouchState((prev) => ({
  //         ...prev,
  //         lastTap: currentTime,
  //         tapCount: 1,
  //       }));
  //     }
  //   };

  const handleTouchEndSimple = (e) => {
    // Only handle single finger taps
    if (e.changedTouches.length !== 1) return;

    const touch = e.changedTouches[0];
    const currentTime = Date.now();

    // Check if this is a quick tap (not a drag)
    const timeDiff = currentTime - swipeState.startTime;
    const deltaX = touch.clientX - swipeState.startX;
    const deltaY = touch.clientY - swipeState.startY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Only process if it's a tap (short time, small movement)
    if (timeDiff < 300 && distance < 10) {
      const timeSinceLastTap = currentTime - (touchState.lastTap || 0);

      if (timeSinceLastTap < 400) {
        // Double tap detected
        console.log('Double tap detected!'); // Debug log

        if (zoomLevel > 1) {
          // Zoom out
          console.log('Zooming out');
          resetZoom();
        } else {
          // Zoom in at tap location
          console.log('Zooming in');
          const rect = refs.galleryImage.current?.getBoundingClientRect();
          if (rect) {
            const x = ((touch.clientX - rect.left) / rect.width - 0.5) * -150;
            const y = ((touch.clientY - rect.top) / rect.height - 0.5) * -150;

            setZoomLevel(2.5);
            setDragOffset({
              x: Math.max(-300, Math.min(300, x)),
              y: Math.max(-300, Math.min(300, y)),
            });
          } else {
            setZoomLevel(2.5);
          }
        }

        // Reset tap state
        setTouchState((prev) => ({ ...prev, lastTap: 0 }));
      } else {
        // Single tap - record the time
        console.log('Single tap recorded');
        setTouchState((prev) => ({ ...prev, lastTap: currentTime }));
      }
    }
  };

  if (!finalImages?.length) return null;

  return (
    <div className={`flex gap-4 ${className}`}>
      {/* Thumbnails */}
      <div className='flex flex-col gap-2 w-14'>
        {finalImages.map((image, index) => (
          <div
            key={index}
            className={`aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${
              selectedImage === index
                ? 'border-neutral-400 p-0.5'
                : 'border-transparent hover:border-neutral-300 dark:hover:border-neutral-500'
            }`}
            onClick={() => setSelectedImage(index)}
          >
            <img
              src={image}
              alt={`${finalProductTitle} ${index + 1}`}
              className='w-full h-full object-cover'
            />
          </div>
        ))}
      </div>

      {/* Main Image */}
      <div className='flex-1 relative'>
        <div
          ref={refs.imageContainer}
          className='border border-neutral-200 dark:border-neutral-500 aspect-square rounded-lg overflow-hidden relative cursor-pointer'
          onMouseLeave={handleMouseLeave}
          onMouseMove={!isTouchDevice ? handleMouseMove : undefined}
          onClick={openGallery}
        >
          <img
            ref={refs.img}
            src={finalImages[selectedImage]}
            alt={finalProductTitle}
            className='size-full object-contain transition-all duration-300'
            draggable={false}
          />
          <div className='absolute bottom-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded text-xs'>
            {isTouchDevice ? 'Tap to expand' : 'Click to expand'}
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {galleryOpen && (
        <div className='fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center'>
          <div className='relative w-full h-full flex flex-col touch-none text-white overflow-hidden'>
            {/* Header */}
            <div className='flex justify-between items-center p-4'>
              <div className='flex gap-1'>
                <span>{galleryIndex + 1}</span>
                <span className='text-sm'>/</span>
                <span>{finalImages.length}</span>
              </div>
              <div className='text-xs text-white/70 max-w-md text-center'>
                {isTouchDevice
                  ? 'Swipe • Pinch zoom • Double tap • Swipe down to close'
                  : 'Click zoom • Double click 3x • Arrow keys • ESC to close'}
              </div>
              <button
                onClick={closeGallery}
                className='p-2 rounded-full text-white/75 hover:text-white bg-black/50 hover:bg-black/70 transition'
              >
                <X className='size-6' />
              </button>
            </div>

            {/* Main Gallery */}
            <div
              ref={refs.galleryContainer}
              className='relative flex-1 flex items-center justify-center overflow-hidden'
            >
              {/* Navigation Buttons */}
              {galleryIndex > 0 && (
                <button
                  onClick={() => navigateGallery(-1)}
                  className='absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition text-white/75 hover:text-white'
                >
                  <ChevronLeft className='w-6 h-6' />
                </button>
              )}
              {galleryIndex < finalImages.length - 1 && (
                <button
                  onClick={() => navigateGallery(1)}
                  className='absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-black/50 hover:bg-black/70 transition text-white/75 hover:text-white'
                >
                  <ChevronRight className='w-6 h-6' />
                </button>
              )}

              {/* Image Container */}
           <div
                className='relative w-full h-full flex items-center justify-center'
                onMouseDown={!isTouchDevice ? handleGestureStart : undefined}
                onMouseMove={!isTouchDevice ? handleGestureMove : undefined}
                onMouseUp={!isTouchDevice ? handleGestureEnd : undefined}
                onMouseLeave={!isTouchDevice ? handleGestureEnd : undefined}
                onTouchStart={isTouchDevice ? handleGestureStart : undefined}
                onTouchMove={isTouchDevice ? handleGestureMove : undefined}
                onTouchEnd={isTouchDevice ? (e) => {
                  handleGestureEnd(e);
                  handleTouchEndSimple(e);
                } : undefined}
                onClick={!isTouchDevice ? handleClick : undefined}
                onDoubleClick={!isTouchDevice ? handleDoubleClick : undefined}
                style={{
                  cursor:
                    zoomLevel > 1
                      ? isDragging
                        ? 'grabbing'
                        : 'grab'
                      : 'zoom-in',
                  touchAction: 'none',
                }}
              >
                <div
                  className='transition-transform duration-200 ease-out'
                  style={{
                    transform: `scale(${zoomLevel}) translate(${dragOffset.x}px, ${dragOffset.y}px)`,
                    transition: isDragging
                      ? 'none'
                      : 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <img
                    ref={refs.galleryImage}
                    src={finalImages[galleryIndex]}
                    alt={finalProductTitle}
                    className='max-h-[80vh] max-w-[90vw] object-contain select-none transition-opacity duration-300'
                    draggable={false}
                    key={galleryIndex} // Force re-render for smoother transitions
                  />
                </div>
              </div>
            </div>

            {/* Thumbnail Navigation */}
            <div className='p-4'>
              <div className='flex items-center justify-center'>
                <div className='flex space-x-2 overflow-x-auto pb-2 max-w-full'>
                  {finalImages.map((image, index) => (
                    <div
                      key={index}
                      className={`w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 transition-all duration-200 flex-shrink-0 ${
                        galleryIndex === index
                          ? 'border-white shadow-lg'
                          : 'border-transparent hover:border-white/50'
                      }`}
                      onClick={() => {
                        if (index !== galleryIndex) {
                          setGalleryIndex(index);
                          resetZoom();
                        }
                      }}
                    >
                      <img
                        src={image}
                        alt={`${finalProductTitle} ${index + 1}`}
                        className='w-full h-full object-cover'
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;
