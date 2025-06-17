import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const intervalRef = useRef(null);

  const slides = [
    {
      title: "Timeless Treasures, Handcrafted for You",
      subtitle: "Where Elegance Meets Artistry",
      image: "/ban.webp",
    },
    {
      title: "Discover Unique Artisan Creations",
      subtitle: "Each Piece Tells a Story",
      image: "/ring.webp",
    },
    {
      title: "Premium Quality Craftsmanship",
      subtitle: "Expertly Made with Passion and Care",
      image: "/b3.webp",
    },
  ];

  // Function to reset the auto-advance timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(nextSlide, 7500);
  };

  const nextSlide = () => {
    setDirection(1);
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  // Handle touch events for drag gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchCurrent(e.targetTouches[0].clientX);
    setIsDragging(true);
    setDragOffset(0);
    // Reset timer when touch is detected
    resetTimer();
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    
    const currentTouch = e.targetTouches[0].clientX;
    setTouchCurrent(currentTouch);
    
    // Calculate drag offset as percentage of screen width
    const dragDistance = currentTouch - touchStart;
    const screenWidth = window.innerWidth;
    const offsetPercentage = (dragDistance / screenWidth) * 100;
    
    // Limit drag to reasonable bounds (-60% to 60%)
    const boundedOffset = Math.max(-60, Math.min(60, offsetPercentage));
    setDragOffset(boundedOffset);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    
    setIsDragging(false);
    const dragDistance = touchCurrent - touchStart;
    const threshold = 75; // minimum distance to trigger slide change
    
    if (Math.abs(dragDistance) > threshold) {
      if (dragDistance < 0) {
        // Swipe left - next slide
        nextSlide();
      } else {
        // Swipe right - previous slide
        prevSlide();
      }
    }
    
    // Reset drag offset
    setDragOffset(0);
    // Reset timer after swipe action
    resetTimer();
  };

  // Auto advance slides every 7.5 seconds
  useEffect(() => {
    intervalRef.current = setInterval(nextSlide, 7500);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative overflow-hidden dark:bg-cornsilk-d1 py-0.5 md:py-12 select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container with fixed height to prevent layout shifts */}
      <div className="relative h-full min-h-96">
        {/* Carousel Slides */}
        {slides.map((slide, index) => {
          // Calculate transform based on slide position and drag offset
          let transform = '';
          let opacity = 1;
          
          if (isDragging) {
            // Calculate relative position for each slide during drag
            const relativeIndex = (index - currentSlide + slides.length) % slides.length;
            const dragPercent = dragOffset;
            
            if (relativeIndex === 0) {
              // Current slide
              transform = `translateX(${dragPercent}%)`;
              opacity = Math.max(0.3, 1 - Math.abs(dragPercent) / 150);
            } else if (relativeIndex === 1) {
              // Next slide (appears when dragging left)
              const slidePosition = 100 + dragPercent;
              transform = `translateX(${slidePosition}%)`;
              opacity = dragPercent < 0 ? Math.min(1, Math.abs(dragPercent) / 50) : 0;
            } else if (relativeIndex === slides.length - 1) {
              // Previous slide (appears when dragging right)
              const slidePosition = -100 + dragPercent;
              transform = `translateX(${slidePosition}%)`;
              opacity = dragPercent > 0 ? Math.min(1, Math.abs(dragPercent) / 50) : 0;
            } else {
              // Other slides stay hidden
              transform = index > currentSlide ? 'translateX(100%)' : 'translateX(-100%)';
              opacity = 0;
            }
          } else {
            // Smooth slide transitions with spring-like easing
            const slidePosition = index - currentSlide;
            
            if (slidePosition === 0) {
              // Current slide
              transform = 'translateX(0%) scale(1)';
              opacity = 1;
            } else if (slidePosition === 1 || slidePosition === -(slides.length - 1)) {
              // Next slide
              transform = 'translateX(100%) scale(0.95)';
              opacity = 0;
            } else if (slidePosition === -1 || slidePosition === slides.length - 1) {
              // Previous slide
              transform = 'translateX(-100%) scale(0.95)';
              opacity = 0;
            } else {
              // Other slides
              transform = slidePosition > 0 ? 'translateX(100%) scale(0.9)' : 'translateX(-100%) scale(0.9)';
              opacity = 0;
            }
          }

          return (
            <section
              key={index}
              className={`absolute top-0 left-0 w-full h-full ${
                isDragging ? 'transition-none' : 'transition-all duration-700 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]'
              }`}
              style={{
                transform,
                opacity,
              }}
            >
              {/* Mobile: Background Image + Overlay + Content */}
              <div
                className="md:hidden relative w-full h-full flex flex-col justify-center items-center bg-cover bg-center p-6"
                style={{
                  backgroundImage: `url(${slide.image})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                }}
              >
                {/* Dark overlay for better text visibility */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent"></div>

                {/* Content on top of background */}
                <div className="relative z-0 text-left backdrop-opacity-100 backdrop-blur-xs rounded-md p-4 max-w-2xl">
                  <h1 className="text-xl sm:text-3xl font-bold leading-12 text-white">
                    {slide.title}
                  </h1>
                  <p className="text-lg sm:text-xl max-w-2xl text-left leading-8 font-semibold text-white/90">
                    {slide.subtitle}
                  </p>
                  <div className="space-x-4 py-1.5 flex items-center">
                    <Link
                      to="/collections"
                      className="relative px-4 py-2 text-sm bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl transition duration-75 group"
                    >
                      <span className="relative">
                        Shop Now
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Desktop: Side-by-side Layout */}
              <div className="hidden md:flex justify-around items-center p-10 px-20 h-full">
                {/* Content Side */}
                <div className="text-left py-10 z-10 max-w-2xl">
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    {slide.title}
                  </h1>
                  <p className="text-2xl mb-8 max-w-2xl font-semibold">
                    {slide.subtitle}
                  </p>
                  <div className="space-x-4 py-5 flex items-center justify-start">
                    <Link
                      to="/products"
                      className="relative px-6 py-3 text-base bg-yellow-500 hover:bg-yellow-400 text-black dark:text-white rounded-xl transition duration-75 group"
                    >
                      <span className="relative">
                        Shop Now
                        <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-black dark:bg-white transition-all duration-300 group-hover:w-full"></span>
                      </span>
                    </Link>
                  </div>
                </div>

                {/* Image Side - only visible on desktop */}
                <div className="relative select-none h-80 w-80 lg:h-96 lg:w-96">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="h-full w-full object-cover select-none rounded-xl shadow-xl"
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Carousel Controls - Bottom Right, with responsive positioning */}
      <div className="absolute bottom-4 md:bottom-0 right-4 md:right-6 flex items-center space-x-1 md:space-x-2 sm:bg-transparent bg-black/15 backdrop-blur-sm md:backdrop-blur-none p-1 md:p-0 rounded-full z-1">
        <button
          onClick={() => {
            prevSlide();
            resetTimer();
          }}
          className="hidden md:block p-1 md:p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors duration-200"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} className="hidden md:block" />
        </button>

        <button
          onClick={() => {
            nextSlide();
            resetTimer();
          }}
          className="hidden md:block p-1 md:p-1.5 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors duration-200"
          aria-label="Next slide"
        >
          <ChevronRight size={20} className="hidden md:block" />
        </button>

        <div className="flex items-center justify-center rounded-full px-3 py-1 md:px-3 md:py-1">
          <span className="md:text-cornsilk-dark dark:md:text-neutral-200 text-neutral-200 text-xs md:text-sm font-medium">
            <span className="md:text-black dark:md:text-white text-white text-base md:text-xl font-bold">
              {currentSlide + 1}
            </span>
            <span className="mx-1">/</span>
            <span>{slides.length}</span>
          </span>
        </div>
      </div>
    </div>
  );
}