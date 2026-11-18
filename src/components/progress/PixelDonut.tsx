export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface PixelDonutProps {
  slices: DonutSlice[];
  centerTop?: string;
  centerMain?: string;
  centerBottom?: string;
  size?: number;
}

const RADIUS = 34;
const STROKE = 22;
const CIRC = 2 * Math.PI * RADIUS;

/** A segmented ring (butt-capped arcs) so it reads as blocky pixel art. */
export function PixelDonut({
  slices,
  centerTop,
  centerMain,
  centerBottom,
  size = 132,
}: PixelDonutProps) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);
  let offset = 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
          <circle
            cx="50"
            cy="50"
            r={RADIUS}
            fill="none"
            stroke="var(--surface-3)"
            strokeWidth={STROKE}
          />
          {total > 0 &&
            slices.map((slice) => {
              const length = (slice.value / total) * CIRC;
              const node = (
                <circle
                  key={slice.key}
                  cx="50"
                  cy="50"
                  r={RADIUS}
                  fill="none"
                  stroke={slice.color}
                  strokeWidth={STROKE}
                  strokeDasharray={`${Math.max(0, length - 1.5)} ${CIRC - Math.max(0, length - 1.5)}`}
                  strokeDashoffset={-offset}
                />
              );
              offset += length;
              return node;
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {centerTop && <span className="pixel-label text-muted">{centerTop}</span>}
          {centerMain && <span className="font-pixel text-xl font-bold leading-none">{centerMain}</span>}
          {centerBottom && <span className="font-pixel text-2xs text-muted">{centerBottom}</span>}
        </div>
      </div>

      <ul className="min-w-0 flex-1 space-y-1.5">
        {slices.map((slice) => {
          const percent = total > 0 ? Math.round((slice.value / total) * 100) : 0;
          return (
            <li key={slice.key} className="flex items-center gap-2">
              <span
                className="h-3.5 w-3.5 shrink-0 rounded-[3px] border-[2px] border-edge"
                style={{ background: slice.color }}
              />
              <span className="min-w-0 flex-1 truncate text-xs font-bold">{slice.label}</span>
              <span className="font-pixel text-2xs text-muted">{percent}%</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
