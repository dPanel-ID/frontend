import type { LifecycleView } from '@/entities/application/lib/lifecycle';
import type { ReleaseFoldersView } from '@/entities/application/lib/release-folders';
import type { SchemaCommon } from '@/entities/shared/rules/schema';
import type {
  UnitEnvironmentKV,
  UnitSteps,
} from '@/entities/shared/rules/schema/app-config';

import type { AppDefinition } from '@/shared/api/-dtos/application';

// =============================================================================
//   Scope: Artifact *
// =============================================================================

export interface ArtifactProgressCancelPayload {
  commitHead: string;
  serverId: SchemaCommon.UnitId;
}

export interface ArtifactDeletePayload {
  artifactId: SchemaCommon.UnitId;
}

export interface ArtifactRollbackPayload {
  commitHead: string;
  artifactId: SchemaCommon.UnitId;
  applicationId: SchemaCommon.UnitId;
}

// =============================================================================
//   Scope: Deployment *
// =============================================================================

export interface DeploymentDeletePayload {
  deploymentId: SchemaCommon.UnitId;
  /**
   * The app keeps its data in a shared folder (release folders), which the
   * dialog offers to delete too. Other apps lose their whole folder.
   */
  usesReleaseFolders?: boolean;
}

/** Switch the live release on one server back to an older one. */
export interface ReleaseRollbackPayload {
  deploymentId: SchemaCommon.UnitId;
  /** The release folder's name. */
  release: string;
  /** How the release reads on screen (date and commit). */
  releaseLabel: string;
  serverName: string;
}

export interface DeploymentRestorePayload {
  applicationId: SchemaCommon.UnitId;
  artifactId: SchemaCommon.UnitId;
  workerId: SchemaCommon.UnitId;
}

/** Back up the application's files on one server to a git branch. */
export interface GitBackupPayload {
  deploymentId: SchemaCommon.UnitId;
  serverName: string;
}

/** Move a deployment's application between the new and previous runtime. */
export interface RuntimeMovePayload {
  applicationId: SchemaCommon.UnitId;
  artifactId: SchemaCommon.UnitId;
  workerId: SchemaCommon.UnitId;
}

// =============================================================================
//   Scope: Application *
// =============================================================================

export interface ApplicationDeletePayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
}

export interface ApplicationBuildEditPayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  rawAppDefinition: AppDefinition;
  steps: UnitSteps[];
  envs: UnitEnvironmentKV[];
}

export interface ApplicationRunEditPayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  rawAppDefinition: AppDefinition;
  command: string;
  envs: UnitEnvironmentKV[];
  /** The server the application runs on, for the Redis helper. */
  serverId?: string;
  /** The application's framework, saved or detected ("laravel"). */
  framework?: string;
}

export interface ApplicationSetupEditPayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  rawAppDefinition: AppDefinition;
  language: { name: string; version: string };
  languages: Array<{ name: string; version: string }>;
}

export interface ApplicationEditPayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
}

export interface ApplicationLifecycleEditPayload {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  lifecycle: LifecycleView;
  releaseFolders: ReleaseFoldersView;
  /** The application has a port (a health check needs one). */
  hasPort: boolean;
}
