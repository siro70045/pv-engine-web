"use client";

import { useEffect, useState } from "react";

// Dedicated loading state — the cold path can take 6-10 s (live PVGIS fetch
// server-side), so the message progresses soberly instead of spinning silently.

const STEPS: { afterMs: number; text: string }[] = [
  { afterMs: 0, text: "Calcoliamo…" },
  { afterMs: 3000, text: "Recuperiamo i dati climatici della tua zona…" },
  { afterMs: 7000, text: "Ancora un momento…" },
];

export default function LoadingCard() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = STEPS.slice(1).map((s, i) =>
      setTimeout(() => setStep(i + 1), s.afterMs),
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-white rounded-2xl shadow-[0_8px_30px_rgba(26,22,18,0.06)] p-10 flex flex-col items-center gap-5"
    >
      {/* Three pulsing dots — subdued, disabled under reduced motion */}
      <div className="flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-meridiana-yellow animate-bounce motion-reduce:animate-none"
            style={{ animationDelay: `${i * 150}ms`, animationDuration: "900ms" }}
          />
        ))}
      </div>
      <p className="font-sans text-base text-meridiana-text-secondary text-center transition-opacity duration-200">
        {STEPS[step].text}
      </p>
    </div>
  );
}
