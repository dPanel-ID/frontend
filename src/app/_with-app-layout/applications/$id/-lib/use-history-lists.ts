import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

import { useArtifactHistoryModel } from '../-model/artifact-history';

interface HistoryLists {
  artifacts: CicdArtifact[];
  deployments: CicdDeployment[];
  /** True while the first page of either list has never arrived. */
  loading: boolean;
}

/**
 * Both history lists poll every few seconds, which would blank the page on
 * every tick if a loading response hid the previous one. Every reader goes
 * through here so a refresh keeps showing what it last knew.
 */
export function useHistoryLists(): HistoryLists {
  const [artifactHistory, deploymentHistory] = useArtifactHistoryModel((s) => [
    s.artifactHistory,
    s.deploymentHistory,
  ]);

  const artifacts = settled(artifactHistory);
  const deployments = settled(deploymentHistory);

  return {
    artifacts: artifacts?.list ?? [],
    deployments: deployments?.list ?? [],
    loading: artifacts == null && deployments == null,
  };
}

function settled<T>(response: {
  $status: string;
  list?: T[];
  prevData?: { list: T[] };
}) {
  if (response.$status === 'success') return { list: response.list ?? [] };
  if (response.$status === 'loading' && response.prevData) {
    return { list: response.prevData.list };
  }
  return undefined;
}
