"use client";

import { motion, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { XOMark } from "./brand/xo-mark";

export function Nav() {
  const { scrollY } = useScroll();
  const blur = useTransform(scrollY, [0, 200], [0, 14]);
  const bg = useTransform(
    scrollY,
    [0, 200],
    ["rgba(8, 9, 10, 0)", "rgba(8, 9, 10, 0.72)"],
  );
  const border = useTransform(
    scrollY,
    [0, 200],
    ["rgba(255,255,255,0)", "rgba(255,255,255,0.06)"],
  );

  return (
    <motion.header
      style={{
        backdropFilter: blur.get() ? `blur(${blur.get()}px)` : undefined,
        WebkitBackdropFilter: blur.get() ? `blur(${blur.get()}px)` : undefined,
        backgroundColor: bg,
        borderBottomColor: border,
      }}
      className="fixed inset-x-0 top-0 z-50 border-b transition-[backdrop-filter]"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <XOMark size={26} />
          <span className="text-[15px]">XO</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm text-white/70 md:flex">
          <a href="#workforce" className="transition hover:text-white">
            Workforce
          </a>
          <a href="#demo" className="transition hover:text-white">
            Demo
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
          <a href="https://docs.xo.builders" className="transition hover:text-white">
            Docs
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="https://beta.xo.builders/"
            className="hidden rounded-lg px-3 py-1.5 text-sm text-white/80 transition hover:text-white sm:inline-block"
          >
            Sign in
          </Link>
          <Link
            href="https://beta.xo.builders/"
            className="rounded-lg bg-[var(--color-xo-lime)] px-3.5 py-1.5 text-sm font-semibold text-black transition hover:bg-[hsl(92,66%,60%)]"
          >
            Start free
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
