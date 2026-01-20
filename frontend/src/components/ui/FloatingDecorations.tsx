"use client";

import { useEffect, useState } from "react";

// Star SVG component with gradient fill
function Star({ className, size = 24, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      <defs>
        <linearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CA7383" />
          <stop offset="100%" stopColor="#53B9CC" />
        </linearGradient>
      </defs>
      <path
        d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L16.91 18.68L12 15.4L7.09 18.68L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
        fill="url(#starGradient)"
      />
    </svg>
  );
}

// Sparkle SVG
function Sparkle({ className, size = 16, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M12 0L13.5 10.5L24 12L13.5 13.5L12 24L10.5 13.5L0 12L10.5 10.5L12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Diamond shape
function Diamond({ className, size = 12, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M12 0L24 12L12 24L0 12L12 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface FloatingElement {
  id: number;
  type: "star" | "sparkle" | "diamond";
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
}

export default function FloatingDecorations({ className = "" }: { className?: string }) {
  const [elements, setElements] = useState<FloatingElement[]>([]);

  useEffect(() => {
    // Generate random floating elements
    const decorations: FloatingElement[] = [
      // Stars
      { id: 1, type: "star", x: 5, y: 15, size: 20, delay: 0, duration: 8, opacity: 0.3 },
      { id: 2, type: "star", x: 85, y: 25, size: 24, delay: 2, duration: 10, opacity: 0.25 },
      { id: 3, type: "star", x: 15, y: 70, size: 18, delay: 4, duration: 7, opacity: 0.2 },
      { id: 4, type: "star", x: 92, y: 65, size: 22, delay: 1, duration: 9, opacity: 0.35 },
      // Sparkles
      { id: 5, type: "sparkle", x: 25, y: 30, size: 14, delay: 3, duration: 6, opacity: 0.4 },
      { id: 6, type: "sparkle", x: 75, y: 45, size: 12, delay: 5, duration: 8, opacity: 0.35 },
      { id: 7, type: "sparkle", x: 10, y: 85, size: 16, delay: 2, duration: 7, opacity: 0.3 },
      { id: 8, type: "sparkle", x: 88, y: 80, size: 10, delay: 4, duration: 9, opacity: 0.25 },
      // Diamonds
      { id: 9, type: "diamond", x: 40, y: 10, size: 8, delay: 1, duration: 12, opacity: 0.2 },
      { id: 10, type: "diamond", x: 60, y: 90, size: 10, delay: 3, duration: 10, opacity: 0.25 },
      { id: 11, type: "diamond", x: 30, y: 55, size: 6, delay: 6, duration: 11, opacity: 0.15 },
      { id: 12, type: "diamond", x: 70, y: 20, size: 8, delay: 0, duration: 13, opacity: 0.2 },
    ];
    setElements(decorations);
  }, []);

  const renderElement = (el: FloatingElement) => {
    const style: React.CSSProperties = {
      position: "absolute",
      left: `${el.x}%`,
      top: `${el.y}%`,
      opacity: el.opacity,
      animation: `float ${el.duration}s ease-in-out infinite`,
      animationDelay: `${el.delay}s`,
    };

    const colorClass = el.type === "sparkle" || el.type === "diamond"
      ? "text-brand-teal"
      : "";

    switch (el.type) {
      case "star":
        return <Star key={el.id} size={el.size} style={style} />;
      case "sparkle":
        return <Sparkle key={el.id} size={el.size} style={style} className={colorClass} />;
      case "diamond":
        return <Diamond key={el.id} size={el.size} style={style} className={colorClass} />;
      default:
        return null;
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {elements.map(renderElement)}
    </div>
  );
}

// Simpler floating dots for backgrounds
export function FloatingDots({ count = 20, className = "" }: { count?: number; className?: string }) {
  const [dots, setDots] = useState<Array<{ id: number; x: number; y: number; size: number; delay: number; color: string }>>([]);

  useEffect(() => {
    const colors = ["#CA7383", "#53B9CC", "#368A9D", "#B35F6F"];
    const newDots = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setDots(newDots);
  }, [count]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {dots.map((dot) => (
        <div
          key={dot.id}
          className="absolute rounded-full animate-float"
          style={{
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.size,
            height: dot.size,
            backgroundColor: dot.color,
            opacity: 0.2,
            animationDelay: `${dot.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
