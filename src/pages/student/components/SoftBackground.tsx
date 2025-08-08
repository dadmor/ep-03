/* path: src/components/CursorStyleBackground.tsx */
import React from "react";

export const CursorStyleBackground: React.FC<{
  className?: string;
  opacity?: number;
  speed?: number;
}> = ({ className = "", opacity = 0.55, speed = 1 }) => {
  const dur = (base: number) =>
    `${Math.max(2, base / Math.max(speed, 0.0001))}s`;

  const SIZE = 200;
  const OFFSET = -50;

  const PALETTE_H = 34;
  const PALETTE_Y = 100 - PALETTE_H;

  return (
    <div
      className={`mx-1 md:mx-4 mb-28 rounded-2xl pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      style={{ opacity }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          {/* Gradienty plam */}
          <radialGradient id="bg-orange" cx="75%" cy="65%" r="55%">
            <stop offset="0%" stopColor="#CE7314" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#CE7314" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#CE7314" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#CE7314" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bg-yellow" cx="50%" cy="75%" r="50%">
            <stop offset="0%" stopColor="#CFBD04" stopOpacity="0.85" />
            <stop offset="35%" stopColor="#CFBD04" stopOpacity="0.6" />
            <stop offset="70%" stopColor="#CFBD04" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#CFBD04" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bg-purple" cx="25%" cy="70%" r="55%">
            <stop offset="0%" stopColor="#604A97" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#604A97" stopOpacity="0.7" />
            <stop offset="70%" stopColor="#604A97" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#604A97" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bg-orange-accent" cx="85%" cy="85%" r="25%">
            <stop offset="0%" stopColor="#CE7314" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#CE7314" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#CE7314" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bg-purple-accent" cx="15%" cy="85%" r="25%">
            <stop offset="0%" stopColor="#604A97" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#604A97" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#604A97" stopOpacity="0" />
          </radialGradient>

          {/* Maska góry */}
          <linearGradient id="fade-top" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="25%" stopColor="white" stopOpacity="0.05" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="70%" stopColor="white" stopOpacity="0.8" />
            <stop offset="85%" stopColor="white" stopOpacity="0.95" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="mask-fade">
            <rect width="100%" height="100%" fill="url(#fade-top)" />
          </mask>

          {/* Paleta */}
          <linearGradient id="palette" x1="0" y1="1" x2="1" y2="1">
            <stop offset="0%" stopColor="#CE7314" />
            <stop offset="50%" stopColor="#CFBD04" />
            <stop offset="100%" stopColor="#604A97" />
          </linearGradient>

          <linearGradient id="palette-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="30%" stopColor="white" stopOpacity="0.9" />
            <stop offset="100%" stopColor="white" stopOpacity="1" />
          </linearGradient>
          <mask id="palette-mask">
            <rect width="100%" height={PALETTE_H} fill="url(#palette-fade)" />
          </mask>
        </defs>

        {/* Tło zabezpieczające */}
        <rect width="100%" height="100%" fill="#0b0b0b" opacity="0.02" />

        {/* Plamy */}
        <g style={{ mixBlendMode: "screen" as any, isolation: "isolate" }} mask="url(#mask-fade)">
          <rect width={SIZE} height={SIZE} x={OFFSET} y={OFFSET} fill="url(#bg-orange)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="120 50 50"
              to="-240 50 50"
              dur={dur(22)}
              repeatCount="indefinite"
            />
          </rect>

          <rect width={SIZE} height={SIZE} x={OFFSET} y={OFFSET} fill="url(#bg-yellow)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 50 50"
              to="-360 50 50"
              dur={dur(26)}
              repeatCount="indefinite"
            />
          </rect>

          <rect width={SIZE} height={SIZE} x={OFFSET} y={OFFSET} fill="url(#bg-purple)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="-120 50 50"
              to="240 50 50"
              dur={dur(30)}
              repeatCount="indefinite"
            />
          </rect>

          <ellipse cx="85" cy="85" rx="15" ry="10" fill="url(#bg-orange-accent)" opacity="0.7" />
          <ellipse cx="15" cy="85" rx="15" ry="10" fill="url(#bg-purple-accent)" opacity="0.7" />
        </g>

        {/* Pasek palety */}
        <g transform={`translate(0, ${PALETTE_Y})`}>
          <rect width="100" height={PALETTE_H} fill="url(#palette)" mask="url(#palette-mask)" />
        </g>
      </svg>
    </div>
  );
};

export default CursorStyleBackground;
