"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export type Tone = "paper" | "ink" | "pink" | "acid";

const TONES: Record<Tone, string> = {
  paper: "bg-[#f3ede2] text-[#141414]",
  ink: "bg-[#141414] text-[#f3ede2]",
  pink: "bg-[#e1449b] text-[#141414]",
  acid: "bg-[#d9f24a] text-[#141414]",
};

/** Full-bleed poster slide with the running header strip. */
export function Slide({
  tone,
  kicker,
  index,
  children,
  className,
}: {
  tone: Tone;
  kicker: string;
  index: number;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex h-full w-full flex-col overflow-hidden", TONES[tone])}>
      <div className="flex items-center justify-between px-6 pt-10 font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
        <span>Condors ’26</span>
        <span>{kicker}</span>
        <span>{String(index + 1).padStart(2, "0")}</span>
      </div>
      <div className="mx-6 mt-3 border-t-2 border-current opacity-80" />
      <div className={cn("flex flex-1 flex-col px-6 pt-6 pb-10", className)}>{children}</div>
    </div>
  );
}

/** Staggered entrance. Keyframes live in story.tsx. */
export function Rise({
  delay = 0,
  className,
  children,
}: {
  delay?: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={className}
      style={{ animation: `wrapped-rise 700ms cubic-bezier(.2,.8,.2,1) ${delay}ms both` }}
    >
      {children}
    </div>
  );
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs tracking-[0.2em] uppercase opacity-70", className)}>
      {children}
    </p>
  );
}

export function Big({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p
      className={cn(
        "text-[5.5rem] leading-[0.85] font-bold tracking-[-0.06em] tabular-nums sm:text-[7rem]",
        className,
      )}
    >
      {children}
    </p>
  );
}

export function CountUp({ value, decimals = 0 }: { value: number; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame = 0;
    const start = performance.now();
    const duration = 1400;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setDisplay(value * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return (
    <>
      {display.toLocaleString("en-GB", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </>
  );
}

export function Delta({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border-2 border-current px-3 py-1 font-mono text-xs font-semibold tracking-wider uppercase">
      {up ? "▲" : "▼"} {Math.abs(pct)}% vs ’25
    </span>
  );
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Face({
  name,
  image,
  className,
}: {
  name: string;
  image: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-current bg-current/10 font-bold",
        className,
      )}
    >
      {image ? (
        // oxlint-disable-next-line nextjs/no-img-element
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
