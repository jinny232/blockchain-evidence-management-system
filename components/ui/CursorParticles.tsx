"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

export default function CursorParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId = 0;
    let time = 0;
    const particles: Particle[] = [];

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function createParticles() {
      particles.length = 0;

      const count = Math.min(85, Math.floor(window.innerWidth / 15));

      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          size: Math.random() * 2.3 + 1.2,
          opacity: Math.random() * 0.45 + 0.2,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.025,
          twinkleSpeed: Math.random() * 0.03 + 0.015,
          twinkleOffset: Math.random() * Math.PI * 2,
        });
      }
    }

    function drawStar(
      x: number,
      y: number,
      radius: number,
      rotation: number,
      opacity: number
    ) {
      const spikes = 4;
      const outerRadius = radius * 2.2;
      const innerRadius = radius * 0.55;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);

      ctx.beginPath();

      for (let i = 0; i < spikes * 2; i++) {
        const angle = (Math.PI / spikes) * i;
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;

        if (i === 0) {
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }

      ctx.closePath();

      // glow
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(59, 130, 246, ${opacity})`;
      ctx.fillStyle = `rgba(96, 165, 250, ${opacity})`;
      ctx.fill();

      // bright center
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.45, 0, Math.PI * 2);
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(147, 197, 253, ${opacity})`;
      ctx.fillStyle = `rgba(219, 234, 254, ${Math.min(opacity + 0.25, 1)})`;
      ctx.fill();

      ctx.restore();
    }

    function draw() {
      time += 1;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const particle of particles) {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.rotation += particle.rotationSpeed;

        if (particle.x < -20) particle.x = canvas.width + 20;
        if (particle.x > canvas.width + 20) particle.x = -20;
        if (particle.y < -20) particle.y = canvas.height + 20;
        if (particle.y > canvas.height + 20) particle.y = -20;

        const dx = particle.x - mouseRef.current.x;
        const dy = particle.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const force = (150 - distance) / 150;
          particle.x += dx * force * 0.025;
          particle.y += dy * force * 0.025;
        }

        const twinkle =
          Math.sin(time * particle.twinkleSpeed + particle.twinkleOffset) *
            0.25 +
          0.75;

        drawStar(
          particle.x,
          particle.y,
          particle.size,
          particle.rotation,
          particle.opacity * twinkle
        );
      }

      // connecting glow lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];

          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 115) {
            const lineOpacity = 0.12 * (1 - distance / 115);

            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.shadowBlur = 8;
            ctx.shadowColor = `rgba(59, 130, 246, ${lineOpacity})`;
            ctx.strokeStyle = `rgba(59, 130, 246, ${lineOpacity})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            ctx.shadowBlur = 0;
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    }

    function handleMouseMove(event: MouseEvent) {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
    }

    function handleResize() {
      resize();
      createParticles();
    }

    resize();
    createParticles();
    draw();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 opacity-80"
    />
  );
}