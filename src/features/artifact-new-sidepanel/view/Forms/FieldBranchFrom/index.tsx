import { useController } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { useEmit } from '@/features/artifact-new-sidepanel/model/events';
import { useArtifactNewGeneralModel } from '@/features/artifact-new-sidepanel/model/general';

import { isGithubAuthFailure } from '@/shared/libs/api-client/is-github-auth-failure';
import {
  buildFrontendReturnUrl,
  buildGithubAuthUrl,
} from '@/shared/libs/browser/oauth';
import { Button } from '@/shared/presentation/atoms/Button';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { ComboboxWithSearch } from '@/shared/presentation/molecules/ComboboxWithSearch';

import { useGitBranchModel } from '../../../model/git-branch';
import {
  FieldLoading,
  createFieldError,
} from '../../_presentation/FieldStates';
import FieldWrapper from '../../_presentation/FieldWrapper';

const FallbackError = createFieldError({
  i18nKey: 'sidepanel.artifactNew.fieldBranch.onError',
  useTryAgain: () => {
    const emit = useEmit();
    return () => emit('#artifact-new-sidepanel/git-branch-refresh', null);
  },
});

function GithubReloginError() {
  const t = useDevetekTranslations('sidepanel.artifactNew.fieldBranch');

  const handleReloginGithub = () => {
    localStorage.setItem('auth:provider', 'github');
    window.location.href = buildGithubAuthUrl(
      buildFrontendReturnUrl(window.location.pathname, window.location.search),
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-yellow-500/10 px-3 py-2">
      <p className="text-sm italic text-yellow-900 dark:text-yellow-200">
        {t('onGithubAuthError')}
      </p>
      <Button
        type="button"
        size="sm"
        className="w-max"
        onClick={handleReloginGithub}
      >
        {t('reloginGithub')}
      </Button>
    </div>
  );
}

const BranchCbo = () => {
  const { form } = useArtifactNewGeneralModel();

  const t = useDevetekTranslations();

  const gitBranches = useGitBranchModel((s) => s.branches);

  const { field } = useController({
    control: form.control,
    name: 'fromBranch',
  });

  if (gitBranches.$status === 'initial') {
    return null;
  }

  if (gitBranches.$status === 'loading' && !gitBranches.prevData) {
    return <FieldLoading />;
  }

  if (gitBranches.$status === 'failed') {
    if (isGithubAuthFailure(gitBranches)) {
      return <GithubReloginError />;
    }

    return <FallbackError />;
  }

  const branches =
    gitBranches.$status === 'loading'
      ? gitBranches.prevData!.list
      : gitBranches.list;

  return (
    <ComboboxWithSearch
      classNameButton="w-full"
      value={field.value}
      onChange={field.onChange}
      items={branches.map((branch) => {
        return {
          label: branch.name,
          value: branch.name,
        };
      })}
      placeholder={t('common.terms.selectBranch')}
    />
  );
};

export default function FieldBranchFrom() {
  const { form } = useArtifactNewGeneralModel();

  const tAll = useDevetekTranslations();
  const t = useDevetekTranslations('sidepanel.artifactNew.fieldBranch');

  return (
    <FieldWrapper fieldTitle={t('title')}>
      <BranchCbo />

      <ErrorInline
        t={tAll}
        message={form.formState.errors.fromBranch?.message}
      />
    </FieldWrapper>
  );
}
