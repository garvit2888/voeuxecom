import React, { useEffect, useRef, useState } from 'react';
import { isDiwaliSaleActive } from '../utils/diwaliOffers';
import { Sparkles, X } from 'lucide-react';

/**
 * Celebratory Diwali Firecracker Rockets Canvas Animation
 * Launches rockets that shoot across the screen, leave trails, and burst into festive sparks.
 */
export const DiwaliFireworks = () => {
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const animationFrameId = useRef(null);

  useEffect(() => {
    // Only run if Diwali Sale is active or preview is enabled
    if (!isDiwaliSaleActive()) {
      setIsActive(false);
      return;
    }

    // Delay start until after splash screen completes (~900ms)
    const startTimer = setTimeout(() => {
      setIsActive(true);
      setShowControls(true);
    }, 950);

    return () => clearTimeout(startTimer);
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
        // Target explosion area (upper 15% to 55% of screen)
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
        this.vy += 0.05; // slight gravity

        if (this.y <= this.targetY || this.vy >= 0) {
          this.explode();
        }
      }

      draw() {
        // Draw trailing spark line
        for (let i = 0; i < this.trail.length; i++) {
          const pt = this.trail[i];
          const radius = (i / this.trail.length) * 2.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.globalAlpha = (i / this.trail.length) * 0.8;
          ctx.fill();
        }

        // Draw rocket head
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
        this.vy += 0.08; // gravity
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

    // Launch schedule: frequent bursts at start (celebratory grand opening), then gentle cadence
    let frameCount = 0;
    const launchRocket = () => {
      rockets.push(new Rocket());
    };

    // Initial volley of 4 rockets staggered
    setTimeout(() => launchRocket(), 100);
    setTimeout(() => launchRocket(), 450);
    setTimeout(() => launchRocket(), 800);
    setTimeout(() => launchRocket(), 1200);

    const animate = () => {
      frameCount++;

      // Semi-transparent clear for smooth fading motion trail
      ctx.clearRect(0, 0, width, height);

      // Launch new rockets periodically:
      // First 600 frames (~10s): launch every 45-60 frames
      // After 600 frames: launch occasionally every 120 frames
      const interval = frameCount < 600 ? 50 : 130;
      if (frameCount % interval === 0) {
        launchRocket();
        if (Math.random() > 0.5) {
          setTimeout(() => launchRocket(), 200 + Math.random() * 300);
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
    <>
      {/* Non-blocking Fullscreen Canvas for Fireworks */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-40 select-none"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Floating Diwali Festive Controls (Bottom Right) */}
      {showControls && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            type="button"
            onClick={() => {
              // Trigger extra grand burst
              setIsActive(false);
              setTimeout(() => setIsActive(true), 100);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 hover:from-amber-500 hover:to-red-500 text-white rounded-full text-xs font-bold shadow-xl border border-amber-300/40 flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md"
            title="Burst more Diwali firecrackers"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-spin" />
            <span className="hidden sm:inline">Diwali Dhamaka Sparks</span>
            <span className="sm:hidden">🎆 Burst</span>
          </button>

          <button
            type="button"
            onClick={() => setShowControls(false)}
            className="w-7 h-7 bg-black/60 hover:bg-black text-gray-300 hover:text-white rounded-full flex items-center justify-center transition border border-gray-700 cursor-pointer"
            title="Hide button"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
};
