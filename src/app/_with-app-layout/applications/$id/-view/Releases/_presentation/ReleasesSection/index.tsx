import type { ReactNode } from 'react';

import { RocketIcon, TriangleAlertIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

export type ReleasesTab = 'builds' | 'servers';

interface ReleasesSectionProps {
  activeTab: ReleasesTab;
  onSelectTab: (tab: ReleasesTab) => void;
  /** Hidden entirely for applications that are not built from a repository. */
  ctaNewVisible?: boolean;
  ctaNewState?: 'loading' | 'disabled';
  ctaNewOnClick: () => void;
  /** Shown under the header on the builds tab only. */
  withStorageNote?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}

const TABS: ReleasesTab[] = ['builds', 'servers'];

/**
 * One section for the whole release story. The old page split it into two
 * tabs named "Artifacts" and "Deployments", which told a first-time user
 * nothing; these are "Builds" and "Running on servers", and the header says
 * in one line how the two relate.
 */
export default function ReleasesSection(props: ReleasesSectionProps) {
  const {
    activeTab,
    children,
    ctaNewOnClick,
    ctaNewState,
    ctaNewVisible = true,
    footer,
    onSelectTab,
    withStorageNote,
  } = props;

  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="flex flex-col gap-3 border-b px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-bold">{t('title')}</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <div
            role="group"
            aria-label={t('tabsLabel')}
            className="inline-flex h-8 items-center rounded-md border bg-background p-0.5"
          >
            {TABS.map((tab) => {
              const isActive = activeTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => onSelectTab(tab)}
                  className={cn(
                    'h-full rounded-sm px-3 text-xs font-medium transition-colors',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                  )}
                >
                  {t(`tabs.${tab}`)}
                </button>
              );
            })}
          </div>

          {ctaNewVisible && (
            <Button
              size="sm"
              disabled={ctaNewState != null}
              onClick={ctaNewOnClick}
            >
              {ctaNewState === 'loading' ? (
                <Spinner />
              ) : (
                <>
                  <RocketIcon className="size-4" />
                  {t('newBuild')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {withStorageNote && (
        <div className="px-4 pt-3">
          <div className="flex items-start gap-2 rounded-xl border border-amber-400/40 bg-amber-50 px-3 py-2 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
            <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" />
            <p className="text-xs leading-relaxed">{t('storageNote')}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 p-4">{children}</div>

      {footer && <div className="border-t px-4 py-3">{footer}</div>}
    </section>
  );
}
