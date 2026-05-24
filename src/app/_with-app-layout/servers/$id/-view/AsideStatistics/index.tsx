import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';

import { useServerDataModel } from '../../-model/server-data';
import { useServerStatsModel } from '../../-model/server-stats';

import Layout from './_presentation/Layout';
import { StatisticsCard } from './_presentation/StatisticsCard';
import { AsideStatisticsStates as UIStates } from './_States';

const [guardServerDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Loading,
})(couple(useServerDataModel, (s) => s.detail));

const [guardStats] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Failed,
})(
  couple(useServerStatsModel, (s) => s.cpu.usage),
  couple(useServerStatsModel, (s) => s.memory.usage),
  couple(useServerStatsModel, (s) => s.disk.usage),
);

export default guardServerDetail(
  guardStats(function AsideStatistics() {
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
          : null;

    return (
      <Layout>
        <Layout.Item>
          <StatisticsCard.UsageCPU
            coreCount={coreCount}
            datasets={cpuStatsDataset}
          />
        </Layout.Item>

        <Layout.Item>
          <StatisticsCard.UsageRAM statsDataset={memoryStatsDataset} />
        </Layout.Item>

        <Layout.Item>
          <StatisticsCard.UsageDisk statsDataset={diskStatsDataset} />
        </Layout.Item>
      </Layout>
    );
  }),
);
