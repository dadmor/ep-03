// src/pages/student/components/motion/constants.ts
export const ANIMATION_DURATION = {
    instant: 0.1,
    fast: 0.15,
    normal: 0.3,
    slow: 0.5
} as const;

export const ANIMATION_DELAY = {
    stagger: 0.03,
    staggerFast: 0.02,
    staggerSlow: 0.05
} as const;

export const EASING = {
    smooth: [0.21, 0.47, 0.32, 0.98],
    bounce: [0.68, -0.55, 0.265, 1.55],
    easeOut: "easeOut",
    sharp: [0.25, 0.46, 0.45, 0.94],
    elastic: [0.68, -0.6, 0.32, 1.6]
} as const;