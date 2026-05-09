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
      {/* Half-sun OUTLINE — arc only, base is drawn separately */}
      <path
        d="M 4 23 A 12 12 0 0 1 28 23"
        fill="none"
        stroke={sunColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizon — wider base line extending beyond the semicircle */}
      <line
        x1="1"
        y1="23"
        x2="31"
        y2="23"
        stroke={sunColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 5 sun rays */}
      <line x1="16" y1="8" x2="16" y2="3"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="11" y1="10" x2="9" y2="6"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="21" y1="10" x2="23" y2="6"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="8" y1="14" x2="5" y2="12"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="14" x2="27" y2="12"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Gnomon */}
      <rect
        x="14.5"
        y="14"
        width="3"
        height="8"
        rx="1.5"
        fill={gnomonColor}
      />
    </svg>
  );
}
