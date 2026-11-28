import type { SchemaApplicationParts } from '@/entities/application/rules/schema';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ArtifactNewSidepanelProps {
  repoOrganization: string;
  repoName: string;
  applicationId: SchemaCommon.UnitId;
  currentServerId?: SchemaCommon.UnitId;
  /**
   * The branch picked when the panel opens, usually the one the application
   * last built. "Redeploy" opened the panel with no branch at all.
   */
  defaultBranch?: string;
  appConfig: SchemaApplicationParts.ConfigDefs;
  onSuccess?: (newWorkerId: SchemaCommon.UnitId) => void;
  onOperationQueued?: (groupId: string, operationId: string) => void;
}

export interface GitBranchModelProps {
  applicationId: SchemaCommon.UnitId;
}
