import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import type { ChartOptions, ScriptableContext } from 'chart.js';

import type { FleetSeverity } from '../../-lib/fleet-utilisation';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
);

/**
 * The fleet average line. One hue for all three resources: these are small
 * multiples of the same measure, so varying colour between them would imply a
 * difference that is not there.
 */
export const FLEET_AVERAGE_COLOR = '#0284c7';

/**
 * The peak line's colour follows how bad the peak is. Validated against both
 * card surfaces: sky against amber and sky against red each clear the
 * colour-blindness separation and 3:1 contrast in light and dark. The healthy
 * case reuses the average's hue, because an unremarkable peak should not
 * announce itself — the dash pattern still tells the two lines apart.
 */
export function fleetPeakColor(severity: FleetSeverity) {
  switch (severity) {
    case 'critical':
      return '#dc2626';
    case 'warning':
      return '#d97706';
    default:
      return 'rgba(2, 132, 199, 0.45)';
  }
}

/**
 * Radius for one plotted point. A line needs two readings to draw anything,
 * so a series holding a single reading — a freshly started server, or the
 * first bucket after a gap — would render as an empty chart. Points with no
 * neighbour are drawn as a dot instead, while runs of readings stay clean
 * lines.
 */
export function isolatedPointRadius(context: ScriptableContext<'line'>) {
  const data = context.dataset.data as Array<number | null>;
  const index = context.dataIndex;
  if (data[index] == null) return 0;

  const hasNeighbour = data[index - 1] != null || data[index + 1] != null;
  return hasNeighbour ? 0 : 3;
}

/** Shared y-axis bounds, so the three charts can be compared at a glance. */
const Y_AXIS = {
  min: 0,
  max: 100,
  ticks: {
    stepSize: 50,
    callback: (value: string | number) => `${value}%`,
    color: 'rgba(113, 113, 122, 0.9)',
    font: { size: 10 },
  },
  grid: { color: 'rgba(113, 113, 122, 0.16)' },
  border: { display: false },
};

export function fleetChartOptions(
  tooltipTitle: (index: number) => string,
): ChartOptions<'line'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    // The whole column responds, so the hit target is the bucket rather than
    // a few pixels of line.
    interaction: { mode: 'index', intersect: false },
    elements: {
      point: { radius: 0, hoverRadius: 4, hitRadius: 12 },
      line: { borderWidth: 2, tension: 0.3 },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          maxRotation: 0,
          autoSkipPadding: 24,
          color: 'rgba(113, 113, 122, 0.9)',
          font: { size: 10 },
        },
      },
      y: Y_AXIS,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        usePointStyle: true,
        padding: 10,
        backgroundColor: 'rgba(24, 24, 27, 0.94)',
        titleFont: { size: 12, weight: 'bold' },
        bodyFont: { size: 12 },
        callbacks: {
          title: (items) => tooltipTitle(items[0]?.dataIndex ?? 0),
          label: (item) =>
            item.parsed.y == null
              ? ''
              : ` ${item.dataset.label}: ${Math.round(item.parsed.y)}%`,
        },
      },
    },
  };
}
