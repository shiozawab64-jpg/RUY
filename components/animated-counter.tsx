"use client";

import { useEffect, useRef, useState } from "react";

type AnimatedCounterProps = {
  value: number;
  format: (value: number) => string;
  className?: string;
  durationMs?: number;
};

const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

export const AnimatedCounter = ({
  value,
  format,
  className = "",
  durationMs = 900,
}: AnimatedCounterProps) => {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValueRef = useRef(value);

  useEffect(() => {
    const startValue = previousValueRef.current;
    const delta = value - startValue;

    if (delta === 0) {
      return;
    }

    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const eased = easeOutCubic(progress);
      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValueRef.current = value;
        setDisplayValue(value);
      }
    };

    requestAnimationFrame(animate);
  }, [value, durationMs]);

  return <span className={className}>{format(displayValue)}</span>;
};
