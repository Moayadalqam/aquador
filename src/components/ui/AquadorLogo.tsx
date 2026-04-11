const sizeMap = {
  sm: 'h-8',
  md: 'h-10',
  lg: 'h-12',
  xl: 'h-14',
} as const;

interface AquadorLogoProps {
  size?: keyof typeof sizeMap;
  className?: string;
}

export default function AquadorLogo({ size = 'md', className = '' }: AquadorLogoProps) {
  const sizeClass = sizeMap[size];

  return (
    <svg
      viewBox="0 0 220 44"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Aquad'or"
      data-testid="aquador-logo"
      className={`${sizeClass} w-auto ${className}`}
    >
      <defs>
        <linearGradient id="aquador-gold-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF8DC" />
          <stop offset="35%" stopColor="#FFD700" />
          <stop offset="65%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B8960C" />
        </linearGradient>
      </defs>
      <text
        x="110"
        y="33"
        textAnchor="middle"
        fontFamily="Playfair Display, Georgia, serif"
        fontSize="32"
        fontWeight="600"
        letterSpacing="0.12em"
        fill="url(#aquador-gold-gradient)"
      >
        AQUAD&apos;OR
      </text>
    </svg>
  );
}
