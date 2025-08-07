// src/pages/student/components/motion/variants.ts
import { Variants } from "framer-motion";
import { ANIMATION_DURATION, ANIMATION_DELAY, EASING } from "./constants";

export const fadeInUpVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(10px)"
  },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * ANIMATION_DELAY.stagger,
      duration: ANIMATION_DURATION.fast,
      ease: EASING.sharp,
      type: "tween"
    }
  })
};

export const scaleVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8,
    filter: "blur(20px)"
  },
  visible: (i = 0) => ({
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      delay: i * ANIMATION_DELAY.staggerFast,
      duration: ANIMATION_DURATION.fast,
      ease: EASING.elastic
    }
  })
};

export const slideInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: -50,
    filter: "blur(10px)"
  },
  visible: (i = 0) => ({
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: {
      delay: i * ANIMATION_DELAY.stagger,
      duration: ANIMATION_DURATION.fast,
      ease: EASING.sharp
    }
  })
};

export const glitchVariants: Variants = {
  hidden: { 
    opacity: 0,
    x: -100,
    scaleX: 0,
  },
  visible: (i = 0) => ({
    opacity: [0, 1, 0.8, 1],
    x: [100, -5, 2, 0],
    scaleX: [0, 1.1, 0.95, 1],
    transition: {
      delay: i * ANIMATION_DELAY.staggerFast,
      duration: ANIMATION_DURATION.normal,
      times: [0, 0.6, 0.8, 1],
      ease: EASING.sharp
    }
  })
};

export const techPanelVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    rotateX: -15,
  },
  visible: {
    opacity: 1,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: ANIMATION_DURATION.fast,
      ease: EASING.sharp
    }
  }
};

export const hoverVariants = {
  scale: { 
    scale: 1.05,
    transition: { duration: ANIMATION_DURATION.instant }
  },
  lift: { 
    y: -4,
    boxShadow: "0 20px 40px -15px rgba(0,0,0,0.3)",
    transition: { duration: ANIMATION_DURATION.instant }
  },
  glow: { 
    boxShadow: "0 0 30px -5px rgba(59, 130, 246, 0.5)",
    transition: { duration: ANIMATION_DURATION.instant }
  },
  tech: {
    scale: 1.02,
    boxShadow: "0 0 20px -5px rgba(59, 130, 246, 0.8), inset 0 0 20px -5px rgba(59, 130, 246, 0.1)",
    borderColor: "rgba(59, 130, 246, 0.5)",
    transition: { duration: ANIMATION_DURATION.instant }
  }
};

export const tapVariant = {
  scale: 0.95,
  transition: { duration: ANIMATION_DURATION.instant }
};