import React, { useState, useRef, useCallback } from 'react';

const TouchStateDemo = () => {
  const [touchState, setTouchState] = useState('idle');
  const [tapCount, setTapCount] = useState(0);
  const [holdDuration, setHoldDuration] = useState(0);
  const [lastTap, setLastTap] = useState(0);
  
  const holdTimerRef = useRef(null);
  const holdStartRef = useRef(null);
  const holdIntervalRef = useRef(null);

  // Simple touch handlers
  const handleTouchStart = useCallback((e) => {
    e.preventDefault();
    setTouchState('touching');
    
    // Start hold timer
    holdStartRef.current = Date.now();
    holdTimerRef.current = setTimeout(() => {
      setTouchState('holding');
      // Update hold duration every 100ms
      holdIntervalRef.current = setInterval(() => {
        setHoldDuration(Date.now() - holdStartRef.current);
      }, 100);
    }, 500); // 500ms to trigger hold
  }, []);

  const handleTouchEnd = useCallback(() => {
    const now = Date.now();
    const holdTime = now - (holdStartRef.current || now);
    
    // Clear timers
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }

    if (holdTime < 500) {
      // It's a tap
      setTouchState('tapped');
      setTapCount(prev => prev + 1);
      
      // Check for double tap
      if (now - lastTap < 300) {
        setTouchState('double-tapped');
      }
      setLastTap(now);
      
      // Reset state after animation
      setTimeout(() => setTouchState('idle'), 200);
    } else {
      // It was a hold
      setTouchState('held');
      setTimeout(() => setTouchState('idle'), 200);
    }
    
    setHoldDuration(0);
  }, [lastTap]);

  const resetCounters = () => {
    setTapCount(0);
    setHoldDuration(0);
    setTouchState('idle');
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-4">
      <div className="max-w-md mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-center">
          Touch State Management
        </h1>
        
        {/* Status Display */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <div className="space-y-2 text-sm">
            <div>State: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{touchState}</span></div>
            <div>Tap Count: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{tapCount}</span></div>
            {holdDuration > 0 && (
              <div>Hold Duration: <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{holdDuration}ms</span></div>
            )}
          </div>
        </div>

        {/* Interactive Button */}
        <div 
          className={`
            w-full h-32 rounded-lg border-2 border-dashed border-gray-300
            flex items-center justify-center cursor-pointer select-none
            transition-all duration-200 transform
            ${touchState === 'touching' ? 'bg-blue-100 border-blue-400 scale-95' : ''}
            ${touchState === 'tapped' ? 'bg-green-100 border-green-400 scale-105' : ''}
            ${touchState === 'double-tapped' ? 'bg-purple-100 border-purple-400 scale-110' : ''}
            ${touchState === 'holding' ? 'bg-orange-100 border-orange-400 scale-90' : ''}
            ${touchState === 'held' ? 'bg-red-100 border-red-400 scale-95' : ''}
            ${touchState === 'idle' ? 'hover:bg-gray-50' : ''}
          `}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
        >
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-700 dark:text-gray-400 ">
              Touch/Click Here
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tap, hold, or double-tap
            </div>
          </div>
        </div>

        {/* Advanced Touch Example */}
        <TouchGestureButton />

        <button 
          onClick={resetCounters}
          className="w-full bg-gray-600 dark:bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Reset Counters
        </button>
      </div>
    </div>
  );
};

// Advanced touch gesture component
const TouchGestureButton = () => {
  const [gesture, setGesture] = useState('');
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const pressTimerRef = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
    
    setIsPressed(true);
    setGesture('press-start');
    
    // Long press detection
    pressTimerRef.current = setTimeout(() => {
      setGesture('long-press');
    }, 800);
  };

  const handleTouchMove = (e) => {
    if (!touchStartRef.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > 10) {
      clearTimeout(pressTimerRef.current);
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        setGesture(deltaX > 0 ? 'swipe-right' : 'swipe-left');
      } else {
        setGesture(deltaY > 0 ? 'swipe-down' : 'swipe-up');
      }
    }
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimerRef.current);
    setIsPressed(false);
    
    setTimeout(() => {
      setGesture('');
    }, 1000);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Advanced Gestures</h3>
      <div 
        className={`
          w-full h-24 rounded-lg border-2 border-gray-300
          flex items-center justify-center cursor-pointer select-none
          transition-all duration-200
          ${isPressed ? 'bg-blue-50 border-blue-400 scale-95' : 'bg-gray-50 dark:bg-gray-700'}
          ${gesture === 'long-press' ? 'bg-red-50 border-red-400' : ''}
          ${gesture.includes('swipe') ? 'bg-green-50 border-green-400' : ''}
        `}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      >
        <div className="text-center">
          <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
            {gesture || 'Try gestures here'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Press, hold, or swipe
          </div>
        </div>
      </div>
    </div>
  );
};

export default TouchStateDemo;