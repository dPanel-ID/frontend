import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CloudLightningIcon,
  SearchXIcon,
  ServerCogIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

interface ServersEmptyStateProps {
  /** True when a search or status filter hides servers that exist. */
  filtered: boolean;
  onClearFilters: () => void;
}

/**
 * Shown when the list is empty: with filters on, a way back to the full
 * list; otherwise the two paths to a first server, as on the create page.
 */
export function ServersEmptyState(props: ServersEmptyStateProps) {
  const { filtered, onClearFilters } = props;
  const t = useDevetekTranslations();

  if (filtered) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed bg-card px-6 py-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-xl border bg-background text-muted-foreground">
          <SearchXIcon className="size-6" />
        </span>
        <h3 className="text-lg font-bold">
          {t('page.servers.empty.filteredTitle')}
        </h3>
        <p className="max-w-md text-sm text-muted-foreground">
          {t('page.servers.empty.filteredMessage')}
        </p>
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          onClick={onClearFilters}
        >
          {t('page.servers.empty.clear')}
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />
      <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl border',
            FLOW_ACCENTS.sky.icon,
          )}
        >
          <ServerIcon className="size-7" />
        </span>
        <div>
          <h3 className="text-xl font-bold">{t('page.servers.empty.title')}</h3>
          <p className="mx-auto mt-1.5 max-w-lg text-sm leading-relaxed text-muted-foreground">
            {t('page.servers.empty.message')}
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to="/servers/create" className={flowCtaClassName('sky')}>
            <CloudLightningIcon className="size-4" />
            {t('page.servers.empty.launch')}
            <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
          <Link
            to="/servers/create"
            search={{ mode: 'manual' }}
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors',
              FLOW_ACCENTS.violet.border,
              FLOW_ACCENTS.violet.text,
              'hover:bg-violet-500/5',
            )}
          >
            <ServerCogIcon className="size-4" />
            {t('page.servers.empty.connect')}
          </Link>
        </div>
      </div>
    </div>
  );
}
