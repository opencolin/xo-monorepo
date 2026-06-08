"use client";

import { useEffect, useRef } from "react";

/**
 * ChevronParticles: a 2D canvas particle scene.
 *
 * Particles enter from random off-screen positions, fly into a target
 * point on the XO chevron mark, jitter, and remain breathing forever.
 * Mouse/cursor influence pushes them gently, giving the hero a "living"
 * feel without WebGL overhead.
 */
type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  r: number;
  hue: number;
  alpha: number;
  delay: number;
};

// Source viewBox of the XO mark is 0..500. We sample points along the four
// chevron polylines, then rescale into the canvas.
const CHEVRON_POLYLINES: number[][][] = [
  // outer left (white)
  [
    [36.99, 165.84],
    [118.47, 247.31],
    [31.16, 334.61],
  ],
  // inner left (white)
  [
    [244.91, 165.84],
    [163.44, 247.31],
    [250.74, 334.61],
  ],
  // inner right (lime)
  [
    [328.12, 165.06],
    [246.65, 246.53],
    [333.95, 333.84],
  ],
  // outer right (lime)
  [
    [380.51, 165.06],
    [461.99, 246.53],
    [374.68, 333.84],
  ],
];

// Per-polyline color hint. Index matches CHEVRON_POLYLINES order.
const POLY_HUES = [0, 0, 92, 92]; // 0 = white, 92 = lime

function samplePolyline(points: number[][], samples: number) {
  const out: { x: number; y: number; hueIndex: number }[] = [];
  // measure total length
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += Math.hypot(
      points[i + 1][0] - points[i][0],
      points[i + 1][1] - points[i][1],
    );
  }
  const step = total / samples;
  let acc = 0;
  let segIdx = 0;
  let segStart = 0;
  let segLen = Math.hypot(
    points[1][0] - points[0][0],
    points[1][1] - points[0][1],
  );

  for (let s = 0; s < samples; s++) {
    const target = s * step;
    while (target > segStart + segLen && segIdx < points.length - 2) {
      segStart += segLen;
      segIdx++;
      segLen = Math.hypot(
        points[segIdx + 1][0] - points[segIdx][0],
        points[segIdx + 1][1] - points[segIdx][1],
      );
    }
    const t = (target - segStart) / segLen;
    const x =
      points[segIdx][0] + (points[segIdx + 1][0] - points[segIdx][0]) * t;
    const y =
      points[segIdx][1] + (points[segIdx + 1][1] - points[segIdx][1]) * t;
    out.push({ x, y, hueIndex: 0 });
    acc += step;
  }
  return out;
}

export function ChevronParticles({ density = 110 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, active: false });

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frame = 0;
    let raf = 0;
    let startedAt = performance.now();

    const buildTargets = () => {
      const w = width;
      const h = height;
      // Fit the 500x500 mark into ~min(w,h)*0.62 centered.
      const scale = Math.min(w, h) * 0.0014; // 500 * 0.0014 = 0.7 of min
      const offsetX = (w - 500 * scale) / 2;
      const offsetY = (h - 500 * scale) / 2;

      const targets: { x: number; y: number; hueIndex: number }[] = [];
      CHEVRON_POLYLINES.forEach((poly, i) => {
        const samples = samplePolyline(poly, density);
        samples.forEach((s) => {
          targets.push({
            x: offsetX + s.x * scale,
            y: offsetY + s.y * scale,
            hueIndex: i,
          });
        });
      });
      return targets;
    };

    const init = () => {
      const targets = buildTargets();
      particles = targets.map((t, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        tx: t.x,
        ty: t.y,
        vx: 0,
        vy: 0,
        r: 1.1 + Math.random() * 1.2,
        hue: POLY_HUES[t.hueIndex],
        alpha: 0,
        delay: 200 + Math.random() * 1400,
      }));
      // ambient particles for depth
      const ambientCount = Math.floor(targets.length * 0.4);
      for (let i = 0; i < ambientCount; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          tx: Math.random() * width,
          ty: Math.random() * height,
          vx: 0,
          vy: 0,
          r: 0.5 + Math.random() * 0.7,
          hue: Math.random() < 0.7 ? 0 : 92,
          alpha: 0,
          delay: Math.random() * 2200,
        });
      }
    };

    const resize = () => {
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      init();
      startedAt = performance.now();
    };

    const onMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };
    const onLeave = () => {
      mouseRef.current.active = false;
      mouseRef.current.x = -9999;
      mouseRef.current.y = -9999;
    };

    const tick = () => {
      const now = performance.now();
      const elapsed = now - startedAt;
      ctx.clearRect(0, 0, width, height);

      const mouseActive = mouseRef.current.active;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const localT = Math.max(0, elapsed - p.delay);
        // ease in alpha
        p.alpha = Math.min(1, localT / 800);

        // attractor
        const k = 0.045;
        let ax = (p.tx - p.x) * k;
        let ay = (p.ty - p.y) * k;

        // mouse repel
        if (mouseActive) {
          const dx = p.x - mx;
          const dy = p.y - my;
          const d2 = dx * dx + dy * dy;
          const range = 110;
          if (d2 < range * range && d2 > 0.01) {
            const f = (range * range - d2) / (range * range);
            ax += (dx / Math.sqrt(d2)) * f * 1.6;
            ay += (dy / Math.sqrt(d2)) * f * 1.6;
          }
        }

        // micro jitter, keeps the mark "breathing" once formed
        ax += (Math.random() - 0.5) * 0.12;
        ay += (Math.random() - 0.5) * 0.12;

        p.vx = (p.vx + ax) * 0.86;
        p.vy = (p.vy + ay) * 0.86;
        p.x += p.vx;
        p.y += p.vy;

        const isLime = p.hue === 92;
        const fill = isLime
          ? `hsla(92, 80%, 60%, ${p.alpha})`
          : `hsla(0, 0%, 96%, ${p.alpha * 0.85})`;
        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();

        if (isLime && p.alpha > 0.5) {
          ctx.shadowColor = "hsla(92, 80%, 55%, 0.8)";
          ctx.shadowBlur = 8;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      frame++;
      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [density]);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  );
}
