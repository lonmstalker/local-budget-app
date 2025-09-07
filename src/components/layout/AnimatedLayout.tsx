"use client";

import { motion } from "framer-motion";
import {
  useAnimationSettings,
  useMotionPreference,
} from "@/lib/hooks/useAnimationSettings";
import { animations } from "@/lib/animations";

interface AnimatedLayoutProps {
  children: React.ReactNode;
}

export const AnimatedLayout = ({ children }: AnimatedLayoutProps) => {
  const { enabled, reducedMotion } = useAnimationSettings();
  useMotionPreference();

  if (!enabled || reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
};

interface AnimatedPageProps {
  children: React.ReactNode;
}

export const AnimatedPage = ({ children }: AnimatedPageProps) => {
  const { enabled, reducedMotion } = useAnimationSettings();

  if (!enabled || reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      variants={animations.variants.fadeIn}
      initial="hidden"
      animate="visible"
      exit="hidden"
    >
      {children}
    </motion.div>
  );
};

interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
}

export const AnimatedSection = ({
  children,
  delay = 0,
}: AnimatedSectionProps) => {
  const { enabled, reducedMotion } = useAnimationSettings();

  if (!enabled || reducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
};
