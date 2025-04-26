import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const slides = [
    {
      title: "Timeless Treasures, Handcrafted for You",
      subtitle: "Where Elegance Meets Artistry",
      image: "/ban.png",
    },
    {
      title: "Discover Unique Artisan Creations",
      subtitle: "Each Piece Tells a Story",
      image: "/ring.png",
    },
    {
      title: "Premium Quality Craftsmanship",
      subtitle: "Expertly Made with Passion and Care",
      image: "/b3.png",
    },
  ];

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

  // Handle touch events for swipe gestures
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swipe left
      nextSlide();
    }

    if (touchEnd - touchStart > 75) {
      // Swipe right
      prevSlide();
    }
  };

  // Auto advance slides every 5 seconds
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="relative overflow-hidden py-2 md:py-12 "
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Container with fixed height to prevent layout shifts */}
      <div className="relative h-full min-h-96">
        {/* Carousel Slides */}
        {slides.map((slide, index) => (
          <section
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-all duration-800 ease-in-out ${
              index === currentSlide
                ? "opacity-100 translate-x-0"
                : direction > 0
                ? index < currentSlide
                  ? "opacity-0 -translate-x-full"
                  : "opacity-0 translate-x-full"
                : index > currentSlide
                ? "opacity-0 translate-x-full"
                : "opacity-0 -translate-x-full"
            }`}
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
              <div className="absolute inset-0 bg-black/20"></div>

              {/* Content on top of background */}
              <div className="relative z-10 text-center backdrop-blur-sm bg-black/10 rounded-md p-4 max-w-2xl">
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
                  {slide.title}
                </h1>
                <p className="text-lg sm:text-xl mb-4 max-w-2xl text-left font-semibold text-white/90">
                  {slide.subtitle}
                </p>
                <div className="space-x-4 py-3 flex items-center justify-center">
                  <Link
                    to="/products"
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
              <div className="relative h-80 w-80 lg:h-96 lg:w-96">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="h-full w-full object-cover select-none rounded-xl shadow-md"
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Carousel Controls - Bottom Right, with responsive positioning */}
      <div className="absolute bottom-4 md:bottom-0 right-4 md:right-6 flex items-center space-x-2 md:space-x-4 bg-black/30 md:bg-black/10 backdrop-blur-sm p-1 md:p-2 rounded-full z-20">
        <button
          onClick={prevSlide}
          className="p-1 md:p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors duration-300"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} className="md:hidden" />
          <ChevronLeft size={20} className="hidden md:block" />
        </button>

        <button
          onClick={nextSlide}
          className="p-1 md:p-2 bg-black/30 hover:bg-black/50 rounded-full text-white transition-colors duration-300"
          aria-label="Next slide"
        >
          <ChevronRight size={16} className="md:hidden" />
          <ChevronRight size={20} className="hidden md:block" />
        </button>

        <div className="flex items-center justify-center px-3 py-1 md:px-4 md:py-2">
          <span className="md:text-cornsilk-dark text-neutral-200 text-xs md:text-sm font-medium">
            <span className="md:text-black text-white text-base md:text-xl font-bold">
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
