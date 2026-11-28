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
  /** The server the application runs on; the Redis helper needs it. */
  serverId?: string;
  /**
   * The application's framework. Laravel's own helpers (object storage,
   * Redis drivers) show only for "laravel".
   */
  framework?: string;
  onSuccess?: () => void;
}
