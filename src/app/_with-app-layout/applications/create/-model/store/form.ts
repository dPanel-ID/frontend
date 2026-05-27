import { createStore } from 'zustand';

import buildZustandStore from '@/shared/libs/react-factories/buildZustandStore';

import type { FormActions as Actions, FormStore as Store } from './form.types';

const requiredBinaryIdForDependency = (
  dependencyId: string,
  dependencySelectionId?: string,
) => `binary:${dependencySelectionId || dependencyId}`;

export const [FormStoreProvider, useFormStore] = buildZustandStore(
  'ApplicationCreateForm',
  () => {
    return createStore<Store & Actions>()((set, get) => ({
      progress: '1-source',
      appDomain: '',
      appName: '',
      appProgLang: '',
      appProgLangVersion: '',
      appBuildCommand: ['./scripts/build.sh'],
      appRunCommand: './scripts/start.sh',
      appPort: '',
      buildEnvText: '',
      runtimeEnvText: '',
      appSourceMode: 'github',
      appSourceBundleIdent: null,
      appSourceGithubRepo: null,
      hostedServerID: null,

      gitRepoConfig: null,

      dynamicConfig: null,
      selectedDependencyIds: [],
      dependencyConfigs: {},
      selectedRequiredBinaryIds: [],
      requiredBinaryConfigs: {},

      setGitRepoConfig: (gitRepoConfig) => {
        set({ gitRepoConfig });
      },
      setAppDomain: (appDomain) => {
        set({ appDomain });
      },
      setAppName: (appName) => {
        set({ appName });
      },
      setAppProgLang: (appProgLang) => {
        set({ appProgLang });
      },
      setAppProgLangVersion: (appProgLangVersion) => {
        set({ appProgLangVersion });
      },
      setAppBuildCommand: (appBuildCommand) => {
        set({
          appBuildCommand: appBuildCommand.length ? appBuildCommand : [''],
        });
      },
      setAppRunCommand: (appRunCommand) => {
        set({ appRunCommand });
      },
      setAppPort: (appPort) => {
        set({ appPort });
      },
      setBuildEnvText: (buildEnvText) => {
        set({ buildEnvText });
      },
      setRuntimeEnvText: (runtimeEnvText) => {
        set({ runtimeEnvText });
      },
      toggleDependency: (dependencyId) => {
        const {
          selectedDependencyIds,
          dependencyConfigs,
          selectedRequiredBinaryIds,
          requiredBinaryConfigs,
        } = get();
        if (selectedDependencyIds.includes(dependencyId)) {
          const nextConfigs = { ...dependencyConfigs };
          const nextRequiredBinaryConfigs = { ...requiredBinaryConfigs };
          const requiredBinaryId = requiredBinaryIdForDependency(
            dependencyId,
            dependencyConfigs[dependencyId]?.selectionId,
          );

          delete nextConfigs[dependencyId];
          delete nextRequiredBinaryConfigs[requiredBinaryId];
          set({
            selectedDependencyIds: selectedDependencyIds.filter(
              (id) => id !== dependencyId,
            ),
            dependencyConfigs: nextConfigs,
            selectedRequiredBinaryIds: selectedRequiredBinaryIds.filter(
              (id) => id !== requiredBinaryId,
            ),
            requiredBinaryConfigs: nextRequiredBinaryConfigs,
          });
          return;
        }

        set({
          selectedDependencyIds: [...selectedDependencyIds, dependencyId],
        });
      },
      setDependencyConfig: (dependencyId, config) => {
        set((state) => {
          const requiredBinaryId = requiredBinaryIdForDependency(
            dependencyId,
            config.selectionId,
          );
          const currentRequiredBinary =
            state.requiredBinaryConfigs[requiredBinaryId];

          return {
            dependencyConfigs: {
              ...state.dependencyConfigs,
              [dependencyId]: config,
            },
            requiredBinaryConfigs: currentRequiredBinary
              ? {
                  ...state.requiredBinaryConfigs,
                  [requiredBinaryId]: {
                    ...currentRequiredBinary,
                    id: config.id,
                    moduleId: config.moduleId,
                    name: config.name,
                    title: config.title,
                    version: config.version,
                    dependencySelectionId: config.selectionId || dependencyId,
                    logoUrl: config.logoUrl,
                    source: config.source,
                    installationId: config.installationId,
                    installationKey: config.installationKey,
                    status: config.status,
                  },
                }
              : state.requiredBinaryConfigs,
          };
        });
      },
      toggleRequiredBinary: (binaryId) => {
        const { selectedRequiredBinaryIds, requiredBinaryConfigs } = get();
        if (selectedRequiredBinaryIds.includes(binaryId)) {
          const nextConfigs = { ...requiredBinaryConfigs };
          delete nextConfigs[binaryId];
          set({
            selectedRequiredBinaryIds: selectedRequiredBinaryIds.filter(
              (id) => id !== binaryId,
            ),
            requiredBinaryConfigs: nextConfigs,
          });
          return;
        }

        set({
          selectedRequiredBinaryIds: [...selectedRequiredBinaryIds, binaryId],
        });
      },
      setRequiredBinaryConfig: (binaryId, config) => {
        set((state) => ({
          requiredBinaryConfigs: {
            ...state.requiredBinaryConfigs,
            [binaryId]: config,
          },
        }));
      },
      setAppSourceMode: (appSourceMode) => {
        const { appSourceMode: prevAppSourceMode } = get();
        if (prevAppSourceMode === appSourceMode) return;

        set({
          appSourceMode,
          appSourceBundleIdent: null,
          appSourceGithubRepo: null,
        });
      },
      setAppSourceBundleIdent: (appSourceBundleIdent) => {
        set({ appSourceBundleIdent });
      },
      setAppSourceGithubRepo: (appSourceGithubRepo) => {
        set({ appSourceGithubRepo });
      },
      resetAppSourceGithubRepo: () => {
        set({ appSourceGithubRepo: null });
      },
      setHostedServerID: (hostedServerID) => {
        const { hostedServerID: currentHostedServerID } = get();
        if (currentHostedServerID === hostedServerID) return;

        set({
          hostedServerID,
          selectedDependencyIds: [],
          dependencyConfigs: {},
          selectedRequiredBinaryIds: [],
          requiredBinaryConfigs: {},
        });
      },
      setDynamicConfig: (dynamicConfig) => {
        set({ dynamicConfig });
      },
      setProgress: (progress) => {
        set({ progress });
      },
    }));
  },
);
