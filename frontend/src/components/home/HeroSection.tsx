"use client";

import Link from "next/link";
import { useRef, useEffect } from "react";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W: number, H: number;
    function resize() {
      W = canvas!.width = window.innerWidth;
      H = canvas!.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    // Exact same parameters as the reference HTML file
    const lights = [
      { x: 0.05, y: 0.05, vx: 0.0011, vy: 0.0007, r: [24, 37, 43] },
      { x: 0.95, y: 0.08, vx: -0.0009, vy: 0.0013, r: [36, 70, 80] },
      { x: 0.08, y: 0.55, vx: 0.0008, vy: -0.0006, r: [39, 72, 81] },
      { x: 0.92, y: 0.92, vx: -0.0012, vy: -0.0008, r: [107, 57, 66] },
      { x: 0.5, y: 0.96, vx: 0.0006, vy: -0.001, r: [54, 31, 37] },
      { x: 0.04, y: 0.95, vx: 0.0007, vy: -0.0009, r: [12, 23, 25] },
      { x: 0.5, y: 0.45, vx: -0.0005, vy: 0.0004, r: [28, 39, 45] },
    ];

    // 64px grid — same as original. Browser bilinear upscale creates smoothness.
    const SZ = 64;
    const off = new OffscreenCanvas(SZ, SZ);
    const oc = off.getContext("2d")!;
    const imgData = new ImageData(SZ, SZ);
    const px = imgData.data;

    let t = 0;
    let animId: number;

    function animate() {
      t++;
      lights.forEach((l, i) => {
        l.x += l.vx + Math.sin(t * 0.003 + i * 1.7) * 0.00035;
        l.y += l.vy + Math.cos(t * 0.0035 + i * 1.1) * 0.00035;
        if (l.x < -0.05) l.vx = Math.abs(l.vx);
        if (l.x > 1.05) l.vx = -Math.abs(l.vx);
        if (l.y < -0.05) l.vy = Math.abs(l.vy);
        if (l.y > 1.05) l.vy = -Math.abs(l.vy);
      });

      for (let py_i = 0; py_i < SZ; py_i++) {
        for (let px_i = 0; px_i < SZ; px_i++) {
          const nx = px_i / SZ;
          const ny = py_i / SZ;
          let totalW = 0;
          let accR = 0, accG = 0, accB = 0;
          lights.forEach((l) => {
            const dx = (nx - l.x) * (W / H);
            const dy = ny - l.y;
            const dist2 = dx * dx + dy * dy;
            const w = 1 / (Math.pow(dist2, 0.75) + 0.005);
            accR += l.r[0] * w;
            accG += l.r[1] * w;
            accB += l.r[2] * w;
            totalW += w;
          });
          const idx = (py_i * SZ + px_i) * 4;
          px[idx] = Math.min(255, accR / totalW);
          px[idx + 1] = Math.min(255, accG / totalW);
          px[idx + 2] = Math.min(255, accB / totalW);
          px[idx + 3] = 255;
        }
      }

      oc.putImageData(imgData, 0, 0);
      ctx!.drawImage(off, 0, 0, W, H);
      animId = requestAnimationFrame(animate);
    }

    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section
      className="relative h-[72vh] flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: "#0C1719" }}
    >
      {/* Animated gradient canvas — exact replica of reference HTML */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ imageRendering: "auto" }}
        />

      {/* Ultra-subtle grain — same as reference */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px",
          animation: "grain 0.4s steps(1) infinite",
        }}
      />

      {/* Content */}
      <div className="relative z-[2] flex flex-col items-center justify-center text-center px-4">
        {/* Logo — extracted directly from the reference HTML (already transparent) */}
        <div
          className="mb-12"
          style={{
            opacity: 0,
            transform: "translateY(20px)",
            animation: "heroFadeUp 1.4s cubic-bezier(0.16,1,0.3,1) 0.3s forwards",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/kolamba_logo_hero.png?v=2"
            alt="Kolamba - The Jewish Culture Club"
            style={{
              width: "min(680px, 82vw)",
              height: "auto",
              display: "block",
              filter: "drop-shadow(0 0 25px rgba(234,158,142,0.18)) drop-shadow(0 0 60px rgba(114,131,202,0.10)) drop-shadow(0 1px 6px rgba(0,0,0,0.50))",
            }}
          />
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register/host"
            className="px-8 py-3.5 bg-white text-black rounded-full font-bold hover:bg-gray-100 transition-all duration-200 w-full sm:w-auto sm:min-w-[220px] text-center uppercase tracking-wider text-sm"
          >
            Host Sign Up
          </Link>
          <Link
            href="/register/talent"
            className="px-8 py-3.5 bg-black text-white rounded-full font-bold hover:bg-gray-900 transition-all duration-200 w-full sm:w-auto sm:min-w-[220px] text-center uppercase tracking-wider text-sm"
          >
            Talent Sign Up
          </Link>
        </div>
      </div>
    </section>
  );
}
