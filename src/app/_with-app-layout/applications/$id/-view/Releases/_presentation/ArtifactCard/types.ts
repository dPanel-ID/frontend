import type { ReactNode } from 'react';

import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';

import type { ReleaseStatus } from '../../../../-lib/describe-detail';

export interface LogsOption {
  label: string;
  machineId: string;
  onClick: () => void;
}

export interface ArtifactCardProps {
  releaseStatus?: ReleaseStatus;
  data: CicdArtifact;
  isUsed?: boolean;
  isDeploying?: boolean;

  onClickLogs?: () => void;
  logsDisabled?: boolean;
  logsOptions?: LogsOption[];
  onClickRollback?: () => void;
  onClickDelete?: () => void;
  onClickStatus?: () => void;
}

export interface HeadingItemWrapperProps {
  className?: string;
  tooltipMessage?: string;
  children: ReactNode;
}

export interface CardWrapperProps {
  releaseStatus?: ReleaseStatus;
  children: ReactNode;
}
