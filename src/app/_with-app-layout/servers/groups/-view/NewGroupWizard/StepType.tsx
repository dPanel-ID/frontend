import { LoaderCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ClusterKindIcon } from '@/features/server-groups/view/ClusterKindIcon';

import type { ClusterKindDto } from '@/shared/rules/cluster';

import { OptionCard } from './OptionCard';
import { GENERIC_KIND } from './use-new-group-wizard';

interface StepTypeProps {
  kinds: ClusterKindDto[];
  kindsState: 'loading' | 'failed' | 'ready';
  onRetryKinds: () => void;
  selected: string;
  onSelect: (kind: string) => void;
}

/** Step 1: Generic or one of the cluster kinds the backend lists. */
export function StepType(props: StepTypeProps) {
  const { kinds, kindsState, onRetryKinds, onSelect, selected } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard.type');

  return (
    <div className="grid gap-3">
      <p className="text-sm font-semibold text-primary">{t('heading')}</p>
      <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
        <OptionCard
          selected={selected === GENERIC_KIND}
          onSelect={() => onSelect(GENERIC_KIND)}
          icon={<ClusterKindIcon kind={GENERIC_KIND} className="size-5" />}
          title={t('generic')}
          description={t('genericDescription')}
          meta={t('genericMin')}
        />
        {kinds.map((kind) => {
          const planned = kind.status !== 'available';

          return (
            <OptionCard
              key={kind.name}
              selected={selected === kind.name}
              onSelect={() => onSelect(kind.name)}
              icon={<ClusterKindIcon kind={kind.name} className="size-5" />}
              title={kind.title || kind.name}
              description={kind.description}
              meta={
                kind.min_servers > 1
                  ? t('minServers', { count: kind.min_servers })
                  : t('minServer')
              }
              disabled={planned}
              badge={planned ? t('comingSoon') : undefined}
              badgeTone="neutral"
            />
          );
        })}
      </div>

      {kindsState === 'loading' && (
        <p className="inline-flex items-center gap-2 text-xs text-muted-foreground">
          <LoaderCircleIcon className="size-3.5 animate-spin" />
          {t('loading')}
        </p>
      )}
      {kindsState === 'failed' && (
        <p className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-300">
          {t('kindsFailed')}
          <button
            type="button"
            className="font-semibold underline underline-offset-2"
            onClick={onRetryKinds}
          >
            {t('retry')}
          </button>
        </p>
      )}
    </div>
  );
}
