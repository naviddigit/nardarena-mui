import type { Transition } from 'framer-motion';

// ===============================================
// CHECKER ANIMATIONS
// ===============================================

export const checkerTransition: Transition = {
  type: 'spring',
  stiffness: 200,
  damping: 25,
  mass: 0.6,
  opacity: { duration: 0.2 },
  layout: {
    type: 'spring',
    stiffness: 200,
    damping: 25,
    mass: 0.6,
    duration: 0.5,
  },
};

export const checkerExitAnimation = {
  opacity: 0,
  scale: 0.8,
};

// ===============================================
// DICE INDICATOR ANIMATIONS
// ===============================================

export const diceIndicatorTransition: Transition = {
  duration: 0.3,
};

export const diceIndicatorInitial = {
  opacity: 0,
};

export const diceIndicatorAnimate = {
  opacity: 1,
};

export const diceIndicatorExit = {
  opacity: 0,
};

export const diceIndicatorHoverTransition = {
  duration: 0.2,
};

// ===============================================
// BOARD ROTATION
// ===============================================

export const boardRotationTransition: Transition = {
  type: 'spring',
  stiffness: 150,
  damping: 20,
  duration: 0.6,
};
