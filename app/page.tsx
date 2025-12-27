"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
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
      
      // Use the smaller dimension to ensure square, accounting for padding
      const padding = 32; // px-4 = 16px on each side
      const availableWidth = rect.width - padding;
      const availableHeight = (rect.height - padding) * 0.8;
      
      // Calculate square size from the smaller dimension
      const size = Math.min(availableWidth, availableHeight, 800);
      
      // Ensure we have a valid size
      if (size <= 0) return;
      
      // Round to avoid sub-pixel issues
      const squareSize = Math.floor(size);
      
      // Set canvas buffer (internal resolution) - must be square
      canvas.width = squareSize * dpr;
      canvas.height = squareSize * dpr;
      
      // Set display size (CSS pixels) - must match exactly
      canvas.style.width = `${squareSize}px`;
      canvas.style.height = `${squareSize}px`;
      
      setDimensions({ width: squareSize, height: squareSize });
    };

    // Initial resize
    resizeCanvas();
    
    // Use ResizeObserver for more reliable sizing on mobile
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    resizeObserver.observe(canvas.parentElement!);
    
    // Also resize after a short delay to catch any layout shifts
    const timeoutId = setTimeout(resizeCanvas, 100);
    
    window.addEventListener("resize", resizeCanvas);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    
    // Scale context for high DPI displays
    ctx.scale(dpr, dpr);
    
    // Canvas is always square, use the CSS pixel size (not buffer size)
    const canvasSize = dimensions.width;
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    const radius = canvasSize / 2 - 20;

    // Initialize particles
    const rng = new SeededRNG(Date.now() + Math.random() * 1000000); // Random seed each time
    const targetParticleCount = 9000;
    const particles: Particle[] = [];
    const springStrength = 0.15;
    const damping = 0.85;
    const jiggleStrength = 0.15; // Increased jiggle force for larger movements
    let time = 0; // Time counter for smooth jiggle

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
        const particleRadius = rng.nextFloat(0.5, 1.5);
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
    // Dots can be slightly inside or outside the border for organic appearance
    const edgeDotCount = Math.floor(radius * 2 * Math.PI / 5); // Sparse sampling - ~1 dot per 5px
    const edgeVariance = 3; // Variance from edge - allows dots to go outside border
    
    for (let i = 0; i < edgeDotCount; i++) {
      // Angle around the circle
      const angle = (i / edgeDotCount) * Math.PI * 2;
      
      // Position on edge with variance (can be inside or outside the border)
      const edgeRadius = radius + (rng.next() * 2 - 1) * edgeVariance;
      const finalX = centerX + edgeRadius * Math.cos(angle);
      const finalY = centerY + edgeRadius * Math.sin(angle);
      
      // Calculate normalized y position (0 at top, 1 at bottom)
      const normalizedY = (finalY - (centerY - radius)) / (radius * 2);
      const clampedY = Math.max(0, Math.min(1, normalizedY));
      
      // Apply density gradient with reduced probability to make edge dots sparser
      const probability = Math.pow(clampedY, 5) * 0.3; // Reduce by 70% to make much sparser
      
      // Only place dot if probability check passes
      if (rng.next() < probability) {
        const particleRadius = rng.nextFloat(0.5, 1.5);
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

    // Animation loop
    const animate = () => {
      // Clear using CSS pixel coordinates (context is scaled)
      ctx.clearRect(0, 0, canvasSize, canvasSize);

      // Draw circular clipping path - slightly larger to allow edge dots outside border
      ctx.save();
      ctx.beginPath();
      const clipRadius = radius + 4; // Allow edge dots to be visible slightly outside
      ctx.arc(centerX, centerY, clipRadius, 0, Math.PI * 2);
      ctx.clip();

      // Update and draw particles
      particles.forEach((particle) => {
        // Spring force back to anchor
        const anchorDx = particle.anchorX - particle.x;
        const anchorDy = particle.anchorY - particle.y;
        particle.vx += anchorDx * springStrength;
        particle.vy += anchorDy * springStrength;

        // Add looping jiggle - particles orbit in circles around their anchors
        const jiggleSeed = (particle.anchorX + particle.anchorY) * 0.01;
        const orbitRadius = 4; // Larger orbit radius for more visible movement
        const orbitSpeed = 0.003; // Slow orbit speed
        const orbitAngle = (time * orbitSpeed + jiggleSeed) % (Math.PI * 2);
        
        // Target position in orbit around anchor
        const targetX = particle.anchorX + Math.cos(orbitAngle) * orbitRadius;
        const targetY = particle.anchorY + Math.sin(orbitAngle) * orbitRadius;
        
        // Gentle force toward orbit position
        const orbitDx = targetX - particle.x;
        const orbitDy = targetY - particle.y;
        particle.vx += orbitDx * jiggleStrength;
        particle.vy += orbitDy * jiggleStrength;

        // Apply damping
        particle.vx *= damping;
        particle.vy *= damping;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Constrain to circle with allowance for edge dots to go slightly outside
        const distFromCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) + Math.pow(particle.y - centerY, 2)
        );
        const maxRadius = radius + 3; // Allow particles to go slightly outside border
        if (distFromCenter > maxRadius - particle.radius) {
          const angle = Math.atan2(
            particle.y - centerY,
            particle.x - centerX
          );
          particle.x = centerX + (maxRadius - particle.radius) * Math.cos(angle);
          particle.y = centerY + (maxRadius - particle.radius) * Math.sin(angle);
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

      // Increment time for jiggle animation
      time++;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions]);

  return (
    <div className="bg-white">
      <div className="h-screen flex flex-col">
        <div className="flex flex-col gap-4">
          {/* Top Row */}
          <div className="flex items-center justify-center px-6 pt-6 relative">
            {/* Logo */}
            <div>
              <Logo className="w-20 h-10" />
            </div>
          </div>

          <div className="flex flex-col gap-16">
            {/* Hero Text */}
            <div className="flex flex-col items-center relative">
              <h1 className="text-lg mr-1 leading-none font-bold">CIVIE</h1>
              <p className="text-lg text-center max-w-lg px-8 leading-none">MODERN CIVIC POLLING</p>
              <p className="text-lg text-center max-w-lg px-8 leading-none">YOUR SAY, EVERY DAY</p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 relative">
              <Button
                asChild
                variant="outline"
                className="rounded-full shadow-none border-black"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                asChild
                className="rounded-full"
              >
                <Link
                  href="https://docs.google.com/forms/d/e/1FAIpQLSeYSquOqcAmSwOrgbqj5w4WXyjNXVbElp0HXJc_VyuK3iTU5Q/viewform?usp=header"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Join Waitlist
                </Link>
              </Button>
            </div>
            
          </div>
        </div>

        {/* Particle Field */}
        <div className="flex-1 flex items-center justify-center px-4 relative max-h-[60vh] sm:max-h-none">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[80vh]"
            style={{ display: "block" }}
          />
        </div>
      </div>

      {/* Feature List */}
      <div className="flex flex-col items-center gap-2 py-8">
        <p className="text-center leading-none hover:underline cursor-default">VERIFIED PEOPLE</p>
        <p className="text-center leading-none hover:underline cursor-default">DAILY QUESTIONS</p>
        <p className="text-center leading-none hover:underline cursor-default">ANONYMOUS ANSWERS</p>
        <p className="text-center leading-none hover:underline cursor-default">AGGREGATED RESULTS</p>
        <p className="text-center leading-none hover:underline cursor-default">NEUTRAL AND INFORMATIVE</p>
        <p className="text-center leading-none hover:underline cursor-default">SAFE EXPRESSION</p>
        <p className="text-center leading-none hover:underline cursor-default">OPEN PUBLIC DATA</p>
      </div>

      {/* Footer */}
      <footer className="bg-black text-white flex justify-center items-center py-8">
        <Logo className="w-20 h-10" />
      </footer>
    </div>
  );
}
