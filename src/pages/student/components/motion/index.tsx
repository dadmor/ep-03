// src/pages/student/components/motion/index.tsx
import React from "react";
import { motion, MotionProps } from "framer-motion";
import { fadeInUpVariants, scaleVariants, slideInVariants, hoverVariants, tapVariant } from "./variants";
import { ANIMATION_DURATION, ANIMATION_DELAY, EASING } from "./constants";
import { useCountAnimation } from "./hooks";

// Re-export dla wygody
export { AnimatePresence, motion } from "framer-motion";
export { useAnimationControl, useStaggerAnimation, useCountAnimation } from "./hooks";
export { ANIMATION_DURATION, ANIMATION_DELAY, EASING } from "./constants";

// ===== KOMPONENTY =====

type VariantType = "fadeInUp" | "scale" | "slideIn";
type HoverType = keyof typeof hoverVariants | false;

const variantMap = {
  fadeInUp: fadeInUpVariants,
  scale: scaleVariants,
  slideIn: slideInVariants
};


interface AnimatedCardProps extends MotionProps {
    children: React.ReactNode;
    index?: number;
    className?: string;
    variant?: VariantType;
    hover?: HoverType;
    skipAnimation?: boolean;
    layoutId?: string;
    onClick?: () => void | Promise<void>;
  }
export const AnimatedCard: React.FC<AnimatedCardProps> = ({ 
  children, 
  index = 0, 
  className = "",
  variant = "fadeInUp",
  hover = "lift",
  skipAnimation = false,
  layoutId,
  ...motionProps 
}) => {
  return (
    <motion.div
      layoutId={layoutId}
      variants={variantMap[variant]}
      initial={skipAnimation ? false : "hidden"}
      animate="visible"
      custom={index}
      whileHover={hover ? hoverVariants[hover] : undefined}
      whileTap={tapVariant}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedProgressProps {
  value: number;
  className?: string;
  barClassName?: string;
  delay?: number;
  duration?: number;
  skipAnimation?: boolean;
  height?: string;
}

export const AnimatedProgress: React.FC<AnimatedProgressProps> = ({ 
  value, 
  className = "bg-gray-100 rounded-full overflow-hidden",
  barClassName = "h-full bg-gray-900",
  delay = 0,
  duration = ANIMATION_DURATION.slow,
  skipAnimation = false,
  height = "h-2"
}) => {
  return (
    <div className={`${height} ${className}`}>
      <motion.div
        initial={skipAnimation ? false : { width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ 
          duration, 
          ease: EASING.easeOut,
          delay 
        }}
        className={barClassName}
      />
    </div>
  );
};

interface AnimatedButtonProps extends MotionProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  index?: number;
  variant?: "scale" | "fadeInUp";
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = "",
  index = 0,
  variant = "scale",
  ...motionProps
}) => {
  return (
    <motion.button
      variants={variantMap[variant]}
      initial="hidden"
      animate="visible"
      custom={index}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={className}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

interface AnimatedCounterProps {
  value: number;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  className = "",
  duration = ANIMATION_DURATION.slow,
  prefix = "",
  suffix = ""
}) => {
  const displayValue = useCountAnimation(value, duration);

  return (
    <span className={className}>
      {prefix}{displayValue.toLocaleString('pl-PL')}{suffix}
    </span>
  );
};

interface AnimatedListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

export const AnimatedList: React.FC<AnimatedListProps> = ({
  children,
  className = "",
  staggerDelay = ANIMATION_DELAY.stagger
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: index * staggerDelay,
            duration: ANIMATION_DURATION.normal,
            ease: EASING.smooth
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
};