import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { MdFullscreen, MdPinch } from "react-icons/md";

const ProductDetailDialog = ({ selectedImage, product }) => {
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [lastCenter, setLastCenter] = useState(null);
  const contentRef = useRef(null);

  const handleTouchStart = (e) => {
    if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setLastCenter({ x: centerX, y: centerY });
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];

      // Calculate new scale
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      const newScale = Math.min(Math.max(1, distance / 100), 4);
      
      // Calculate center point
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;

      if (lastCenter) {
        // Calculate how much the center point has moved
        const deltaX = centerX - lastCenter.x;
        const deltaY = centerY - lastCenter.y;

        // Update offset based on pan
        setOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
      }

      setScale(newScale);
      setLastCenter({ x: centerX, y: centerY });
    }
  };

  const handleTouchEnd = () => {
    if (scale <= 1) {
      setOffset({ x: 0, y: 0 });
    }
    setLastCenter(null);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="border border-neutral-200 dark:border-neutral-500 aspect-square w-full rounded-lg overflow-hidden relative cursor-pointer">
          <img
            src={product.images[selectedImage]}
            alt={product.title}
            className="w-full h-full object-contain"
          />
          <div className="absolute bottom-4 right-4 bg-black/5 text-neutral-500 p-1 rounded-lg">
            <MdFullscreen size={25} />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="w-11/12 max-w-3xl h-[80vh] p-0">
        <div 
          ref={contentRef}
          className="w-full h-full flex items-center justify-center bg-white overflow-hidden touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <img
            src={product.images[selectedImage]}
            alt={product.title}
            className="max-w-full max-h-full object-contain transition-transform duration-75"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
            }}
          />
          <div className="absolute bottom-4 flex items-center justify-center gap-2 bg-black/25 text-white px-3 py-2 rounded-full">
            <MdPinch className="w-4 h-4" />
            <span className="text-xs">Pinch to zoom</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDetailDialog;