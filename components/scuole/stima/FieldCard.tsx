// Single form-field surface: white card, soft diffuse shadow, generous radius.
// Label sits above the control; optional hint below the label.

export default function FieldCard({
  label,
  hint,
  secondary = false,
  children,
}: {
  label: string;
  hint?: string;
  secondary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section
      className={[
        "rounded-2xl p-5 md:p-6 shadow-[0_8px_30px_rgba(26,22,18,0.06)]",
        secondary ? "bg-meridiana-cream-light" : "bg-white",
      ].join(" ")}
    >
      <h2
        className={[
          "font-sans text-sm font-semibold tracking-wide",
          secondary ? "text-meridiana-text-secondary" : "text-meridiana-black",
        ].join(" ")}
      >
        {label}
      </h2>
      {hint && (
        <p className="font-sans text-xs text-meridiana-text-tertiary mt-1">
          {hint}
        </p>
      )}
      <div className="mt-3">{children}</div>
    </section>
  );
}
