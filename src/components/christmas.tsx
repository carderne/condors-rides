// Christmas decoration components

export function Snowflake({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 0L12 24M0 12L24 12M3.5 3.5L20.5 20.5M20.5 3.5L3.5 20.5M12 4L10 6L12 8L14 6L12 4M12 16L10 18L12 20L14 18L12 16M4 12L6 10L8 12L6 14L4 12M16 12L18 10L20 12L18 14L16 12"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function ChristmasTree({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12,2 4,12 8,12 3,20 21,20 16,12 20,12" fill="currentColor" />
      <rect x="10" y="20" width="4" height="3" fill="#8B4513" />
      <circle cx="12" cy="5" r="1" fill="#FFD700" />
      <circle cx="9" cy="10" r="0.8" fill="#FF0000" />
      <circle cx="15" cy="10" r="0.8" fill="#FFD700" />
      <circle cx="7" cy="15" r="0.8" fill="#FF0000" />
      <circle cx="12" cy="14" r="0.8" fill="#FFD700" />
      <circle cx="17" cy="15" r="0.8" fill="#FF0000" />
    </svg>
  );
}

export function TwinklingLights() {
  const colors = [
    "#ff0000",
    "#00ff00",
    "#ffd700",
    "#ff0000",
    "#00ff00",
    "#ffd700",
    "#ff0000",
    "#00ff00",
    "#ffd700",
    "#ff0000",
    "#00ff00",
    "#ffd700",
  ];
  return (
    <div className="absolute top-0 right-0 left-0 flex justify-around px-2 py-1">
      {colors.map((color, i) => (
        <div
          key={i}
          className="relative"
          style={{
            animation: `twinkle 1.5s ease-in-out infinite`,
            animationDelay: `${i * 0.15}s`,
          }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 6px 2px ${color}`,
            }}
          />
          <div className="absolute top-full left-1/2 h-2 w-px -translate-x-1/2 bg-green-800" />
        </div>
      ))}
    </div>
  );
}

export function FallingSnowflakes({ count = 12 }: { count?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="absolute text-white/60"
          style={{
            left: `${i * (100 / count) + 50 / count}%`,
            animation: `snowfall ${3 + (i % 3)}s linear infinite`,
            animationDelay: `${i * 0.4}s`,
            fontSize: `${8 + (i % 4) * 2}px`,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
}

export function ChristmasGarland() {
  return (
    <div className="absolute right-0 bottom-0 left-0 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-green-600" />
  );
}
