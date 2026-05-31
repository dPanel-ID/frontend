import type { SchemaCommon } from '@/entities/shared/rules/schema';

import type { AppDefinition } from '@/shared/api/-dtos/application';

export interface ApplicationRunEditSidepanelProps {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  rawAppDefinition: AppDefinition;
  command: string;
  envs: Array<{
    key: string;
    value?: string;
  }>;
  onSuccess?: () => void;
}
