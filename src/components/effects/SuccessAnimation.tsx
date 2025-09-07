"use client";

import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Trophy, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

export const celebrateGoal = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 1000 };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ["#10b981", "#3b82f6", "#8b5cf6", "#ec4899"],
    });
  }, 250);
};

export const celebrateSavings = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ["#10b981", "#059669", "#047857"],
    shapes: ["circle", "square"],
    gravity: 1.2,
    ticks: 100,
    zIndex: 1000,
  });
};

interface SuccessCheckmarkProps {
  show: boolean;
  message?: string;
  onComplete?: () => void;
}

export const SuccessCheckmark = ({
  show,
  message = "Успешно!",
  onComplete,
}: SuccessCheckmarkProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          className="fixed top-20 right-4 bg-green-500 text-white rounded-lg p-4 shadow-lg flex items-center gap-3 z-50"
        >
          <motion.div
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="w-6 h-6"
          >
            <Check size={24} />
          </motion.div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface RippleEffectProps {
  x: number;
  y: number;
  color?: string;
}

export const RippleEffect = ({
  x,
  y,
  color = "rgba(255,255,255,0.3)",
}: RippleEffectProps) => {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: x - 10,
        top: y - 10,
        width: 20,
        height: 20,
        backgroundColor: color,
      }}
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 8, opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    />
  );
};

interface AchievementUnlockedProps {
  show: boolean;
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export const AchievementUnlocked = ({
  show,
  title,
  description,
  icon = <Trophy className="w-8 h-8 text-yellow-500" />,
}: AchievementUnlockedProps) => {
  useEffect(() => {
    if (show) {
      celebrateGoal();
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 100,
            damping: 15,
          }}
          className="fixed top-20 right-4 bg-white rounded-lg shadow-xl p-6 max-w-sm z-50"
        >
          <div className="flex items-start gap-4">
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 0.5,
                delay: 0.2,
              }}
            >
              {icon}
            </motion.div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-600">{description}</p>
            </div>
          </div>

          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg opacity-10"
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface SparkleEffectProps {
  children: React.ReactNode;
  active?: boolean;
}

export const SparkleEffect = ({
  children,
  active = true,
}: SparkleEffectProps) => {
  const [sparkles, setSparkles] = useState<
    Array<{ id: number; x: number; y: number }>
  >([]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setSparkles((prev) => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * 100,
          y: Math.random() * 100,
        },
      ]);

      setTimeout(() => {
        setSparkles((prev) => prev.slice(1));
      }, 1000);
    }, 300);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="relative">
      {children}
      {sparkles.map((sparkle) => (
        <motion.div
          key={sparkle.id}
          className="absolute pointer-events-none"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 1, opacity: 0, y: -20 }}
          transition={{ duration: 1 }}
        >
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </motion.div>
      ))}
    </div>
  );
};

interface PulseEffectProps {
  children: React.ReactNode;
  color?: string;
}

export const PulseEffect = ({
  children,
  color = "rgba(59, 130, 246, 0.5)",
}: PulseEffectProps) => {
  return (
    <motion.div
      className="relative"
      animate={{
        boxShadow: [`0 0 0 0 ${color}`, `0 0 0 20px transparent`],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
      }}
    >
      {children}
    </motion.div>
  );
};

interface CountUpAnimationProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export const CountUpAnimation = ({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  className,
}: CountUpAnimationProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const endTime = startTime + duration * 1000;

    const updateValue = () => {
      const now = Date.now();
      const progress = Math.min((now - startTime) / (duration * 1000), 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * value);

      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      }
    };

    updateValue();
  }, [value, duration]);

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {prefix}
      {displayValue.toLocaleString()}
      {suffix}
    </motion.span>
  );
};
