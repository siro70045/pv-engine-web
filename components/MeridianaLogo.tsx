interface MeridianaLogoProps {
  size?: number;
  className?: string;
  variant?: "default" | "on-dark";
}

export default function MeridianaLogo({
  size = 24,
  className = "",
  variant = "default",
}: MeridianaLogoProps) {
  const sunColor = variant === "on-dark" ? "#FBF7F0" : "#1A1612";
  const gnomonColor = "#E8B547";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Logo Meridiana"
    >
      {/* Half-sun body (semicircle) */}
      <path
        d="M 4 23 A 12 12 0 0 1 28 23 L 4 23 Z"
        fill={sunColor}
      />

      {/* Sun rays — 7 rays radiating upward */}
      <line x1="16" y1="4" x2="16" y2="9" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />

      <line x1="7" y1="7" x2="9" y2="11" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="7" x2="23" y2="11" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />

      <line x1="2" y1="15" x2="6" y2="15" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="30" y1="15" x2="26" y2="15" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />

      <line x1="11" y1="5" x2="12.5" y2="9.5" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="21" y1="5" x2="19.5" y2="9.5" stroke={sunColor} strokeWidth="2" strokeLinecap="round" />

      {/* Gnomon — central yellow vertical pin */}
      <rect
        x="14.5"
        y="12"
        width="3"
        height="11"
        rx="1.5"
        fill={gnomonColor}
      />
    </svg>
  );
}
