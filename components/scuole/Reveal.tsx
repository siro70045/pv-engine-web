"use client";

import { useEffect, useRef, useState } from "react";
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

// One-shot viewport-entry reveal. Fades/slides its children in the first
// time they enter the viewport, then disconnects so it never replays.
// Reduced motion is handled entirely in CSS (Reveal.module.css), so we
// also skip the observer in that case — content stays visible from paint.
export default function Reveal({ children, delay = 0, className = "" }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
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
    visible ? styles.visible : "",
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
