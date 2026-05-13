import { useMemo } from 'react';

const CRAYON_COLORS = [
  '#f4a07a', '#a8d8a8', '#f7c59f', '#b8c9f0',
  '#f0b8c8', '#c8b8f0', '#f0e08a', '#a8d8f0',
];

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function inApple(x, y) {
  const dx = (x - 14) / 8;
  const dy = (y - 16) / 7.5;
  return dx * dx + dy * dy < 1;
}

function Apple({ filled, onClick, appleIndex }) {
  const uid = `apple-${appleIndex}`;
  const color = useMemo(() => CRAYON_COLORS[appleIndex % CRAYON_COLORS.length], [appleIndex]);

  const strokes = useMemo(() => {
    if (!filled) return [];
    const rand = seededRand(appleIndex * 137 + 42);
    const lines = [];
    for (let i = 0; i < 120; i++) {
      let x, y, attempts = 0;
      do {
        x = 6 + rand() * 16;
        y = 8 + rand() * 16;
        attempts++;
      } while (!inApple(x, y) && attempts < 20);
      if (!inApple(x, y)) continue;

      const angle = rand() * Math.PI * 2;
      const len = 2 + rand() * 4;
      const dx = Math.cos(angle) * len;
      const dy = Math.sin(angle) * len;
      lines.push({
        x1: x, y1: y,
        x2: x + dx, y2: y + dy,
        op: 0.4 + rand() * 0.5,
        w: 0.8 + rand() * 1.2
      });
    }
    return lines;
  }, [filled, appleIndex]);

  const wobbleBody = useMemo(() => {
    const rand = seededRand(appleIndex * 53);
    const points = 36;
    let d = '';
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = 1 + (rand() - 0.5) * 0.06;
      const x = 14 + Math.cos(angle) * 8 * r;
      const y = 16 + Math.sin(angle) * 7.5 * r;
      d += i === 0 ? `M ${x.toFixed(2)} ${y.toFixed(2)}` : ` L ${x.toFixed(2)} ${y.toFixed(2)}`;
    }
    return d + ' Z';
  }, [appleIndex]);

  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 28 28"
      onClick={onClick}
      style={{ cursor: 'pointer', flexShrink: 0, overflow: 'hidden' }}
    >
      <defs>
        <clipPath id={uid}>
          <path d={wobbleBody} />
        </clipPath>
      </defs>

      {/* 잎 */}
      <path
        d="M14 7 Q15.5 3 19 3.5"
        stroke={filled ? color : '#c8c4e0'}
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />

      {/* 외곽선 */}
      <path
        d={wobbleBody}
        fill="none"
        stroke={filled ? color : '#c8c4e0'}
        strokeWidth="1.4"
      />

      {/* 크레파스 선들 */}
      {filled && (
        <g clipPath={`url(#${uid})`}>
          {strokes.map((s, i) => (
            <line
              key={i}
              x1={s.x1} y1={s.y1}
              x2={s.x2} y2={s.y2}
              stroke={color}
              strokeWidth={s.w}
              strokeOpacity={s.op}
              strokeLinecap="round"
            />
          ))}
        </g>
      )}
    </svg>
  );
}

export default Apple;