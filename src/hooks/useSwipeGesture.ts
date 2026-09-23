import React, { useState, useRef, useCallback } from 'react';

interface UseSwipeGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  minDistance?: number; // Minimum distance in pixels required to trigger swipe (default: 40)
  maxVerticalOffset?: number; // Maximum vertical deviation allowed before ignoring swipe (default: 80)
  velocityThreshold?: number; // Minimum velocity (px/ms) for fast flick gesture (default: 0.25)
  enableLiveTracking?: boolean; // Whether to update dragOffset state during touchmove (default: true)
}

export function useSwipeGesture({
  onSwipeLeft,
  onSwipeRight,
  minDistance = 40,
  maxVerticalOffset = 80,
  velocityThreshold = 0.25,
  enableLiveTracking = true,
}: UseSwipeGestureOptions) {
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isSwiping, setIsSwiping] = useState<boolean>(false);

  const startXRef = useRef<number | null>(null);
  const startYRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const isHorizontalLockRef = useRef<boolean | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (e.touches.length !== 1) return; // Only handle single finger touches

    const touch = e.touches[0];
    startXRef.current = touch.clientX;
    startYRef.current = touch.clientY;
    startTimeRef.current = Date.now();
    isHorizontalLockRef.current = null;
    setIsSwiping(true);
    setDragOffset(0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (startXRef.current === null || startYRef.current === null) return;

    const touch = e.touches[0];
    const diffX = touch.clientX - startXRef.current;
    const diffY = touch.clientY - startYRef.current;

    // Lock direction on initial move to prevent accidental scroll hijacking
    if (isHorizontalLockRef.current === null) {
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 6) {
        isHorizontalLockRef.current = true;
      } else if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 6) {
        isHorizontalLockRef.current = false;
      }
    }

    if (isHorizontalLockRef.current === true && enableLiveTracking) {
      setDragOffset(diffX);
    }
  }, [enableLiveTracking]);

  const handleTouchEnd = useCallback((e: React.TouchEvent | TouchEvent) => {
    if (startXRef.current === null) {
      setIsSwiping(false);
      setDragOffset(0);
      return;
    }

    const changedTouch = e.changedTouches[0];
    const diffX = changedTouch ? changedTouch.clientX - startXRef.current : dragOffset;
    const diffY = startYRef.current && changedTouch ? Math.abs(changedTouch.clientY - startYRef.current) : 0;
    const duration = Date.now() - startTimeRef.current;
    const velocity = Math.abs(diffX) / Math.max(duration, 1);

    if (
      diffY < maxVerticalOffset &&
      isHorizontalLockRef.current !== false &&
      (Math.abs(diffX) >= minDistance || (velocity >= velocityThreshold && Math.abs(diffX) >= 15))
    ) {
      if (diffX < 0) {
        onSwipeLeft?.();
      } else {
        onSwipeRight?.();
      }
    }

    startXRef.current = null;
    startYRef.current = null;
    isHorizontalLockRef.current = null;
    setIsSwiping(false);
    setDragOffset(0);
  }, [dragOffset, maxVerticalOffset, minDistance, velocityThreshold, onSwipeLeft, onSwipeRight]);

  return {
    dragOffset,
    isSwiping,
    touchHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onTouchCancel: handleTouchEnd,
    },
  };
}
