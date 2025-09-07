export const animations = {
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5,
    verySlow: 0.8,
    theme: 0.3,
  },

  ease: {
    out: [0.16, 1, 0.3, 1] as const,
    inOut: [0.83, 0, 0.17, 1] as const,
    bounce: { type: "spring" as const, bounce: 0.25, duration: 0.4 },
    smooth: "easeInOut" as const,
    snappy: { type: "spring" as const, stiffness: 300, damping: 30 },
  },

  variants: {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.3 },
      },
    },

    slideUp: {
      hidden: { y: 20, opacity: 0 },
      visible: {
        y: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      },
    },

    slideInFromRight: {
      hidden: { x: 100, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      },
    },

    scale: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.3 },
      },
    },

    button: {
      idle: { scale: 1 },
      hover: {
        scale: 1.02,
        transition: { duration: 0.2 },
      },
      tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
      },
      disabled: {
        opacity: 0.5,
        cursor: "not-allowed",
      },
    },

    listContainer: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.05,
          delayChildren: 0.1,
        },
      },
    },

    listItem: {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 },
      },
      exit: {
        opacity: 0,
        x: -100,
        transition: { duration: 0.2 },
      },
    },

    themeSwitch: {
      light: {
        rotate: 0,
        scale: 1,
      },
      dark: {
        rotate: 180,
        scale: 1.1,
      },
      transition: {
        duration: 0.3,
        ease: [0.16, 1, 0.3, 1],
      },
    },
  },
};

export const getMotionPreference = () => {
  if (typeof window === "undefined") return true;
  return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};
