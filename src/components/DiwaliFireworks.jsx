import React, { useEffect, useRef, useState } from 'react';
import { isDiwaliSaleActive } from '../utils/diwaliOffers';

/**
 * Celebratory Diwali Firecracker Rockets Canvas Animation
 * Robust across Mobile & Desktop (Retina/High-DPI support, high z-index, zero blend-mode bugs).
 * Runs for exactly 15 seconds after the splash screen finishes.
 */
export const DiwaliFireworks = () => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const animationFrameId = useRef(null);
  const isSpawningRef = useRef(true);

  useEffect(() => {
    // Only run if Diwali Sale is active
    if (!isDiwaliSaleActive()) {
      setIsActive(false);
      return;
    }

    // Trigger right as the splash screen completes (~750ms)
    const startTimer = setTimeout(() => {
      setIsActive(true);
      isSpawningRef.current = true;
    }, 750);

    // Hard stop launching rockets after 15 seconds
    const stopSpawningTimer = setTimeout(() => {
      isSpawningRef.current = false;
    }, 750 + 15000);

    // Completely unmount canvas 2.5s after spawning ceases
    const endTimer = setTimeout(() => {
      setIsActive(false);
    }, 750 + 17500);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(stopSpawningTimer);
      clearTimeout(endTimer);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    resize();
    window.addEventListener('resize', resize);

    const FESTIVE_COLORS = [
      '#FFD700', // Brilliant Gold
      '#FF3B30', // Festive Red
      '#FF9500', // Vibrant Orange
      '#FF2D55', // Deep Pink
      '#34C759', // Emerald Green
      '#5856D6', // Royal Purple
      '#00C7BE', // Turquoise
      '#FFE600'  // Bright Yellow
    ];

    const rockets = [];
    const particles = [];

    class Rocket {
      constructor() {
        this.x = width * (0.1 + Math.random() * 0.8);
        this.y = height + 15;
        // Explode in the upper 20% to 50% of the screen
        this.targetY = height * (0.18 + Math.random() * 0.35);
        const targetX = this.x + (Math.random() - 0.5) * (width * 0.35);
        const dx = targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const speed = (width < 640 ? 11 : 13) + Math.random() * 4;

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
        this.trail = [];
        this.maxTrail = 7;
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;

        if (this.y <= this.targetY || this.vy >= 0) {
          this.explode();
        }
      }

      draw() {
        // Glowing Spark Trail
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const ratio = (i + 1) / this.trail.length;
          const radius = ratio * (width < 640 ? 2.5 : 3.2);
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = ratio * 0.85;
          ctx.shadowColor = this.color;
          ctx.shadowBlur = 8;
          ctx.fill();
        }

        // Rocket Head (Intense Glowing Spark)
        ctx.beginPath();
        ctx.arc(this.x, this.y, width < 640 ? 3.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 12;
        ctx.globalAlpha = 1;
        ctx.fill();
      }

      explode() {
        this.exploded = true;
        const count = width < 640 ? 45 + Math.floor(Math.random() * 25) : 60 + Math.floor(Math.random() * 35);
        const baseColor = this.color;
        const secondColor = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = (width < 640 ? 1.5 : 2) + Math.random() * 6.5;
          particles.push(
            new Particle(
              this.x,
              this.y,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              Math.random() > 0.4 ? baseColor : secondColor
            )
          );
        }
      }
    }

    class Particle {
      constructor(x, y, vx, vy, color) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.alpha = 1;
        this.decay = 0.014 + Math.random() * 0.016;
        this.radius = (width < 640 ? 2.2 : 2.8) + Math.random() * 2.2;
      }

      update() {
        this.vx *= 0.95;
        this.vy *= 0.95;
        this.vy += 0.09;
        this.x += this.vx;
        this.y += this.vy;
        this.alpha -= this.decay;
      }

      draw() {
        if (this.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, this.alpha);
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();
      }
    }

    let frameCount = 0;
    const launchRocket = () => {
      if (isSpawningRef.current) {
        rockets.push(new Rocket());
      }
    };

    // Immediate festive burst on load
    launchRocket();
    setTimeout(() => launchRocket(), 150);
    setTimeout(() => launchRocket(), 380);
    setTimeout(() => launchRocket(), 700);
    setTimeout(() => launchRocket(), 1100);

    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Launch rockets periodically while within 15s window
      if (isSpawningRef.current && frameCount % (width < 640 ? 35 : 42) === 0) {
        launchRocket();
        if (Math.random() > 0.35) {
          setTimeout(() => launchRocket(), 180 + Math.random() * 220);
        }
      }

      // Update & Draw Rockets
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.update();
        r.draw();
        if (r.exploded) {
          rockets.splice(i, 1);
        }
      }

      // Update & Draw Particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.update();
        p.draw();
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }

      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[100] w-full h-full select-none"
    />
  );
};
