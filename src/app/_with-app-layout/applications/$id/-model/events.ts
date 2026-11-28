import { registerEvents } from '@/shared/libs/events';
import type { Rescope } from '@/shared/libs/events/models/registerEvents';

import type {
  ApplicationBuildEditPayload,
  ApplicationDeletePayload,
  ApplicationEditPayload,
  ApplicationLifecycleEditPayload,
  ApplicationRunEditPayload,
  ApplicationSetupEditPayload,
  ArtifactDeletePayload,
  ArtifactProgressCancelPayload,
  ArtifactRollbackPayload,
  DeploymentDeletePayload,
  DeploymentRestorePayload,
  GitBackupPayload,
  ReleaseRollbackPayload,
  RuntimeMovePayload,
} from '../-rules/usecase-types';

type EventsRegistry = Rescope<
  '@applications::detail',
  {
    'artifact-progress-cancel': ArtifactProgressCancelPayload;
    'artifact-delete': ArtifactDeletePayload;
    'artifact-rollback': ArtifactRollbackPayload;
    'artifact-history-refresh': null;
    'deployment-delete': DeploymentDeletePayload;
    'deployment-restore': DeploymentRestorePayload;
    'deployment-git-backup': GitBackupPayload;
    'deployment-release-rollback': ReleaseRollbackPayload;
    'deployment-releases-refresh': null;
    'runtime-move': RuntimeMovePayload;
    'deployment-history-refresh': null;
    'application-delete': ApplicationDeletePayload;
    'application-edit': ApplicationEditPayload;
    'application-build-edit': ApplicationBuildEditPayload;
    'application-run-edit': ApplicationRunEditPayload;
    'application-setup-edit': ApplicationSetupEditPayload;
    'application-lifecycle-edit': ApplicationLifecycleEditPayload;
    'app-detail-refresh': null;
    'git-detail-refresh': null;
    'server-usage-retry-all': null;
    'github-login': null;
  }
>;

export const [useEmit, useSubscribe] = registerEvents<EventsRegistry>();
