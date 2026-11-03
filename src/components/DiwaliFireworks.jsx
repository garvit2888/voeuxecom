import React, { useEffect, useRef, useState } from 'react';
import { isDiwaliSaleActive } from '../utils/diwaliOffers';

/**
 * Celebratory Diwali Firecracker Rockets Canvas Animation
 * Runs for exactly 15 seconds after the splash screen finishes, then automatically disappears.
 */
export const DiwaliFireworks = () => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const animationFrameId = useRef(null);
  const isSpawningRef = useRef(true);

  useEffect(() => {
    // Only run if Diwali Sale is active (e.g. from 4th Nov or ?diwali=active)
    if (!isDiwaliSaleActive()) {
      setIsActive(false);
      return;
    }

    // Delay start until after splash screen completes (~950ms)
    const startTimer = setTimeout(() => {
      setIsActive(true);
      isSpawningRef.current = true;
    }, 950);

    // Hard stop spawning rockets after 15 seconds
    const stopSpawningTimer = setTimeout(() => {
      isSpawningRef.current = false;
    }, 950 + 15000);

    // Completely unmount canvas 2.5s after spawning stops (to let active sparks fade)
    const endTimer = setTimeout(() => {
      setIsActive(false);
    }, 950 + 17500);

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
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const FESTIVE_COLORS = [
      '#FFD700', // Gold
      '#FF4500', // Orange Red
      '#FF1493', // Deep Pink / Magenta
      '#00FF7F', // Spring Green
      '#00FFFF', // Cyan
      '#FFA500', // Orange
      '#FF69B4', // Hot Pink
      '#FFFF00', // Bright Yellow
      '#9370DB'  // Purple
    ];

    const rockets = [];
    const particles = [];

    class Rocket {
      constructor() {
        this.x = width * (0.15 + Math.random() * 0.7);
        this.y = height + 10;
        this.targetY = height * (0.15 + Math.random() * 0.4);
        const targetX = this.x + (Math.random() - 0.5) * (width * 0.3);
        const dx = targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const speed = 10 + Math.random() * 4;

        this.vx = (dx / dist) * speed;
        this.vy = (dy / dist) * speed;
        this.color = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];
        this.trail = [];
        this.maxTrail = 6;
        this.exploded = false;
      }

      update() {
        this.trail.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trail.length > this.maxTrail) this.trail.shift();

        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.05;

        if (this.y <= this.targetY || this.vy >= 0) {
          this.explode();
        }
      }

      draw() {
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const radius = (i / this.trail.length) * 2.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = (i / this.trail.length) * 0.8;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = 1;
        ctx.fill();
      }

      explode() {
        this.exploded = true;
        const count = 45 + Math.floor(Math.random() * 30);
        const baseColor = this.color;
        const secondColor = FESTIVE_COLORS[Math.floor(Math.random() * FESTIVE_COLORS.length)];

        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 1 + Math.random() * 6;
          particles.push(
            new Particle(
              this.x,
              this.y,
              Math.cos(angle) * speed,
              Math.sin(angle) * speed,
              Math.random() > 0.5 ? baseColor : secondColor
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
        this.decay = 0.012 + Math.random() * 0.015;
        this.radius = 1.8 + Math.random() * 2;
      }

      update() {
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.vy += 0.08;
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
        ctx.shadowBlur = 6;
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

    // Initial volley of rockets
    setTimeout(() => launchRocket(), 100);
    setTimeout(() => launchRocket(), 400);
    setTimeout(() => launchRocket(), 750);
    setTimeout(() => launchRocket(), 1100);

    const animate = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      // Launch rockets periodically while within 15 seconds
      if (isSpawningRef.current && frameCount % 45 === 0) {
        launchRocket();
        if (Math.random() > 0.4) {
          setTimeout(() => launchRocket(), 200 + Math.random() * 250);
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
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [isActive]);

  if (!isActive) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40 select-none transition-opacity duration-1000"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
