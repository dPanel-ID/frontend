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
}

export interface ServerModuleCategory {
  id: ServerModuleCategoryTag;
  name: string;
}

export interface ServerModulePlatform {
  id: ServerModulePlatformTag;
  name: string;
}
