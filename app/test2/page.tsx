"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

// Seeded Random Number Generator
class SeededRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  nextFloat(min: number, max: number): number {
    return min + this.next() * (max - min);
  }
}

interface Particle {
  anchorX: number;
  anchorY: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

export default function Test2Page() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const animationFrameRef = useRef<number | undefined>(undefined);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      const size = Math.min(rect.width, rect.height * 0.8, 800);
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      setDimensions({ width: size, height: size });
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(canvas.width, canvas.height) / 2 - 20 * dpr;

    // Initialize particles
    const rng = new SeededRNG(Date.now() + Math.random() * 1000000); // Random seed each time
    const targetParticleCount = 9000;
    const particles: Particle[] = [];
    const influenceRadius = 150 * dpr; // Larger radius for clustering
    const springStrength = 0.12; // Slightly weaker spring for smoother clustering
    const damping = 0.88; // Slightly less damping for smoother motion
    const attractionStrength = 0.6; // Strength of attraction toward cursor

    // Generate particles with density gradient using rejection sampling
    // Sample random points in a square, then check if they're in the circle
    let attempts = 0;
    const maxAttempts = targetParticleCount * 4;

    while (particles.length < targetParticleCount && attempts < maxAttempts) {
      attempts++;

      // Sample random point in square bounding box
      const x = centerX + (rng.next() * 2 - 1) * radius * 1.1;
      const y = centerY + (rng.next() * 2 - 1) * radius * 1.1;

      // Check if point is within circle
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      if (distFromCenter > radius) continue;

      // Calculate normalized y position (0 at top, 1 at bottom)
      const normalizedY = (y - (centerY - radius)) / (radius * 2);
      const clampedY = Math.max(0, Math.min(1, normalizedY));

      // Calculate horizontal offset from center (0 at center, 1 at edge)
      const horizontalOffset = Math.abs(x - centerX) / radius;
      const clampedHorizontalOffset = Math.max(0, Math.min(1, horizontalOffset));

      // Base probability based on y position (very bottom-heavy gradient)
      const baseProbability = Math.pow(clampedY, 5);

      // Boost probability for points on the sides (high horizontal offset) in upper portion
      // This adds more dots on the sides at higher positions (very small boost)
      const sideBoost = clampedHorizontalOffset > 0.6 && clampedY < 0.5 
        ? Math.pow(clampedHorizontalOffset, 2) * (1 - clampedY) * 0.05 
        : 0;

      const probability = Math.min(1, baseProbability + sideBoost);

      if (rng.next() < probability) {
        const particleRadius = rng.nextFloat(0.5 * dpr, 1.5 * dpr);
        particles.push({
          anchorX: x,
          anchorY: y,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: particleRadius,
        });
      }
    }

    // Add dots directly on the circle edge to maintain circular shape
    // Generate points around the circle perimeter with density gradient (dense at bottom, sparse at top)
    const edgeDotCount = Math.floor(radius * 2 * Math.PI / 5); // Sparse sampling - ~1 dot per 5px
    const edgeVariance = 2 * dpr; // Small variance from edge (2px)
    
    for (let i = 0; i < edgeDotCount; i++) {
      // Angle around the circle
      const angle = (i / edgeDotCount) * Math.PI * 2;
      
      // Position on edge with small variance
      const edgeRadius = radius + (rng.next() * 2 - 1) * edgeVariance;
      const x = centerX + edgeRadius * Math.cos(angle);
      const y = centerY + edgeRadius * Math.sin(angle);
      
      // Ensure it's still within the circle (clip if variance pushed it out)
      const distFromCenter = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
      );
      const finalRadius = Math.min(radius, distFromCenter);
      const finalX = centerX + finalRadius * Math.cos(angle);
      const finalY = centerY + finalRadius * Math.sin(angle);
      
      // Calculate normalized y position (0 at top, 1 at bottom)
      const normalizedY = (finalY - (centerY - radius)) / (radius * 2);
      const clampedY = Math.max(0, Math.min(1, normalizedY));
      
      // Apply density gradient with reduced probability to make edge dots sparser
      const probability = Math.pow(clampedY, 5) * 0.3; // Reduce by 70% to make much sparser
      
      // Only place dot if probability check passes
      if (rng.next() < probability) {
        const particleRadius = rng.nextFloat(0.5 * dpr, 1.5 * dpr);
        particles.push({
          anchorX: finalX,
          anchorY: finalY,
          x: finalX,
          y: finalY,
          vx: 0,
          vy: 0,
          radius: particleRadius,
        });
      }
    }

    particlesRef.current = particles;

    // Mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      mouseRef.current = {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw circular clipping path
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((particle) => {
        // Calculate distance from mouse
        const dx = mouse.x - particle.x;
        const dy = mouse.y - particle.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Apply attraction force if within influence radius (clustering effect)
        if (dist < influenceRadius && dist > 0) {
          // Stronger attraction closer to cursor, with smooth falloff
          const normalizedDist = dist / influenceRadius;
          const force = (1 - normalizedDist) * (1 - normalizedDist) * attractionStrength;
          const angle = Math.atan2(dy, dx);
          particle.vx += Math.cos(angle) * force;
          particle.vy += Math.sin(angle) * force;
        }

        // Spring force back to anchor (disperses when cursor moves away)
        const anchorDx = particle.anchorX - particle.x;
        const anchorDy = particle.anchorY - particle.y;
        particle.vx += anchorDx * springStrength;
        particle.vy += anchorDy * springStrength;

        // Apply damping
        particle.vx *= damping;
        particle.vy *= damping;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Constrain to circle
        const distFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
        );
        if (distFromCenter > radius - particle.radius) {
          const angle = Math.atan2(
            particle.y - centerY,
            particle.x - centerX
          );
          particle.x = centerX + (radius - particle.radius) * Math.cos(angle);
          particle.y = centerY + (radius - particle.radius) * Math.sin(angle);
          particle.vx *= 0.5;
          particle.vy *= 0.5;
        }

        // Draw particle
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className="min-h-screen bg-white flex flex-col relative">
      {/* Top Row - Logo and Login */}
      <div className="flex items-center justify-between px-6 pt-6 relative z-10">
        {/* Spacer for centering logo */}
        <div className="flex-1"></div>
        
        {/* Logo - Center */}
        <div className="flex-1 flex justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 100"
            role="img"
            aria-label="Two overlapping circles with center knocked out"
            className="w-24 h-12"
          >
            <path
              fill="#000"
              fillRule="evenodd"
              d="
                M 80 50
                m -35 0
                a 35 35 0 1 0 70 0
                a 35 35 0 1 0 -70 0

                M 115 50
                m -35 0
                a 35 35 0 1 0 70 0
                a 35 35 0 1 0 -70 0
              "
            />
          </svg>
        </div>
        
        {/* Login Button - Right */}
        <div className="flex-1 flex justify-end">
          <Button className="rounded-full">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </div>

      {/* Particle Field - Centered */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-0">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[80vh]"
          style={{ display: "block", aspectRatio: "1" }}
        />
      </div>
    </div>
  );
}

