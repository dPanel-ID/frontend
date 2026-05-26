import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useFormStore } from '../store/form';

export default function useProgressCta() {
  const [
    progress,
    setProgress,
    appSourceMode,
    appSourceBundleIdent,
    appSourceGithubRepo,
    hostedServerID,
    appName,
    appPort,
    selectedDependencyIds,
    dependencyConfigs,
    appBuildCommand,
    appRunCommand,
  ] = useFormStore((s) => [
    s.progress,
    s.setProgress,
    s.appSourceMode,
    s.appSourceBundleIdent,
    s.appSourceGithubRepo,
    s.hostedServerID,
    s.appName,
    s.appPort,
    s.selectedDependencyIds,
    s.dependencyConfigs,
    s.appBuildCommand,
    s.appRunCommand,
  ]);

  const isPreviousHidden = progress === '1-source';

  const canClickNext = () => {
    switch (progress) {
      case '1-source': {
        return (
          (appSourceMode === 'bundle' && appSourceBundleIdent) ||
          (appSourceMode === 'github' && appSourceGithubRepo)
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
