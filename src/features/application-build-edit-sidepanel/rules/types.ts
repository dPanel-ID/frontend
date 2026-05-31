import type { SchemaCommon } from '@/entities/shared/rules/schema';

import type { AppDefinition } from '@/shared/api/-dtos/application';

export interface ApplicationBuildEditSidepanelProps {
  applicationId: SchemaCommon.UnitId;
  applicationName: string;
  rawAppDefinition: AppDefinition;
  steps: Array<{
    name: string;
    command?: string[];
    archive?: string[];
  }>;
  envs: Array<{
    key: string;
    value?: string;
  }>;
  onSuccess?: () => void;
}
