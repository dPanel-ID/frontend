import { Loader2Icon, RocketIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';
import { ReviewPanel } from '@/shared/presentation/organisms/ReviewPanel';
import type { ReviewPanelRow } from '@/shared/presentation/organisms/ReviewPanel';

import { useFlowReadiness } from '../../-model/flow-readiness';
import { useFormStore } from '../../-model/store/form';
import { useServersStore } from '../../-model/store/servers';
import { useSubmitFlow } from '../../-usecase/submit-flow';

const ROW_LABEL_KEY: Record<string, string> = {
  '1-source': 'step1.title',
  '2-server-dependencies': 'step2.title',
  '3-details': 'step3.title',
  '4-env': 'step4.title',
  '5-preview': 'step5.title',
};

/**
 * The sticky checklist and the flow's single primary action.
 *
 * Deploy used to sit inside the preview step, reachable only after walking
 * four screens. It lives here now, visible the whole way through and
 * disabled with a visible reason until the sections it depends on are done.
 */
export default function ReviewAside() {
  const t = useDevetekTranslations('page.applicationsCreate');
  const tProgress = useDevetekTranslations('page.applicationsCreate.progress');

  const { byStep, ready, steps } = useFlowReadiness();
  const { isSubmitting, isUpdate, submit } = useSubmitFlow();

  const [appName, appSourceGithubRepo, gitRepoConfig, hostedServerID] =
    useFormStore((s) => [
      s.appName,
      s.appSourceGithubRepo,
      s.gitRepoConfig,
      s.hostedServerID,
    ]);

  // `knownServersById` keeps servers the picker has already seen, so the
  // row keeps naming the server after the list pages away from it.
  const [, { knownServersById }] = useServersStore();
  const selectedServer = hostedServerID
    ? knownServersById[hostedServerID]
    : undefined;

  const rowValue = (key: string) => {
    switch (key) {
      case '1-source':
        return gitRepoConfig?.gitBranch
          ? `${shortRepo(appSourceGithubRepo)} · ${gitRepoConfig.gitBranch}`
          : shortRepo(appSourceGithubRepo);

      case '2-server-dependencies':
        return selectedServer?.hostname;

      case '3-details':
        return appName || undefined;

      default:
        return undefined;
    }
  };

  const rows: ReviewPanelRow[] = steps.map((key) => ({
    key,
    label: tProgress(ROW_LABEL_KEY[key]!),
    value: rowValue(key),
    done: byStep[key],
  }));

  const actionLabel = isUpdate ? t('actions.update') : t('actions.deploy');

  return (
    <ReviewPanel
      accent="sky"
      eyebrow={isUpdate ? t('review.eyebrowUpdate') : t('review.eyebrow')}
      title={t('review.title')}
      readyTitle={isUpdate ? t('review.readyUpdate') : t('review.ready')}
      rows={rows}
      footnote={isUpdate ? t('review.footnoteUpdate') : t('review.footnote')}
      action={
        <button
          type="button"
          className={cn(flowCtaClassName('sky'), 'w-full justify-center')}
          disabled={!ready || isSubmitting}
          aria-busy={isSubmitting}
          onClick={() => void submit()}
        >
          {isSubmitting ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            <RocketIcon className="size-4" />
          )}
          {actionLabel}
        </button>
      }
    />
  );
}

function shortRepo(repoUrl: string | null) {
  if (!repoUrl) return undefined;

  return repoUrl.replace('https://github.com/', '').replace('.git', '');
}
