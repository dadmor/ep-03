// src/pages/student/components/motion/hooks.ts
import React from "react";
import { ANIMATION_DURATION, ANIMATION_DELAY, EASING } from "./constants";

export const useAnimationControl = <T extends number = 1000>(duration: T = 1000 as T) => {
  const [isAnimating, setIsAnimating] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return isAnimating;
};

export const useStaggerAnimation = (itemCount: number, baseDelay = 0) => {
  return React.useMemo(() => {
    return Array.from({ length: itemCount }, (_, i) => ({
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      transition: {
        delay: baseDelay + (i * ANIMATION_DELAY.stagger),
        duration: ANIMATION_DURATION.normal,
        ease: EASING.smooth
      }
    }));
  }, [itemCount, baseDelay]);
};

export const useCountAnimation = (value: number, duration: number = ANIMATION_DURATION.slow) => {
  const [displayValue, setDisplayValue] = React.useState(0);
  const previousValue = React.useRef(0);

  React.useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      const currentValue = Math.floor(
        startValue + (endValue - startValue) * easeProgress
      );
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return displayValue;
};