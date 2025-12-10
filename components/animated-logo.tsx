"use client";

import { useEffect, useState, useRef } from "react";

const letters = ["c", "i", "v", "i", "e"];

interface AnimatedLogoProps {
  isActive?: boolean;
}

export function AnimatedLogo({ isActive = false }: AnimatedLogoProps) {
  const [animationKey, setAnimationKey] = useState(0);
  const prevIsActiveRef = useRef(false);

  useEffect(() => {
    // Trigger animation when isActive changes from false to true (hover on)
    if (isActive && !prevIsActiveRef.current) {
      setAnimationKey((prev) => prev + 1);
    }
    prevIsActiveRef.current = isActive;
  }, [isActive]);

  return (
    <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl flex">
      {letters.map((letter, index) => (
        <span
          key={`${animationKey}-${index}`}
          className="inline-block"
          style={{
            animation: `letterReveal 0.6s ease-out forwards`,
            animationDelay: `${index * 0.1}s`,
            opacity: 0,
          }}
        >
          {letter}
        </span>
      ))}
    </h1>
  );
}

