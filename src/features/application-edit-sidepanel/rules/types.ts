import type { SchemaCommon } from '@/entities/shared/rules/schema';

/** The panel loads the application itself; callers only say which one. */
export interface ApplicationEditSidepanelProps {
  applicationId: SchemaCommon.UnitId;
  applicationName?: string;
  onSuccess?: () => void;
}

/** What the panel shows but never changes. */
export interface ApplicationFixedSettings {
  repository: string;
  repositoryUrl?: string;
  workdir: string;
  port?: number;
  serviceName: string;
}
