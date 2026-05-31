import { createStore } from 'zustand';

import buildZustandStore from '@/shared/libs/react-factories/buildZustandStore';

import type {
  FormActions as Actions,
  FormInitialState,
  FormStore as Store,
} from './form.types';

const requiredBinaryIdForDependency = (
  dependencyId: string,
  dependencySelectionId?: string,
) => `binary:${dependencySelectionId || dependencyId}`;

export const [FormStoreProvider, useFormStore] = buildZustandStore(
  'ApplicationCreateForm',
  (initialState: FormInitialState = {}) => {
    return createStore<Store & Actions>()((set, get) => ({
      flowMode: 'create',
      updateApplicationId: null,
      updateApplicationConfig: null,
      updateRawAppDefinition: null,
      updateOriginalDefaultBranch: '',
      updateOriginalDomain: '',
      updateOriginalName: '',
      updateOriginalRepoName: '',
      updateOriginalRepoOrg: '',
      updateOriginalRepoUrl: '',
      updateOriginalRuntimeItems: [],
      updateOriginalSource: '',
      updateOriginalServerID: null,
      updateOriginalPort: '',
      updateTriggerBootstrap: false,
      updateOriginalWorkdir: '',
      updateWorkdir: '',
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
      ...initialState,

      setFlowMode: (flowMode) => {
        set({ flowMode });
      },
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
      setUpdateTriggerBootstrap: (updateTriggerBootstrap) => {
        set({ updateTriggerBootstrap });
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
      replaceDependencySelection: (
        fromDependencyId,
        toDependencyId,
        config,
      ) => {
        set((state) => {
          const fromConfig = state.dependencyConfigs[fromDependencyId];
          const fromRequiredBinaryId = requiredBinaryIdForDependency(
            fromDependencyId,
            fromConfig?.selectionId,
          );
          const toRequiredBinaryId = requiredBinaryIdForDependency(
            toDependencyId,
            config.selectionId,
          );
          const fromRequiredBinary =
            state.requiredBinaryConfigs[fromRequiredBinaryId];
          const shouldCarryRequiredBinary =
            Boolean(fromRequiredBinary) ||
            state.selectedRequiredBinaryIds.includes(fromRequiredBinaryId) ||
            state.selectedRequiredBinaryIds.includes(toRequiredBinaryId);
          const nextDependencyConfigs = {
            ...state.dependencyConfigs,
            [toDependencyId]: config,
          };
          const nextRequiredBinaryConfigs = {
            ...state.requiredBinaryConfigs,
          };

          delete nextDependencyConfigs[fromDependencyId];
          delete nextRequiredBinaryConfigs[fromRequiredBinaryId];

          if (shouldCarryRequiredBinary) {
            nextRequiredBinaryConfigs[toRequiredBinaryId] = {
              ...fromRequiredBinary,
              selectionId: toRequiredBinaryId,
              id: config.id,
              moduleId: config.moduleId,
              name: config.name,
              title: config.title,
              version: config.version,
              dependencySelectionId: config.selectionId || toDependencyId,
              logoUrl: config.logoUrl,
              source: config.source,
              installationId: config.installationId,
              installationKey: config.installationKey,
              status: config.status,
            };
          }

          return {
            dependencyConfigs: nextDependencyConfigs,
            selectedDependencyIds: [
              ...state.selectedDependencyIds.filter(
                (id) => id !== fromDependencyId && id !== toDependencyId,
              ),
              toDependencyId,
            ],
            requiredBinaryConfigs: nextRequiredBinaryConfigs,
            selectedRequiredBinaryIds: shouldCarryRequiredBinary
              ? [
                  ...state.selectedRequiredBinaryIds.filter(
                    (id) =>
                      id !== fromRequiredBinaryId && id !== toRequiredBinaryId,
                  ),
                  toRequiredBinaryId,
                ]
              : state.selectedRequiredBinaryIds,
          };
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
      selectRequiredBinary: (binaryId) => {
        const { selectedRequiredBinaryIds } = get();
        if (selectedRequiredBinaryIds.includes(binaryId)) return;

        set({
          selectedRequiredBinaryIds: [...selectedRequiredBinaryIds, binaryId],
        });
      },
      removeRequiredBinary: (binaryId) => {
        const { selectedRequiredBinaryIds, requiredBinaryConfigs } = get();
        if (
          !selectedRequiredBinaryIds.includes(binaryId) &&
          !requiredBinaryConfigs[binaryId]
        ) {
          return;
        }

        const nextConfigs = { ...requiredBinaryConfigs };
        delete nextConfigs[binaryId];
        set({
          selectedRequiredBinaryIds: selectedRequiredBinaryIds.filter(
            (id) => id !== binaryId,
          ),
          requiredBinaryConfigs: nextConfigs,
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
        const { flowMode, hostedServerID: currentHostedServerID } = get();
        if (currentHostedServerID === hostedServerID) return;

        if (flowMode === 'update') {
          set({ hostedServerID });
          return;
        }

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
