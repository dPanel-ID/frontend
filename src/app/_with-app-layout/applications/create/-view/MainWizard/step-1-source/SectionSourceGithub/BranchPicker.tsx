import { AlertTriangleIcon, GitBranchIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiGitBranch } from '@/shared/api';
import { isGithubAuthFailure } from '@/shared/libs/api-client/is-github-auth-failure';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { ComboboxWithSearch } from '@/shared/presentation/molecules/ComboboxWithSearch';

export interface BranchChoice {
  name: string;
  commitHead: string;
}

interface BranchPickerProps {
  repoOrganization: string;
  repoName: string;
  /** The branch currently chosen, which starts as the repository default. */
  value?: string;
  /** The repository default, labelled as such in the list. */
  defaultBranch?: string;
  onChange: (branch: BranchChoice) => void;
}

/**
 * Which branch to build from.
 *
 * The flow used to take the repository's default branch and never offer a
 * choice, so anyone whose work sits on `develop` or a release branch had to
 * create the application and then edit it. The commit head moves with the
 * branch — picking a branch without updating the head would build the
 * default branch's commit under another branch's name.
 */
export default function BranchPicker(props: BranchPickerProps) {
  const { defaultBranch, onChange, repoName, repoOrganization, value } = props;

  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step1.sectionGithubRepo',
  );

  const [response] = ApiGitBranch.Find.useGet({
    repoOrganization,
    repoName,
    options: {
      skip: !repoOrganization || !repoName,
    },
  });

  if (response.$status === 'loading' && !response.prevData) {
    return (
      <Row>
        <Spinner className="size-3.5" />
        <span className="text-muted-foreground">{t('loadingBranches')}</span>
      </Row>
    );
  }

  if (response.$status === 'failed') {
    return (
      <Row>
        <AlertTriangleIcon className="size-4 text-amber-500" />
        <span className="text-muted-foreground">
          {isGithubAuthFailure(response)
            ? t('branchesGithubAuthError')
            : t('branchesError', { branch: defaultBranch ?? '' })}
        </span>
      </Row>
    );
  }

  const raw = response.$status === 'loading' ? response.prevData! : response;

  const branches = (
    raw as unknown as Array<{ name?: string; commit?: { sha?: string } }>
  ).flatMap((branch) => {
    const name = branch.name;
    const commitHead = branch.commit?.sha;

    if (!name || !commitHead) return [];

    return [{ name, commitHead }];
  });

  if (branches.length === 0) {
    return (
      <Row>
        <AlertTriangleIcon className="size-4 text-amber-500" />
        <span className="text-muted-foreground">{t('branchesEmpty')}</span>
      </Row>
    );
  }

  return (
    <Row>
      <span className="font-semibold">{t('branchLabel')}</span>

      <ComboboxWithSearch
        classNameButton="w-full sm:w-64"
        value={value}
        placeholder={t('branchPlaceholder')}
        onChange={(next) => {
          const picked = branches.find((branch) => branch.name === next);
          if (picked) onChange(picked);
        }}
        items={branches.map((branch) => ({
          value: branch.name,
          label:
            branch.name === defaultBranch
              ? t('branchDefaultOption', { branch: branch.name })
              : branch.name,
        }))}
      />
    </Row>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-primary/5 px-3 py-2 text-xs text-primary">
      <GitBranchIcon className="size-4 shrink-0" />
      {children}
    </div>
  );
}
