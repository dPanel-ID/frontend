import type { ChartOptions, ScriptableContext } from 'chart.js';
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

export const LINE_OPTIONS: ChartOptions<'line'> = {
  responsive: true,
  // The card gives the canvas a fixed height; let the width follow the card.
  maintainAspectRatio: false,
  animation: false,
  elements: {
    point: {
      radius: 0,
    },
  },
  scales: {
    y: {
      min: 0,
      suggestedMax: 100,
      ticks: {
        maxTicksLimit: 3,
        callback: (value) => {
          return `${value}%`;
        },
      },
      grid: {
        display: false,
      },
    },
    x: {
      display: false,
    },
  },
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: false,
    },
  },
};

export const generateBackgroundColor = () => {
  return (context: ScriptableContext<'line'>) => {
    const ctx = context.chart.ctx;
    const gradient = ctx.createLinearGradient(0, 0, 0, 200);
    gradient.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    gradient.addColorStop(0.55, 'rgba(56, 189, 248, 0)');
    return gradient;
  };
};
