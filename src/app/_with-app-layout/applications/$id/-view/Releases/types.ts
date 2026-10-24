import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';

export interface ArtifactsHistoryListProps {
  list: CicdArtifact[];
  deploymentList: CicdDeployment[];
  /** The release currently on the server this page is looking at. */
  lastDeployment?: CicdDeployment | null;
}

export interface ArtifactsHistoryStateFailedProps {
  error: Error;
  onClickRetry: () => void;
}
