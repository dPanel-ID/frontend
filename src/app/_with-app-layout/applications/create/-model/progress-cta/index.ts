import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useFormStore } from '../store/form';
import type { DependencyConfig } from '../store/form.types';

function isLanguageDependency(config?: DependencyConfig) {
  return config?.category?.some((category) => category === 'language') === true;
}

export default function useProgressCta() {
  const [
    progress,
    flowMode,
    setProgress,
    appSourceMode,
    appSourceBundleIdent,
    appSourceGithubRepo,
    hostedServerID,
    gitRepoConfig,
    appName,
    appPort,
    selectedDependencyIds,
    dependencyConfigs,
    selectedRequiredBinaryIds,
    requiredBinaryConfigs,
    appBuildCommand,
    appRunCommand,
  ] = useFormStore((s) => [
    s.progress,
    s.flowMode,
    s.setProgress,
    s.appSourceMode,
    s.appSourceBundleIdent,
    s.appSourceGithubRepo,
    s.hostedServerID,
    s.gitRepoConfig,
    s.appName,
    s.appPort,
    s.selectedDependencyIds,
    s.dependencyConfigs,
    s.selectedRequiredBinaryIds,
    s.requiredBinaryConfigs,
    s.appBuildCommand,
    s.appRunCommand,
  ]);

  const isPreviousHidden =
    progress === '1-source' ||
    (flowMode === 'update' && progress === '2-server-dependencies');
  const selectedDependencyBinaryIds = selectedDependencyIds
    .filter((id) => isLanguageDependency(dependencyConfigs[id]))
    .map((id) => {
      return `binary:${dependencyConfigs[id]?.selectionId || id}`;
    });

  const canClickNext = () => {
    switch (progress) {
      case '1-source': {
        return (
          (appSourceMode === 'bundle' && appSourceBundleIdent) ||
          (appSourceMode === 'github' &&
            appSourceGithubRepo &&
            gitRepoConfig &&
            gitRepoConfig.gitBranch &&
            gitRepoConfig.gitHead)
        );
      }

      case '2-server-dependencies': {
        return (
          Boolean(hostedServerID) &&
          selectedDependencyIds.length > 0 &&
          selectedDependencyIds.every((id) => Boolean(dependencyConfigs[id]))
        );
      }

      case '3-details':
        return Boolean(
          appName &&
          selectedRequiredBinaryIds.length > 0 &&
          selectedRequiredBinaryIds.every(
            (id) =>
              Boolean(requiredBinaryConfigs[id]) &&
              selectedDependencyBinaryIds.includes(id),
          ) &&
          appBuildCommand.some((command) => command.trim()) &&
          appRunCommand &&
          appPort,
        );

      case '4-env':
      case '5-preview':
        return true;

      default:
        return false;
    }
  };

  const goToPrevious = useHandler(() => {
    switch (progress) {
      case '2-server-dependencies':
        if (flowMode === 'update') return false;
        setProgress('1-source');
        return true;

      case '3-details':
        setProgress('2-server-dependencies');
        return true;

      case '4-env':
        setProgress('3-details');
        return true;

      case '5-preview':
        setProgress('4-env');
        return true;

      default:
        return false;
    }
  });

  const goToNext = useHandler(() => {
    switch (progress) {
      case '1-source':
        if (flowMode === 'update') return false;
        setProgress('2-server-dependencies');
        return true;

      case '2-server-dependencies':
        setProgress('3-details');
        return true;

      case '3-details':
        setProgress('4-env');
        return true;

      case '4-env':
        setProgress('5-preview');
        return true;

      default:
        return false;
    }
  });

  return {
    isPreviousHidden,
    isNextDisabled: !canClickNext(),
    goToPrevious,
    goToNext,
  };
}
