import { createStore } from 'zustand';

import buildZustandStore from '@/shared/libs/react-factories/buildZustandStore';

import type { FormActions as Actions, FormStore as Store } from './form.types';

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
        const { selectedDependencyIds, dependencyConfigs } = get();
        if (selectedDependencyIds.includes(dependencyId)) {
          const nextConfigs = { ...dependencyConfigs };
          delete nextConfigs[dependencyId];
          set({
            selectedDependencyIds: selectedDependencyIds.filter(
              (id) => id !== dependencyId,
            ),
            dependencyConfigs: nextConfigs,
          });
          return;
        }

        set({
          selectedDependencyIds: [...selectedDependencyIds, dependencyId],
        });
      },
      setDependencyConfig: (dependencyId, config) => {
        set((state) => ({
          dependencyConfigs: {
            ...state.dependencyConfigs,
            [dependencyId]: config,
          },
        }));
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
