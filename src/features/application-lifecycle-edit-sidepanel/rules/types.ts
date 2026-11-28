import type { LifecycleView } from '@/entities/application/lib/lifecycle';
import type { ReleaseFoldersView } from '@/entities/application/lib/release-folders';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ApplicationLifecycleEditSidepanelProps {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  lifecycle: LifecycleView;
  /** Release folders as stored; absent fields read as "in place". */
  releaseFolders: ReleaseFoldersView;
  /** The application has a port (a health check needs one). */
  hasPort: boolean;
  onSuccess?: () => void;
}
