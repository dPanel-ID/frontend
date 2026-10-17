import { CpuIcon, HardDriveIcon, MemoryStickIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Line } from 'react-chartjs-2';

import { useDevetekTranslations } from '@/services/i18n';

import { formatValueUsage } from '@/entities/server-statistics/lib/formatUsage';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { cn } from '@/shared/libs/tailwind/cn';

import { useServerDataModel } from '../../../../-model/server-data';
import { useServerStatsModel } from '../../../../-model/server-stats';

import { LiveUsageStates as UIStates } from './_States';
import { LINE_OPTIONS, generateBackgroundColor } from './chart-options';

type ServerStatsModelSource = ReturnType<typeof useServerStatsModel>;

const [guardStats] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Failed,
})(
  couple(useServerStatsModel, (s) => (s as ServerStatsModelSource).cpu.usage),
  couple(
    useServerStatsModel,
    (s) => (s as ServerStatsModelSource).memory.usage,
  ),
  couple(useServerStatsModel, (s) => (s as ServerStatsModelSource).disk.usage),
);

/** CPU, memory and disk from the agent, polled while the page is open. */
export default function LiveUsage() {
  const t = useDevetekTranslations('page.serverDetail.overview');
  const [detail] = useServerDataModel((s) => [s.detail]);
  const status = detail.$status === 'success' ? detail.state.status : undefined;

  return (
    <section className="rounded-2xl border bg-card p-4 sm:p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold">{t('liveUsage')}</h2>
        <p className="text-sm text-muted-foreground">{t('liveUsageHint')}</p>
      </div>

      {status === 'ready' ? (
        <LiveUsageCharts />
      ) : (
        <div className="flex items-center gap-2 rounded-xl border border-dashed bg-background/40 p-4 text-sm text-muted-foreground">
          <CpuIcon className="size-4 shrink-0" />
          {t('liveUsageWhenReady')}
        </div>
      )}
    </section>
  );
}

const LiveUsageCharts = guardStats(function LiveUsageCharts() {
  const t = useDevetekTranslations('page.serverDetail.overview');
  const [cpuCoreCount, cpuStatsDataset, memoryStatsDataset, diskStatsDataset] =
    useServerStatsModel((s) => [
      s.cpu.coreCount,
      s.cpu.statsDataset,
      s.memory.statsDataset,
      s.disk.statsDataset,
    ]);

  const coreCount =
    cpuCoreCount.$status === 'success'
      ? cpuCoreCount.coreCount
      : cpuCoreCount.$status === 'loading' && cpuCoreCount.prevData
        ? cpuCoreCount.prevData.coreCount
        : undefined;

  const cpu = cpuStatsDataset.at(-1);
  const memory = memoryStatsDataset.at(-1);
  const disk = diskStatsDataset.at(-1);
  const diskTotalInMB = (disk?.usedInMB ?? 0) + (disk?.freeInMB ?? 0);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      <UsageCard
        icon={CpuIcon}
        label={t('cpu')}
        value={`${(cpu?.usedInPercent ?? 0).toFixed(1)}%`}
        caption={coreCount != null ? t('cores', { count: coreCount }) : ''}
        percent={cpu?.usedInPercent ?? 0}
        datasets={cpuStatsDataset}
      />
      <UsageCard
        icon={MemoryStickIcon}
        label={t('memory')}
        value={formatValueUsage(memory?.usedInMB ?? 0)}
        caption={t('ofTotal', {
          total: formatValueUsage(memory?.totalInMB ?? 0),
        })}
        percent={memory?.usedInPercent ?? 0}
        datasets={memoryStatsDataset}
      />
      <UsageCard
        icon={HardDriveIcon}
        label={t('disk')}
        value={formatValueUsage(disk?.usedInMB ?? 0)}
        caption={t('ofTotal', { total: formatValueUsage(diskTotalInMB) })}
        percent={disk?.usedInPercent ?? 0}
        datasets={diskStatsDataset}
      />
    </div>
  );
});

function UsageCard(props: {
  icon: LucideIcon;
  label: string;
  value: string;
  caption: string;
  percent: number;
  datasets: Array<{ timestamp: Date; usedInPercent: number }>;
}) {
  const { caption, datasets, icon: Icon, label, percent, value } = props;
  const tone =
    percent >= 90
      ? 'text-red-600 dark:text-red-300'
      : percent >= 70
        ? 'text-amber-600 dark:text-amber-300'
        : 'text-emerald-600 dark:text-emerald-300';

  return (
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-xl border bg-background/50 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
          <Icon className="size-3.5" />
          {label}
        </div>
        <p className={cn('mt-1 text-xl font-bold leading-tight', tone)}>
          {value}
        </p>
        {caption && (
          <p className="truncate text-xs text-muted-foreground">{caption}</p>
        )}
      </div>
      <div className="relative h-16 min-w-0">
        <Line
          options={LINE_OPTIONS}
          data={{
            labels: datasets.map((dataset) => dataset.timestamp),
            datasets: [
              {
                label: 'Usage',
                data: datasets.map((dataset) => dataset.usedInPercent),
                borderColor: 'rgb(56, 189, 248)',
                cubicInterpolationMode: 'monotone',
                fill: 'start',
                backgroundColor: generateBackgroundColor(),
              },
            ],
          }}
        />
      </div>
    </div>
  );
}
