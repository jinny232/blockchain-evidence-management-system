"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  color: string;
};

type TinyParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  phase: number;
  color: string;
};

const PARTICLE_COUNT = 105;
const TINY_PARTICLE_COUNT = 160;
const CONNECT_DISTANCE = 125;
const CURSOR_RADIUS = 190;

const particleColors = [
  "96, 165, 250", // blue
  "34, 211, 238", // cyan
  "167, 139, 250", // purple
  "52, 211, 153", // emerald
  "244, 114, 182", // pink
];

export default function LoginParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const tinyParticlesRef = useRef<TinyParticle[]>([]);
  const mouseRef = useRef({
    x: -9999,
    y: -9999,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    let animationFrame = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;

    function randomColor() {
      return particleColors[Math.floor(Math.random() * particleColors.length)];
    }

    function resizeCanvas() {
      const pixelRatio = window.devicePixelRatio || 1;

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * pixelRatio;
      canvas.height = height * pixelRatio;

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    function createParticles() {
      particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.32,
        vy: (Math.random() - 0.5) * 0.32,
        size: Math.random() * 2 + 0.8,
        phase: Math.random() * Math.PI * 2,
        color: randomColor(),
      }));

      tinyParticlesRef.current = Array.from(
        { length: TINY_PARTICLE_COUNT },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          size: Math.random() * 1.1 + 0.35,
          opacity: Math.random() * 0.45 + 0.12,
          phase: Math.random() * Math.PI * 2,
          color: randomColor(),
        })
      );
    }

    function drawBackground() {
      const gradient = context.createLinearGradient(0, 0, width, height);

      gradient.addColorStop(0, "#020617");
      gradient.addColorStop(0.35, "#0f172a");
      gradient.addColorStop(0.7, "#172554");
      gradient.addColorStop(1, "#312e81");

      context.fillStyle = gradient;
      context.fillRect(0, 0, width, height);

      const glowA = context.createRadialGradient(
        width * 0.2,
        height * 0.15,
        0,
        width * 0.2,
        height * 0.15,
        width * 0.58
      );

      glowA.addColorStop(0, "rgba(37, 99, 235, 0.34)");
      glowA.addColorStop(1, "rgba(37, 99, 235, 0)");

      context.fillStyle = glowA;
      context.fillRect(0, 0, width, height);

      const glowB = context.createRadialGradient(
        width * 0.82,
        height * 0.78,
        0,
        width * 0.82,
        height * 0.78,
        width * 0.5
      );

      glowB.addColorStop(0, "rgba(6, 182, 212, 0.2)");
      glowB.addColorStop(1, "rgba(6, 182, 212, 0)");

      context.fillStyle = glowB;
      context.fillRect(0, 0, width, height);

      const glowC = context.createRadialGradient(
        width * 0.52,
        height * 0.42,
        0,
        width * 0.52,
        height * 0.42,
        width * 0.42
      );

      glowC.addColorStop(0, "rgba(168, 85, 247, 0.14)");
      glowC.addColorStop(1, "rgba(168, 85, 247, 0)");

      context.fillStyle = glowC;
      context.fillRect(0, 0, width, height);

      const glowD = context.createRadialGradient(
        width * 0.15,
        height * 0.9,
        0,
        width * 0.15,
        height * 0.9,
        width * 0.4
      );

      glowD.addColorStop(0, "rgba(16, 185, 129, 0.12)");
      glowD.addColorStop(1, "rgba(16, 185, 129, 0)");

      context.fillStyle = glowD;
      context.fillRect(0, 0, width, height);
    }

    function updateTinyParticles() {
      const mouse = mouseRef.current;

      tinyParticlesRef.current.forEach((particle) => {
        particle.phase += 0.01;

        particle.vx += Math.cos(particle.phase) * 0.0015;
        particle.vy += Math.sin(particle.phase) * 0.0015;

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (mouse.active && distance < 140) {
          const force = (140 - distance) / 140;
          const normalX = dx / distance;
          const normalY = dy / distance;

          particle.vx += normalX * force * 0.012;
          particle.vy += normalY * force * 0.012;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vx *= 0.992;
        particle.vy *= 0.992;

        if (particle.x < -30) particle.x = width + 30;
        if (particle.x > width + 30) particle.x = -30;
        if (particle.y < -30) particle.y = height + 30;
        if (particle.y > height + 30) particle.y = -30;
      });
    }

    function updateParticles() {
      const mouse = mouseRef.current;

      particlesRef.current.forEach((particle) => {
        particle.phase += 0.015;

        particle.vx += Math.cos(particle.phase) * 0.003;
        particle.vy += Math.sin(particle.phase) * 0.003;

        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;

        if (mouse.active && distance < CURSOR_RADIUS) {
          const force = (CURSOR_RADIUS - distance) / CURSOR_RADIUS;

          const normalX = dx / distance;
          const normalY = dy / distance;

          const tangentX = -normalY;
          const tangentY = normalX;

          particle.vx += tangentX * force * 0.09;
          particle.vy += tangentY * force * 0.09;

          particle.vx += normalX * force * 0.025;
          particle.vy += normalY * force * 0.025;
        }

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vx *= 0.025988;
        particle.vy *= 0.988;

        if (particle.x < -40) particle.x = width + 40;
        if (particle.x > width + 40) particle.x = -40;
        if (particle.y < -40) particle.y = height + 40;
        if (particle.y > height + 40) particle.y = -40;
      });
    }

    function drawTinyParticles() {
      tinyParticlesRef.current.forEach((particle) => {
        const pulse = Math.sin(particle.phase) * 0.5 + 0.5;
        const opacity = particle.opacity + pulse * 0.12;

        context.beginPath();
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fillStyle = `rgba(${particle.color}, ${opacity})`;
        context.fill();

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size * 4,
          0,
          Math.PI * 2
        );
        context.fillStyle = `rgba(${particle.color}, ${opacity * 0.08})`;
        context.fill();
      });
    }

    function drawConnections() {
      const particles = particlesRef.current;

      for (let i = 0; i < particles.length; i += 1) {
        for (let j = i + 1; j < particles.length; j += 1) {
          const first = particles[i];
          const second = particles[j];

          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECT_DISTANCE) {
            const opacity = 1 - distance / CONNECT_DISTANCE;

            context.beginPath();
            context.moveTo(first.x, first.y);
            context.lineTo(second.x, second.y);

            const mixedColor = opacity > 0.55 ? first.color : second.color;

            context.strokeStyle = `rgba(${mixedColor}, ${opacity * 0.24})`;
            context.lineWidth = 1;
            context.stroke();
          }
        }
      }
    }

    function drawCursorLinks() {
      const mouse = mouseRef.current;

      if (!mouse.active) return;

      particlesRef.current.forEach((particle) => {
        const dx = particle.x - mouse.x;
        const dy = particle.y - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < CURSOR_RADIUS) {
          const opacity = 1 - distance / CURSOR_RADIUS;

          context.beginPath();
          context.moveTo(mouse.x, mouse.y);
          context.lineTo(particle.x, particle.y);
          context.strokeStyle = `rgba(${particle.color}, ${opacity * 0.32})`;
          context.lineWidth = 1;
          context.stroke();
        }
      });
    }

    function drawCursorGlow() {
      const mouse = mouseRef.current;

      if (!mouse.active) return;

      const glow = context.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        180
      );

      glow.addColorStop(0, "rgba(96, 165, 250, 0.2)");
      glow.addColorStop(0.35, "rgba(34, 211, 238, 0.1)");
      glow.addColorStop(0.7, "rgba(167, 139, 250, 0.08)");
      glow.addColorStop(1, "rgba(34, 211, 238, 0)");

      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }

    function drawParticles() {
      particlesRef.current.forEach((particle) => {
        const pulse = Math.sin(particle.phase) * 0.5 + 0.5;
        const glowSize = particle.size * (6 + pulse * 3);

        const glow = context.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          glowSize
        );

        glow.addColorStop(0, `rgba(${particle.color}, 0.45)`);
        glow.addColorStop(0.4, `rgba(${particle.color}, 0.18)`);
        glow.addColorStop(1, `rgba(${particle.color}, 0)`);

        context.beginPath();
        context.arc(particle.x, particle.y, glowSize, 0, Math.PI * 2);
        context.fillStyle = glow;
        context.fill();

        context.beginPath();
        context.arc(
          particle.x,
          particle.y,
          particle.size + pulse * 0.7,
          0,
          Math.PI * 2
        );
        context.fillStyle = "rgba(241, 245, 249, 0.92)";
        context.fill();
      });
    }

    function animate() {
      drawBackground();

      updateTinyParticles();
      updateParticles();

      drawCursorGlow();
      drawTinyParticles();
      drawConnections();
      drawCursorLinks();
      drawParticles();

      animationFrame = requestAnimationFrame(animate);
    }

    function handleMouseMove(event: MouseEvent) {
      mouseRef.current = {
        x: event.clientX,
        y: event.clientY,
        active: true,
      };
    }

    function handleTouchMove(event: TouchEvent) {
      const touch = event.touches[0];
      if (!touch) return;

      mouseRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        active: true,
      };
    }

    function handleMouseLeave() {
      mouseRef.current = {
        x: -9999,
        y: -9999,
        active: false,
      };
    }

    function handleResize() {
      resizeCanvas();
      createParticles();
    }

    resizeCanvas();
    createParticles();
    animate();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrame);

      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.2),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.15),transparent_35%),radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_40%)]" />

      <div className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:46px_46px]" />

      <div className="absolute inset-0 bg-slate-950/25" />
    </div>
  );
}