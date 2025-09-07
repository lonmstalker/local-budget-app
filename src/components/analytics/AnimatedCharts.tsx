"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface AnimatedBarChartProps {
  data: ChartData[];
  height?: number;
  showValues?: boolean;
}

export const AnimatedBarChart = ({
  data,
  height = 300,
  showValues = true,
}: AnimatedBarChartProps) => {
  const maxValue = Math.max(...data.map((d) => d.value));
  const [hasAnimated, setHasAnimated] = useState(false);
  const { isDark } = useTheme();

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full"
      style={{ height }}
    >
      <div className="flex items-end justify-between h-full gap-2">
        {data.map((item, index) => {
          const heightPercentage = (item.value / maxValue) * 100;

          return (
            <motion.div
              key={item.label}
              className="flex-1 flex flex-col items-center justify-end"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {showValues && (
                <motion.span
                  className="text-sm font-medium mb-2"
                  style={{ color: isDark ? "#e5e7eb" : "#374151" }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  {item.value}
                </motion.span>
              )}
              <motion.div
                className="w-full rounded-t-lg relative overflow-hidden"
                style={{
                  backgroundColor: item.color || "#3b82f6",
                  height: hasAnimated ? `${heightPercentage}%` : 0,
                }}
                initial={{ height: 0 }}
                animate={{ height: hasAnimated ? `${heightPercentage}%` : 0 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 100%)",
                  }}
                />
              </motion.div>
              <span
                className="text-xs mt-2 text-center"
                style={{ color: isDark ? "#9ca3af" : "#4b5563" }}
              >
                {item.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

interface AnimatedPieChartProps {
  data: ChartData[];
  size?: number;
}

export const AnimatedPieChart = ({
  data,
  size = 200,
}: AnimatedPieChartProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { isDark } = useTheme();
  const total = data.reduce((sum, item) => sum + item.value, 0);

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  let cumulativePercentage = 0;

  const colors = isDark
    ? [
        "#60a5fa",
        "#34d399",
        "#fbbf24",
        "#f87171",
        "#a78bfa",
        "#f472b6",
        "#22d3ee",
        "#a3e635",
      ]
    : [
        "#3b82f6",
        "#10b981",
        "#f59e0b",
        "#ef4444",
        "#8b5cf6",
        "#ec4899",
        "#06b6d4",
        "#84cc16",
      ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const startAngle = (cumulativePercentage * 360) / 100;
          const endAngle = ((cumulativePercentage + percentage) * 360) / 100;
          cumulativePercentage += percentage;

          const start = polarToCartesian(
            size / 2,
            size / 2,
            size / 2 - 10,
            endAngle,
          );
          const end = polarToCartesian(
            size / 2,
            size / 2,
            size / 2 - 10,
            startAngle,
          );
          const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

          const d = [
            "M",
            size / 2,
            size / 2,
            "L",
            start.x,
            start.y,
            "A",
            size / 2 - 10,
            size / 2 - 10,
            0,
            largeArcFlag,
            0,
            end.x,
            end.y,
            "Z",
          ].join(" ");

          return (
            <motion.path
              key={item.label}
              d={d}
              fill={item.color || colors[index % colors.length]}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: hasAnimated ? 1 : 0,
                scale: hasAnimated ? 1 : 0,
              }}
              transition={{
                duration: 0.5,
                delay: index * 0.1,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ transformOrigin: `${size / 2}px ${size / 2}px` }}
              whileHover={{ scale: 1.05 }}
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold"
            style={{ color: isDark ? "#f3f4f6" : "#111827" }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          >
            {total}
          </motion.div>
          <motion.div
            className="text-xs"
            style={{ color: isDark ? "#9ca3af" : "#6b7280" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Всего
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

interface AnimatedLineChartProps {
  data: Array<{ x: number; y: number; label?: string }>;
  width?: number;
  height?: number;
  color?: string;
}

export const AnimatedLineChart = ({
  data,
  width = 400,
  height = 300,
  color,
}: AnimatedLineChartProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  const { isDark } = useTheme();
  const chartColor = color || (isDark ? "#60a5fa" : "#3b82f6");

  useEffect(() => {
    setHasAnimated(true);
  }, []);

  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const padding = 20;

  const scaleX = (x: number) =>
    (x / (data.length - 1)) * (width - 2 * padding) + padding;
  const scaleY = (y: number) =>
    height - ((y - minY) / (maxY - minY)) * (height - 2 * padding) - padding;

  const pathData = data
    .map((point, index) => {
      const x = scaleX(index);
      const y = scaleY(point.y);
      return `${index === 0 ? "M" : "L"} ${x} ${y}`;
    })
    .join(" ");

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <svg width={width} height={height}>
        <motion.path
          d={pathData}
          fill="none"
          stroke={chartColor}
          strokeWidth={2}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{
            pathLength: hasAnimated ? 1 : 0,
            opacity: hasAnimated ? 1 : 0,
          }}
          transition={{
            pathLength: { duration: 1.5, ease: "easeInOut" },
            opacity: { duration: 0.3 },
          }}
        />

        {data.map((point, index) => (
          <motion.circle
            key={index}
            cx={scaleX(index)}
            cy={scaleY(point.y)}
            r={4}
            fill={chartColor}
            initial={{ scale: 0 }}
            animate={{ scale: hasAnimated ? 1 : 0 }}
            transition={{
              delay: (index / data.length) * 1.5,
              type: "spring",
              stiffness: 300,
            }}
            whileHover={{ scale: 1.5 }}
          />
        ))}
      </svg>
    </motion.div>
  );
};

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}
