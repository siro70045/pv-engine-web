"use client";

// Segmented pill group — the simulator's replacement for dropdowns.
// Finite options, ≥44px tap targets, yellow = active selection.

export interface PillOption<T extends string | number | null> {
  value: T;
  label: string;
}

export default function Pills<T extends string | number | null>({
  options,
  value,
  onChange,
  name,
}: {
  options: PillOption<T>[];
  value: T;
  onChange: (v: T) => void;
  name: string;
}) {
  return (
    <div role="radiogroup" aria-label={name} className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={[
              "min-h-11 px-4 py-2 rounded-full border font-sans text-sm",
              "transition-all duration-200 ease-out active:scale-[0.98]",
              "motion-reduce:transition-none motion-reduce:active:scale-100",
              "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-meridiana-yellow-hover",
              "cursor-pointer",
              selected
                ? "bg-meridiana-yellow border-meridiana-yellow text-meridiana-black font-semibold shadow-sm"
                : "bg-meridiana-cream-light border-meridiana-border-light text-meridiana-text-secondary font-medium hover:border-meridiana-border-medium",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
