import type { DTOs } from '@/shared/api';

export interface FormStore {
  flowMode: FlowMode;
  updateApplicationId: string | null;
  updateApplicationConfig: DTOs.ApplicationV1['app_config'] | null;
  updateRawAppDefinition: DTOs.ApplicationV1['app_definition'] | null;
  updateOriginalServerID: number | null;
  updateOriginalPort: string;
  updateTriggerBootstrap: boolean;
  updateWorkdir: string;

  progress: Progress;

  appSourceMode: AppSourceMode;
  appSourceBundleIdent: string | null;
  appSourceGithubRepo: string | null;

  hostedServerID: number | null;

  appName: string;
  appDomain: string;
  appProgLang: string;
  appProgLangVersion: string;
  appBuildCommand: string[];
  appRunCommand: string;
  appPort: string;
  buildEnvText: string;
  runtimeEnvText: string;

  gitRepoConfig: Record<string, string> | null;

  dynamicConfig: Record<string, Record<string, unknown>> | null;
  selectedDependencyIds: string[];
  dependencyConfigs: Record<string, DependencyConfig>;
  selectedRequiredBinaryIds: string[];
  requiredBinaryConfigs: Record<string, RequiredBinaryConfig>;
}

export interface FormActions {
  setProgress: (progress: Progress) => void;
  setFlowMode: (flowMode: FlowMode) => void;
  setAppSourceMode: (appSourceMode: AppSourceMode) => void;
  setAppSourceBundleIdent: (appSourceBundleIdent: string) => void;
  setAppSourceGithubRepo: (appSourceGithubRepo: string) => void;
  resetAppSourceGithubRepo: () => void;

  setHostedServerID: (hostedServerID: number) => void;

  setGitRepoConfig: (gitRepoConfig: FormStore['gitRepoConfig']) => void;
  setAppName: (appName: string) => void;
  setAppDomain: (appDomain: string) => void;
  setAppProgLang: (appProgLang: string) => void;
  setAppProgLangVersion: (appProgLangVersion: string) => void;
  setAppBuildCommand: (appBuildCommand: string[]) => void;
  setAppRunCommand: (appRunCommand: string) => void;
  setAppPort: (appPort: string) => void;
  setBuildEnvText: (buildEnvText: string) => void;
  setRuntimeEnvText: (runtimeEnvText: string) => void;
  setUpdateTriggerBootstrap: (updateTriggerBootstrap: boolean) => void;
  toggleDependency: (dependencyId: string) => void;
  replaceDependencySelection: (
    fromDependencyId: string,
    toDependencyId: string,
    config: DependencyConfig,
  ) => void;
  setDependencyConfig: (dependencyId: string, config: DependencyConfig) => void;
  toggleRequiredBinary: (binaryId: string) => void;
  selectRequiredBinary: (binaryId: string) => void;
  removeRequiredBinary: (binaryId: string) => void;
  setRequiredBinaryConfig: (
    binaryId: string,
    config: RequiredBinaryConfig,
  ) => void;

  setDynamicConfig: (dynamicConfig: FormStore['dynamicConfig']) => void;
}

export type AppSourceMode = 'bundle' | 'github';
export type FlowMode = 'create' | 'update';

export type FormInitialState = Partial<
  Pick<
    FormStore,
    | 'flowMode'
    | 'updateApplicationId'
    | 'updateApplicationConfig'
    | 'updateRawAppDefinition'
    | 'updateOriginalServerID'
    | 'updateOriginalPort'
    | 'updateTriggerBootstrap'
    | 'updateWorkdir'
    | 'progress'
    | 'appSourceMode'
    | 'appSourceBundleIdent'
    | 'appSourceGithubRepo'
    | 'hostedServerID'
    | 'appName'
    | 'appDomain'
    | 'appProgLang'
    | 'appProgLangVersion'
    | 'appBuildCommand'
    | 'appRunCommand'
    | 'appPort'
    | 'buildEnvText'
    | 'runtimeEnvText'
    | 'gitRepoConfig'
    | 'dynamicConfig'
    | 'selectedDependencyIds'
    | 'dependencyConfigs'
    | 'selectedRequiredBinaryIds'
    | 'requiredBinaryConfigs'
  >
>;

export interface DependencyConfig {
  selectionId?: string;
  id: string;
  moduleId?: string;
  name: string;
  title: string;
  version?: string;
  category?: string[];
  logoUrl?: string;
  source?: 'catalog' | 'installed';
  installationId?: string;
  installationKey?: string;
  status?: string;
  variables: Record<string, unknown>;
  roles: string[];
  ref: {
    name: string;
    expectedCommit: string;
  };
}

export interface RequiredBinaryConfig {
  selectionId: string;
  id: string;
  moduleId?: string;
  name: string;
  title: string;
  version?: string;
  dependencySelectionId?: string;
  logoUrl?: string;
  source?: DependencyConfig['source'];
  installationId?: string;
  installationKey?: string;
  status?: string;
}

export type Progress =
  | '1-source'
  | '2-server-dependencies'
  | '3-details'
  | '4-env'
  | '5-preview';
