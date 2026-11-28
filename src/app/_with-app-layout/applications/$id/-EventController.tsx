import { useEmit, useSubscribe } from './-model/events';
import useApplicationBuildEditUsecase from './-usecase/application-build-edit';
import useApplicationDeleteUsecase from './-usecase/application-delete';
import useApplicationEditUsecase from './-usecase/application-edit';
import useApplicationLifecycleEditUsecase from './-usecase/application-lifecycle-edit';
import useApplicationRunEditUsecase from './-usecase/application-run-edit';
import useApplicationSetupEditUsecase from './-usecase/application-setup-edit';
import useArtifactDeleteUsecase from './-usecase/artifact-delete';
import useArtifactProgressCancelUsecase from './-usecase/artifact-progress-cancel';
import useArtifactRollbackUsecase from './-usecase/artifact-rollback';
import useDeploymentDeleteUsecase from './-usecase/deployment-delete';
import useDeploymentRestoreUsecase from './-usecase/deployment-restore';
import useGitBackupUsecase from './-usecase/git-backup';
import useGithubLoginUsecase from './-usecase/github-login';
import useRuntimeMoveUsecase from './-usecase/runtime-move';
import { GitBackupDialog } from './-view/GitBackupDialog';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@applications::detail/artifact-history-refresh', null);
    emit('@applications::detail/deployment-history-refresh', null);
  };

  const [handleApplicationDelete] = useApplicationDeleteUsecase();

  const [handleApplicationEdit] = useApplicationEditUsecase({
    onSuccess: () => emit('@applications::detail/app-detail-refresh', null),
  });

  const [handleApplicationBuildEdit] = useApplicationBuildEditUsecase({
    onSuccess: () => emit('@applications::detail/app-detail-refresh', null),
  });

  const [handleApplicationRunEdit] = useApplicationRunEditUsecase({
    onSuccess: () => emit('@applications::detail/app-detail-refresh', null),
  });

  const [handleApplicationSetupEdit] = useApplicationSetupEditUsecase({
    onSuccess: () => emit('@applications::detail/app-detail-refresh', null),
  });

  const [handleApplicationLifecycleEdit] = useApplicationLifecycleEditUsecase({
    onSuccess: () => emit('@applications::detail/app-detail-refresh', null),
  });

  const [handleArtifactDelete] = useArtifactDeleteUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleArtifactProgressCancel] = useArtifactProgressCancelUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleArtifactRollback] = useArtifactRollbackUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleDeploymentDelete] = useDeploymentDeleteUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleDeploymentRestore] = useDeploymentRestoreUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleRuntimeMove] = useRuntimeMoveUsecase({
    onSuccess: handleDefaultSuccess,
  });

  const [handleGithubLogin] = useGithubLoginUsecase();

  const [handleGitBackup, gitBackup] = useGitBackupUsecase();

  useSubscribe('@applications::detail/artifact-delete', handleArtifactDelete);

  useSubscribe(
    '@applications::detail/artifact-progress-cancel',
    handleArtifactProgressCancel,
  );

  useSubscribe(
    '@applications::detail/artifact-rollback',
    handleArtifactRollback,
  );

  useSubscribe(
    '@applications::detail/deployment-delete',
    handleDeploymentDelete,
  );

  useSubscribe(
    '@applications::detail/deployment-restore',
    handleDeploymentRestore,
  );

  useSubscribe('@applications::detail/runtime-move', handleRuntimeMove);

  useSubscribe('@applications::detail/deployment-git-backup', handleGitBackup);

  useSubscribe('@applications::detail/github-login', handleGithubLogin);

  useSubscribe(
    '@applications::detail/application-delete',
    handleApplicationDelete,
  );

  useSubscribe('@applications::detail/application-edit', handleApplicationEdit);

  useSubscribe(
    '@applications::detail/application-build-edit',
    handleApplicationBuildEdit,
  );

  useSubscribe(
    '@applications::detail/application-run-edit',
    handleApplicationRunEdit,
  );

  useSubscribe(
    '@applications::detail/application-setup-edit',
    handleApplicationSetupEdit,
  );

  useSubscribe(
    '@applications::detail/application-lifecycle-edit',
    handleApplicationLifecycleEdit,
  );

  return <GitBackupDialog state={gitBackup} />;
}
