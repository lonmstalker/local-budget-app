import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect } from "react";

interface AnimationSettings {
  enabled: boolean;
  reducedMotion: boolean;
  animationSpeed: "slow" | "normal" | "fast";
  toggleAnimations: () => void;
  setAnimationSpeed: (speed: "slow" | "normal" | "fast") => void;
  setReducedMotion: (reduced: boolean) => void;
}

export const useAnimationSettings = create<AnimationSettings>()(
  persist(
    (set) => ({
      enabled: true,
      reducedMotion: false,
      animationSpeed: "normal",

      toggleAnimations: () =>
        set((state) => ({
          enabled: !state.enabled,
        })),

      setAnimationSpeed: (speed) =>
        set({
          animationSpeed: speed,
        }),

      setReducedMotion: (reduced) =>
        set({
          reducedMotion: reduced,
        }),
    }),
    {
      name: "animation-settings",
    },
  ),
);

export const useAnimationDuration = (baseDuration: number = 300) => {
  const { enabled, animationSpeed, reducedMotion } = useAnimationSettings();

  if (!enabled || reducedMotion) return 0;

  const speedMultiplier = {
    slow: 1.5,
    normal: 1,
    fast: 0.7,
  };

  return baseDuration * speedMultiplier[animationSpeed];
};

export const useMotionPreference = () => {
  const setReducedMotion = useAnimationSettings(
    (state) => state.setReducedMotion,
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    setReducedMotion(mediaQuery.matches);

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [setReducedMotion]);
};

export const getAnimationVariants = (
  enabled: boolean,
  reducedMotion: boolean,
) => {
  if (!enabled || reducedMotion) {
    return {
      initial: {},
      animate: {},
      exit: {},
      transition: { duration: 0 },
    };
  }

  return undefined;
};
