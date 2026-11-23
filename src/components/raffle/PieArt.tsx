// Hand-drawn lattice pie on a plate with a holly sprig, as inline SVG so it
// stays crisp at any size and costs no image download.

export default function PieArt({ className = "", uid = "pa" }: { className?: string; uid?: string }) {
  const strips = [-120, -72, -24, 24, 72, 120];
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="A fresh-baked lattice pie">
      <defs>
        <radialGradient id={`${uid}-plate`} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="80%" stopColor="#f3ede1" />
          <stop offset="100%" stopColor="#e4d9c4" />
        </radialGradient>
        <radialGradient id={`${uid}-fill`} cx="50%" cy="45%" r="55%">
          <stop offset="0%" stopColor="#d9792a" />
          <stop offset="100%" stopColor="#a8481c" />
        </radialGradient>
        <linearGradient id={`${uid}-crust`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6c27a" />
          <stop offset="100%" stopColor="#d9954a" />
        </linearGradient>
        <clipPath id={`${uid}-clip`}>
          <circle cx="200" cy="200" r="118" />
        </clipPath>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#06141f" floodOpacity="0.35" />
        </filter>
      </defs>

      {/* plate */}
      <circle cx="200" cy="200" r="182" fill={`url(#${uid}-plate)`} filter={`url(#${uid}-shadow)`} />
      <circle cx="200" cy="200" r="160" fill="none" stroke="#e2d6bf" strokeWidth="2" />

      {/* crust rim */}
      <circle cx="200" cy="200" r="142" fill={`url(#${uid}-crust)`} />
      {Array.from({ length: 28 }).map((_, i) => {
        const a = (i / 28) * Math.PI * 2;
        return (
          <circle
            key={i}
            cx={200 + Math.cos(a) * 131}
            cy={200 + Math.sin(a) * 131}
            r="14"
            fill={i % 2 ? "#eeb066" : "#f3bd76"}
            stroke="#d08b42"
            strokeWidth="1.2"
          />
        );
      })}

      {/* filling + lattice */}
      <circle cx="200" cy="200" r="118" fill={`url(#${uid}-fill)`} />
      <g clipPath={`url(#${uid}-clip)`}>
        {strips.map((o) => (
          <rect key={`v${o}`} x={200 + o - 13} y="70" width="26" height="260" rx="10" fill={`url(#${uid}-crust)`} stroke="#c98340" strokeWidth="1.2" />
        ))}
        {strips.map((o, i) => (
          <g key={`h${o}`}>
            <rect x="70" y={200 + o - 13} width="260" height="26" rx="10" fill={`url(#${uid}-crust)`} stroke="#c98340" strokeWidth="1.2" />
            {/* weave: every other crossing the vertical strip sits on top */}
            {strips.map((v, j) =>
              (i + j) % 2 ? (
                <rect key={v} x={200 + v - 13} y={200 + o - 14} width="26" height="28" fill={`url(#${uid}-crust)`} stroke="#c98340" strokeWidth="1.2" />
              ) : null,
            )}
          </g>
        ))}
        {/* sugar sparkle */}
        {[
          [150, 140], [240, 120], [270, 230], [170, 270], [120, 210], [215, 190], [260, 165], [190, 235],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2.2" fill="#fff6e3" opacity="0.85" />
        ))}
      </g>

      {/* holly */}
      <g transform="translate(300 78) rotate(18)">
        <path d="M0 0 C 18 -14, 44 -12, 58 4 C 46 6, 40 14, 42 24 C 30 18, 20 20, 14 30 C 10 18, 2 10, -10 8 Z" fill="#2f6f4f" />
        <path d="M0 0 C -18 -14, -44 -12, -58 4 C -46 6, -40 14, -42 24 C -30 18, -20 20, -14 30 C -10 18, -2 10, 10 8 Z" fill="#3b8460" />
        <circle cx="-6" cy="8" r="9" fill="#b8452f" />
        <circle cx="8" cy="12" r="9" fill="#cf5a3f" />
        <circle cx="1" cy="-4" r="8" fill="#b8452f" />
        <circle cx="-3" cy="-7" r="2.4" fill="#fff" opacity="0.6" />
      </g>
    </svg>
  );
}
