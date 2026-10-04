export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

export const slideInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.25, ease: "easeInOut" },
};

export const correctFlash = {
  animate: { backgroundColor: ["transparent", "#10b98133", "transparent"] },
  transition: { duration: 0.4 },
};

export const wrongShake = {
  animate: { x: [0, -8, 8, -6, 6, -3, 3, 0] },
  transition: { duration: 0.35 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.07 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.92 },
  animate: { opacity: 1, scale: 1 },
  transition: { type: "spring", stiffness: 300, damping: 24 },
};
