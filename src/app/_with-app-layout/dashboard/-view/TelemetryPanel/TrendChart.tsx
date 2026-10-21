import dayjs from 'dayjs';

import { useDevetekTranslations } from '@/services/i18n';

import { chartPoints, chartY } from '../../-lib/telemetry';
import type { AggregatedTelemetryPoint } from '../../-lib/telemetry';

export default function TrendChart(props: {
  points: AggregatedTelemetryPoint[];
}) {
  const { points } = props;
  const t = useDevetekTranslations('page.dashboard.telemetry');
  const hasTrend = points.length >= 2;
  const width = 720;
  const height = 220;

  return (
    <div className="min-h-64 rounded-lg border bg-background p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
          {t('chartTitle')}
        </p>
        <span className="text-xs text-muted-foreground">
          {points.at(-1)
            ? dayjs(points.at(-1)?.time).format('HH:mm:ss')
            : t('waiting')}
        </span>
      </div>

      {hasTrend ? (
        <svg
          role="img"
          aria-label={t('chartAria')}
          viewBox={`0 0 ${width} ${height}`}
          className="h-52 w-full overflow-visible"
          preserveAspectRatio="none"
        >
          {[0, 25, 50, 75, 100].map((tick) => {
            const y = chartY(tick, height);
            return (
              <g key={tick}>
                <line
                  x1="34"
                  x2={width - 12}
                  y1={y}
                  y2={y}
                  className="stroke-border"
                  strokeDasharray="4 5"
                />
                <text
                  x="0"
                  y={y + 4}
                  className="fill-muted-foreground text-[10px]"
                >
                  {tick}
                </text>
              </g>
            );
          })}
          <polyline
            points={chartPoints(points, width, height, 'cpu')}
            fill="none"
            stroke="var(--color-blue-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={chartPoints(points, width, height, 'memory')}
            fill="none"
            stroke="var(--color-green-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={chartPoints(points, width, height, 'disk')}
            fill="none"
            stroke="var(--color-amber-500)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <div className="flex h-52 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">
          {t('waiting')}
        </div>
      )}
    </div>
  );
}
