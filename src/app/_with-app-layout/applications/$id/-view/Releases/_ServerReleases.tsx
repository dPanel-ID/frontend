import { useMemo } from 'react';

import {
  FolderClockIcon,
  GitCommitHorizontalIcon,
  LoaderCircle,
  RotateCcwIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { ApiDeploy } from '@/shared/api';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { Button } from '@/shared/presentation/atoms/Button';
import Shimmer from '@/shared/presentation/atoms/Shimmer';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { toServerReleasesView } from '../../-lib/server-releases';
import type { ServerReleaseItem } from '../../-lib/server-releases';
import { useEmit, useSubscribe } from '../../-model/events';

interface ServerReleasesProps {
  deploymentId: string;
  serverName: string;
}

function useReleaseLabel() {
  const t = useDevetekTranslations(
    'page.applicationDetail.releases.serverReleases',
  );
  const locale = useDevetekLocale();
  const format = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  );

  return (release: ServerReleaseItem) => {
    if (release.isBeforeReleaseFolders) return t('beforeReleaseFolders');
    if (release.date) return format.format(release.date);
    return release.name;
  };
}

/**
 * The release folders of the app on one server: which one is live, which
 * one a rollback goes back to, and a Roll back action on every other one.
 * Only shown for apps that use release folders.
 */
export function ServerReleases(props: ServerReleasesProps) {
  const { deploymentId, serverName } = props;
  const t = useDevetekTranslations(
    'page.applicationDetail.releases.serverReleases',
  );
  const locale = useDevetekLocale();
  const emit = useEmit();
  const labelOf = useReleaseLabel();

  const [response, refresh] = ApiDeploy.Releases.$Id.useGet({
    deploymentId,
    options: {
      silentRefresh: true,
      refetchOnVisible: true,
      refreshIntervalMs: 15000,
    },
  });

  useSubscribe('@applications::detail/deployment-releases-refresh', () =>
    refresh(),
  );

  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const view = useMemo(() => toServerReleasesView(data), [data]);

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h6 className="flex items-center gap-1.5 text-xs font-bold">
        <FolderClockIcon className="size-3.5" aria-hidden />
        {t('title')}
      </h6>
      {view.running && (
        <StatusPill tone="info" pulse size="sm" label={t('running')} />
      )}
    </div>
  );

  if (response.$status === 'failed' && !data) {
    return (
      <section className="grid gap-2 rounded-lg border bg-background p-3">
        {header}
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t('failed')}</span>
          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => refresh()}
          >
            {t('retry')}
          </Button>
        </div>
      </section>
    );
  }

  if (!data) {
    return (
      <section
        className="grid gap-2 rounded-lg border bg-background p-3"
        aria-busy="true"
      >
        {header}
        <Shimmer className="h-8 w-full" />
        <Shimmer className="h-8 w-full" />
      </section>
    );
  }

  return (
    <section className="grid gap-2 rounded-lg border bg-background p-3">
      {header}

      {view.releases.length === 0 ? (
        <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          {t('empty')}
        </p>
      ) : (
        <ul className="grid gap-1.5">
          {view.releases.map((release) => {
            const label = labelOf(release);
            return (
              <li
                key={release.name}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-md border bg-card px-2.5 py-1.5"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span
                    className="truncate text-xs font-semibold"
                    title={release.name}
                  >
                    {label}
                  </span>
                  {release.commit && (
                    <span className="inline-flex items-center gap-0.5 font-mono text-[11px] text-muted-foreground">
                      <GitCommitHorizontalIcon className="size-3" aria-hidden />
                      {release.commit.slice(0, 7)}
                    </span>
                  )}
                  {release.current && (
                    <StatusPill tone="success" size="sm" label={t('current')} />
                  )}
                  {release.previous && (
                    <StatusPill
                      tone="neutral"
                      size="sm"
                      label={t('previous')}
                    />
                  )}
                </span>
                {release.canRollBack ? (
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    className="gap-1"
                    aria-label={t('rollBackTo', { release: label })}
                    title={t('rollBackTo', { release: label })}
                    onClick={() =>
                      emit(
                        '@applications::detail/deployment-release-rollback',
                        {
                          deploymentId,
                          release: release.name,
                          releaseLabel: label,
                          serverName,
                        },
                      )
                    }
                  >
                    <RotateCcwIcon className="size-3" aria-hidden />
                    {t('rollBack')}
                  </Button>
                ) : view.running && !release.current ? (
                  <LoaderCircle
                    className="size-3.5 animate-spin text-muted-foreground"
                    aria-label={t('running')}
                  />
                ) : (
                  <span />
                )}
              </li>
            );
          })}
        </ul>
      )}

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        {view.reportedAt
          ? t('footer', {
              count: view.keepReleases,
              when: getDistanceFromNow(view.reportedAt, locale),
            })
          : t('footerNotReported', { count: view.keepReleases })}
      </p>
    </section>
  );
}
