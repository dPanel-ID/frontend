import type { DTOs } from '@/shared/api';

export type ServerModuleCategoryTag = string;
export type ServerModulePlatformTag = string;

export interface ServerModule {
  category: ServerModuleCategoryTag[];
  platform: ServerModulePlatformTag[];

  id: string;
  moduleID?: number;
  installerName?: string;
  installerType?: string;
  name: string;
  description: string;
  logoUrl: string;
  has_submodule: boolean;
  actions?: string[];
  source?: 'catalog' | 'static';
  refName?: string;
  resolvedCommit?: string;
  installation?: DTOs.ModuleInstallationV1 | DTOs.ModuleInstallationSummaryV1;
  installations?: DTOs.ModuleInstallationSummaryV1[];
  installationStatus?: string;
  /** The module this one is offered under, such as mariadb. */
  parent?: string;
  /** Modules offered from this one, such as databases on MariaDB. */
  children?: ServerModule[];
}

export interface ServerModuleCategory {
  id: ServerModuleCategoryTag;
  name: string;
}

export interface ServerModulePlatform {
  id: ServerModulePlatformTag;
  name: string;
}
