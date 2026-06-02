import { Variants } from 'framer-motion';

// Shared motion tokens. Prefer transform and opacity; avoid filters so movement stays crisp.
export const motionTokens = {
  instant: { duration: 0 },
  quick: { duration: 0.14, ease: [0.2, 0, 0, 1] },
  smooth: { duration: 0.24, ease: [0.2, 0, 0, 1] },
  expressive: { type: 'spring', stiffness: 460, damping: 34, mass: 0.75 },
} as const;

export const reducedMotionTransition = motionTokens.instant;

// Compatibility aliases for existing consumers.
export const springSnappy = motionTokens.expressive as any;

export const springSmooth = { type: 'spring', stiffness: 380, damping: 34, mass: 0.85 } as any;

export const easeSmooth = motionTokens.smooth as any;

export const easeFast = motionTokens.quick as any;

// --- Reusable Component Variants ---

export const pageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 12 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      ...easeSmooth,
      duration: 0.32,
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    transition: easeFast,
  },
};

export const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.95 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springSmooth,
  },
};

export const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: easeFast },
  exit: { opacity: 0, transition: easeFast },
};

export const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 14 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: springSmooth,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    y: 8,
    transition: easeFast,
  },
};

export const dropdownVariants: Variants = {
  hidden: { opacity: 0, y: -6, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: motionTokens.expressive },
  exit: { opacity: 0, y: -4, scale: 0.98, transition: easeFast },
};

export const collapseVariants = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: easeSmooth,
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: easeFast,
  },
};

export const sidebarVariants: Variants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: easeSmooth },
};

export const titlebarVariants: Variants = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0, transition: easeSmooth },
};

export const checkVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: springSnappy,
  },
  exit: { scale: 0, opacity: 0, transition: easeFast },
};

export const tooltipVariants: Variants = {
  hidden: { opacity: 0, scale: 0.98, y: 4 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: motionTokens.quick,
  },
  exit: { opacity: 0, scale: 0.98, transition: easeFast },
};

export const colorPickerVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: -10 },
  show: { opacity: 1, scale: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, scale: 0.95, y: -10, transition: easeFast },
};

export const badgeVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  show: { opacity: 1, scale: 1, transition: springSnappy },
  exit: { opacity: 0, scale: 0.8, transition: easeFast },
};

export const explorerVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  show: { opacity: 1, x: 0, transition: springSmooth },
  exit: { opacity: 0, x: 20, transition: easeFast },
};
