"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styles from "./Reveal.module.css";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in ms; only the values used on the page are mapped. */
  delay?: 0 | 100 | 200;
  /** Extra classes for layout/spacing on the wrapper. */
  className?: string;
}

const DELAY_CLASS: Record<number, string> = {
  0: "",
  100: styles.d100,
  200: styles.d200,
};

// useLayoutEffect runs before paint (no flash) on the client, but warns
// during SSR. Fall back to useEffect on the server, where it is a no-op.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Progressive-enhancement entry reveal. The SSR markup is VISIBLE by
// default ("idle"): if JS never runs, the content is always shown — it
// just isn't animated. On the client, a layout effect arms the hidden
// state before paint, then an IntersectionObserver reveals it once. So a
// JS/hydration failure degrades to "visible, no animation" instead of an
// empty page (the previous fragile behavior).
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  // idle = visible (SSR / no-JS) · hidden = armed, awaiting viewport · visible = revealed
  const [state, setState] = useState<"idle" | "hidden" | "visible">("idle");

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion: stay visible (idle), no animation.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Arm before paint so the entrance can animate without a flash-out.
    setState("hidden");

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setState("visible");
          observer.disconnect(); // one-shot
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const classes = [
    styles.reveal,
    state === "hidden" ? styles.hidden : "",
    state === "visible" ? styles.visible : "",
    DELAY_CLASS[delay],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}
