import { CpuIcon, HardDriveIcon, MemoryStickIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

import { TELEMETRY_LIMIT } from '../../-lib/telemetry';
import type { AggregatedTelemetryPoint } from '../../-lib/telemetry';
import { DashboardSection, TelemetryLegend } from '../../-presentation';

import TrendChart from './TrendChart';

export default function TelemetryPanel(props: {
  points: AggregatedTelemetryPoint[];
  telemetryServers: DTOs.MachineV1[];
  sampledServerCount: number;
  totalReadyServers: number;
}) {
  const { points, sampledServerCount, telemetryServers, totalReadyServers } =
    props;
  const t = useDevetekTranslations('page.dashboard.telemetry');
  const latestPoint = points.at(-1);
  const coverage =
    totalReadyServers > TELEMETRY_LIMIT
      ? t('coverageLimited', {
          sampled: telemetryServers.length,
          total: totalReadyServers,
        })
      : t('coverage', {
          sampled: sampledServerCount,
          total: totalReadyServers,
        });

  return (
    <DashboardSection
      title={t('title')}
      description={t('description')}
      action={
        <span className="text-xs font-medium text-muted-foreground">
          {coverage}
        </span>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <TrendChart points={points} />

        <div className="grid content-start gap-2">
          <TelemetryLegend
            icon={CpuIcon}
            label={t('cpu')}
            value={latestPoint?.cpu}
            tone="blue"
          />
          <TelemetryLegend
            icon={MemoryStickIcon}
            label={t('memory')}
            value={latestPoint?.memory}
            tone="green"
          />
          <TelemetryLegend
            icon={HardDriveIcon}
            label={t('disk')}
            value={latestPoint?.disk}
            tone="amber"
          />
          <div className="rounded-lg border bg-background p-3 text-xs text-muted-foreground">
            {t('backendNote')}
          </div>
        </div>
      </div>
    </DashboardSection>
  );
}
