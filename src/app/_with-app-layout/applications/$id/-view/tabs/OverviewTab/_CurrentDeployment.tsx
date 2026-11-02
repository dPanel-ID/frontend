import { Link, useParams } from '@tanstack/react-router';
import {
  ExternalLinkIcon,
  GitBranchIcon,
  GitCommitHorizontalIcon,
  GlobeIcon,
  RocketIcon,
  ScrollTextIcon,
  ServerIcon,
  UserCogIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import { whoDeployed } from '@/entities/cicd-deployment/lib/who-deployed';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';
import { UserLink } from '@/entities/user/ui/UserLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { deploymentTone, isMovingStatus } from '../../../-lib/describe-detail';

interface CurrentDeploymentProps {
  deployment?: CicdDeployment;
  artifact?: CicdArtifact;
  /** The load balancer address people reach this application on. */
  href?: string;
  domain?: string;
  onDeploy: () => void;
  canDeploy: boolean;
}

/**
 * What is live right now, at the top of the overview.
 *
 * This is the first question anyone opening an application has, and the
 * old page made you read a list of build cards to answer it. The commit
 * that is serving, where it is serving from, and the way in are one block.
 */
export default function CurrentDeployment(props: CurrentDeploymentProps) {
  const { artifact, canDeploy, deployment, domain, href, onDeploy } = props;

  const t = useDevetekTranslations('page.applicationDetail.current');
  const locale = useDevetekLocale();
  const { id } = useParams({ from: '/_with-app-layout/applications/$id/' });

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-xl border',
                FLOW_ACCENTS.sky.icon,
              )}
            >
              <RocketIcon className="size-4" />
            </span>
            <div>
              <h2 className="text-base font-bold">{t('title')}</h2>
              <p className="text-xs text-muted-foreground">{t('subtitle')}</p>
            </div>
          </div>

          {deployment && (
            <StatusPill
              tone={deploymentTone(deployment.state.status)}
              label={t(`status.${deployment.state.status}`)}
              pulse={isMovingStatus(deployment.state.status)}
            />
          )}
        </div>

        {deployment ? (
          <>
            <div className="rounded-xl border bg-background/60 p-4">
              <p className="truncate text-sm font-bold sm:text-base">
                {artifact?.commitMetadata.title ?? t('unknownCommit')}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                {artifact && (
                  <>
                    <span className="inline-flex items-center gap-1">
                      <GitBranchIcon className="size-3.5 shrink-0" />
                      {artifact.commitMetadata.fromBranch}
                    </span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <GitCommitHorizontalIcon className="size-3.5 shrink-0" />
                      {artifact.commitMetadata.head.slice(0, 7)}
                    </span>
                    <span className="inline-flex min-w-0 items-center gap-1">
                      <UserCogIcon className="size-3.5 shrink-0" />
                      <UserLink {...whoDeployed(deployment, artifact)!} />
                    </span>
                  </>
                )}
                <span className="inline-flex items-center gap-1">
                  <ServerIcon className="size-3.5 shrink-0" />
                  {deployment.serverSnapshot.hostName}
                </span>
                {domain && (
                  <span className="inline-flex min-w-0 items-center gap-1">
                    <GlobeIcon className="size-3.5 shrink-0" />
                    <span className="truncate">{domain}</span>
                  </span>
                )}
                <span>
                  {getDistanceFromNow(deployment.timestamp.updated, locale)}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {href && (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className={flowCtaClassName('sky')}
                >
                  <ExternalLinkIcon className="size-4" />
                  {t('visit')}
                </a>
              )}

              <Button variant="outline" size="sm" asChild>
                <Link
                  to="/applications/$id"
                  params={{ id }}
                  search={{ tab: 'logs' }}
                >
                  <ScrollTextIcon className="size-4" />
                  {t('viewLogs')}
                </Link>
              </Button>

              {canDeploy && (
                <Button variant="outline" size="sm" onClick={onDeploy}>
                  <RocketIcon className="size-4" />
                  {t('redeploy')}
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed p-5">
            <p className="text-sm font-semibold">{t('emptyTitle')}</p>
            <p className="max-w-xl text-xs leading-relaxed text-muted-foreground">
              {t('emptyDescription')}
            </p>
            {canDeploy && (
              <button
                type="button"
                className={flowCtaClassName('sky')}
                onClick={onDeploy}
              >
                <RocketIcon className="size-4" />
                {t('deployNow')}
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
