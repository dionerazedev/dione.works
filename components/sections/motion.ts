import type { Variants } from 'framer-motion';

export const PREMIUM_EASE = [0.16, 1, 0.3, 1] as const;

export const sectionReveal: Variants = {
  hidden: { opacity: 1, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: PREMIUM_EASE },
  },
};

export const staggerReveal: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.04, staggerChildren: 0.07 },
  },
};
