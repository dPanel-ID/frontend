import type { LifecycleView } from '@/entities/application/lib/lifecycle';
import type { SchemaCommon } from '@/entities/shared/rules/schema';

export interface ApplicationLifecycleEditSidepanelProps {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  lifecycle: LifecycleView;
  /** The application has a port (a health check needs one). */
  hasPort: boolean;
  onSuccess?: () => void;
}
