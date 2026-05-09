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
      {/* Half-sun OUTLINE — semicircle moved down (center y=25 instead of 23) */}
      <path
        d="M 5 25 A 11 11 0 0 1 27 25"
        fill="none"
        stroke={sunColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Horizon — wider base line */}
      <line
        x1="1"
        y1="25"
        x2="31"
        y2="25"
        stroke={sunColor}
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* 5 sun rays — repositioned for new sun center */}
      {/* Center vertical */}
      <line x1="16" y1="11" x2="16" y2="5"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* ±36° from vertical */}
      <line x1="10.5" y1="13" x2="8.5" y2="8"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="21.5" y1="13" x2="23.5" y2="8"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      {/* ±72° from vertical */}
      <line x1="7" y1="17" x2="3.5" y2="15"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="25" y1="17" x2="28.5" y2="15"
        stroke={sunColor} strokeWidth="2.5" strokeLinecap="round" />

      {/* Gnomon — chunkier yellow pin sitting ON the horizon */}
      <rect
        x="14"
        y="15"
        width="4"
        height="10"
        rx="2"
        fill={gnomonColor}
      />
    </svg>
  );
}
