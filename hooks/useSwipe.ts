import { TouchEvent, useState } from 'react';

interface SwipeHandlers {
  onSwipedLeft: () => void;
  onSwipedRight: () => void;
}

export const useSwipe = (handlers: SwipeHandlers) => {
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [touchEnd, setTouchEnd] = useState<{x: number, y: number} | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null); // Reset touch end
    setTouchStart({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd({ x: e.targetTouches[0].clientX, y: e.targetTouches[0].clientY });
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isLeftSwipe = distanceX > minSwipeDistance;
    const isRightSwipe = distanceX < -minSwipeDistance;

    // Only trigger if horizontal swipe is significantly larger than vertical movement
    // This allows vertical scrolling to still work without triggering navigation
    if (Math.abs(distanceX) > Math.abs(distanceY)) {
        if (isLeftSwipe) {
            handlers.onSwipedLeft();
        }
        if (isRightSwipe) {
            handlers.onSwipedRight();
        }
    }
  };

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd
  };
};