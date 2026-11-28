import { useRouter } from '@tanstack/react-router';
import {
  AppWindowIcon,
  BoltIcon,
  Calendar,
  ClockIcon,
  CodeIcon,
  GitBranchIcon,
  GitBranchPlusIcon,
  HammerIcon,
  HashIcon,
  LayersIcon,
  LoaderCircle,
  PlayIcon,
  RotateCcwIcon,
  ServerIcon,
  SquareIcon,
  Trash2Icon,
  UndoIcon,
  UserCogIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { CicdArtifact } from '@/entities/cicd-artifact/rules/schema';
import { whoDeployed } from '@/entities/cicd-deployment/lib/who-deployed';
import type { CicdDeployment } from '@/entities/cicd-deployment/rules/schema';
import { AdapterOsServiceFromDto } from '@/entities/os-service/adapter';
import { ServiceState } from '@/entities/os-service/ui/presentation/ServiceState';
import usePushServiceActivityUsecase from '@/entities/os-service/usecase/push-activity';
import { UserLink } from '@/entities/user/ui/UserLink';

import { ApiService } from '@/shared/api';
import {
  getDistanceFromNow,
  humanizeSeconds,
} from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import Shimmer from '@/shared/presentation/atoms/Shimmer';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { deploymentTone, isMovingStatus } from '../../-lib/describe-detail';
import { useEmit } from '../../-model/events';
import { canBackUpToGit } from '../../-rules/git-backup';

import { ArtifactCardPartials as Partials } from './_presentation/ArtifactCard/_Partials';
import { ServerReleases } from './_ServerReleases';

type DeployStatus = CicdDeployment['state']['status'];

type OsServiceState =
  | 'running'
  | 'dead'
  | 'failed'
  | 'exited'
  | 'reload'
  | 'reloading'
  | 'restarting'
  | 'unknown';

function DeploymentStatusBadge({ status }: { status: DeployStatus }) {
  const t = useDevetekTranslations('page.applicationDetail.deployStatus');

  return (
    <StatusPill
      tone={deploymentTone(status)}
      label={t(status)}
      pulse={isMovingStatus(status)}
      size="sm"
    />
  );
}

function DeploymentServiceState(props: {
  serverId: string;
  serviceName: string;
  fallbackInstallerStatus?: string;
}) {
  const { serverId, serviceName, fallbackInstallerStatus } = props;

  const t = useDevetekTranslations();
  const [responseServiceDetail] =
    ApiService.Origin.$ServerId.Detail.$ServiceName.useGet({
      serverId,
      serviceName,
      options: {
        skip: !serverId || !serviceName,
        refreshIntervalMs: 3000,
      },
    });

  const serviceDetail =
    responseServiceDetail.$status === 'success'
      ? responseServiceDetail
      : responseServiceDetail.$status === 'loading' &&
          responseServiceDetail.prevData
        ? responseServiceDetail.prevData
        : undefined;

  const serviceState = resolveServiceState(serviceDetail);
  const installerStatus = serviceDetail?.installer_status
    ? AdapterOsServiceFromDto.toState(serviceDetail.installer_status).unwrap()
    : fallbackInstallerStatus
      ? AdapterOsServiceFromDto.toState(fallbackInstallerStatus).unwrap()
      : undefined;
  const serviceError = serviceDetail?.error?.trim();
  const serviceDetailLines = serviceDetail?.detail ?? [];

  if (responseServiceDetail.$status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 text-xs text-amber-300">
        <LoaderCircle className="size-3 animate-spin" />
        {t('page.applicationDetail.releases.checkingService')}
      </span>
    );
  }

  return (
    <>
      <ServiceState.Badge
        className="size-3 ml-0.5"
        serviceState={serviceState}
      />
      <ServiceState.Label
        as="span"
        className="text-xs"
        serviceState={serviceState}
      />
      {installerStatus && installerStatus !== 'unknown' && (
        <span className="ml-2 flex items-center gap-1">
          <span className="text-[10px] uppercase tracking-wide text-primary/45">
            {t('page.applicationDetail.releases.installer')}
          </span>
          <DeploymentStatusBadge status={installerStatus as DeployStatus} />
        </span>
      )}
      {serviceError && (
        <span
          className="ml-2 text-[11px] text-red-400"
          title={serviceDetailLines.join('\n')}
        >
          {serviceError}
        </span>
      )}
    </>
  );
}

function resolveServiceState(serviceDetail?: {
  active?: string;
  state?: string;
}): OsServiceState {
  const state = normalizeServiceState(serviceDetail?.state);
  if (state) return state;

  const active = normalizeActiveState(serviceDetail?.active);
  if (active) return active;

  return 'unknown';
}

function normalizeServiceState(value?: string): OsServiceState | undefined {
  switch (value?.trim().toLowerCase()) {
    case 'running':
    case 'dead':
    case 'failed':
    case 'exited':
    case 'reload':
    case 'reloading':
    case 'restarting':
      return value.trim().toLowerCase() as OsServiceState;
    default:
      return undefined;
  }
}

function normalizeActiveState(value?: string): OsServiceState | undefined {
  switch (value?.trim().toLowerCase()) {
    case 'active':
      return 'running';
    case 'inactive':
    case 'deactivating':
      return 'dead';
    case 'failed':
      return 'failed';
    default:
      return undefined;
  }
}

interface DeploymentCardProps {
  data: CicdDeployment;
  artifact: CicdArtifact | undefined;
  /** The app deploys into release folders: list them and offer rollback. */
  usesReleaseFolders: boolean;
  onClickActivity: (activity: 'start' | 'stop' | 'restart') => void;
  onClickDelete: () => void;
  onClickRestore: () => void;
  onClickRuntime: () => void;
  onClickGitBackup: () => void;
}

function DeploymentCard({
  data,
  artifact,
  usesReleaseFolders,
  onClickActivity,
  onClickDelete,
  onClickRestore,
  onClickRuntime,
  onClickGitBackup,
}: DeploymentCardProps) {
  const locale = useDevetekLocale();
  const t = useDevetekTranslations();
  const updatedAt = getDistanceFromNow(data.timestamp.updated, locale);
  const deployer = whoDeployed(data, artifact);
  const router = useRouter();
  const serverHref = router.buildLocation({
    to: '/servers/$id',
    params: { id: data.serverSnapshot.id },
  }).href;

  const cnCard = cn(
    'overflow-hidden rounded-xl border bg-card transition-all',
    'hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
    {
      'border-emerald-500/40': data.state.status === 'ready',
      'border-red-500/40': data.state.status === 'failed',
      'border-sky-400/40': data.state.status === 'progress',
      'border-amber-400/40': data.state.status === 'cancelled',
    },
  );

  return (
    <div className={cnCard}>
      {/* Header row — IDs + status badge */}
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-x-2">
        <div className="pl-1 flex items-center gap-1 overflow-x-auto">
          <Partials.HeadingItemWrapper
            tooltipMessage={t('page.applicationDetail.releases.releaseId')}
          >
            <BoltIcon className="size-3" />
            {data.id}
          </Partials.HeadingItemWrapper>

          {artifact && (
            <>
              <Partials.HeadingItemWrapper
                tooltipMessage={`Commit ${artifact.commitMetadata.head}`}
              >
                <HashIcon className="size-3" />
                {artifact.commitMetadata.head.slice(0, 7)}
              </Partials.HeadingItemWrapper>

              <Partials.HeadingItemWrapper
                tooltipMessage={t('common.terms.branch')}
              >
                <GitBranchIcon className="size-3" />
                {artifact.commitMetadata.fromBranch}
              </Partials.HeadingItemWrapper>

              <Partials.HeadingItemWrapper
                tooltipMessage={t('page.applicationDetail.releases.buildTime')}
              >
                <ClockIcon className="size-3" />
                {humanizeSeconds(artifact.timestamp.buildTimeInSeconds)}
              </Partials.HeadingItemWrapper>
            </>
          )}
        </div>

        <div className="flex items-center">
          <DeploymentStatusBadge status={data.state.status} />
        </div>
      </div>

      {/* Body */}
      <div className="bg-card rounded-[7px] p-3 pt-2 flex flex-col gap-2">
        {artifact ? (
          <div className="flex flex-col">
            <h5 className="text-sm md:text-lg font-bold">
              {artifact.commitMetadata.title}
            </h5>
            <p className="text-xs md:text-sm line-clamp-1">
              {artifact.commitMetadata.description || (
                <em className="opacity-50">
                  {t('page.applicationDetail.releases.noDescription')}
                </em>
              )}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            {t('page.applicationDetail.releases.buildNotFound')}
          </p>
        )}

        <div className="flex items-center flex-wrap gap-x-4 gap-y-1">
          <a
            href={serverHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary/70 flex items-center gap-0.5 hover:underline"
          >
            <ServerIcon className="size-3" />
            {data.serverSnapshot.hostName}
          </a>

          {data.osService && (
            <p className="text-xs text-primary/70 flex items-center gap-0.5">
              <AppWindowIcon className="size-3" />
              {data.osService.serviceName}
              <DeploymentServiceState
                fallbackInstallerStatus={data.osService.installerStatus}
                serverId={data.serverSnapshot.id}
                serviceName={data.osService.serviceName}
              />
            </p>
          )}

          {deployer && (
            <p className="text-xs text-primary/70 flex items-center gap-0.5">
              <UserCogIcon className="size-3" />
              <UserLink {...deployer} />
            </p>
          )}

          <p className="text-xs text-primary/70 flex items-center gap-0.5">
            <Calendar className="size-3" />
            {updatedAt}
          </p>
        </div>

        {/* ── Artifact Snapshot ── */}
        {artifact && (
          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 pt-2 border-t border-border/50">
            <p className="text-xs text-primary/70 flex items-center gap-0.5 font-mono">
              <BoltIcon className="size-3 shrink-0" />
              artifact/{artifact.id}
            </p>

            {artifact.configSnapshot.lifecycle.setup.languages.length > 0 && (
              <div className="flex items-center gap-1">
                <CodeIcon className="size-3 text-muted-foreground shrink-0" />
                {artifact.configSnapshot.lifecycle.setup.languages.map(
                  (lang, i) => (
                    <span
                      key={i}
                      className="text-[10px] bg-muted px-1.5 py-0.5 rounded font-mono leading-none"
                    >
                      {lang.name} {lang.version}
                    </span>
                  ),
                )}
              </div>
            )}

            {artifact.configSnapshot.lifecycle.build.steps.length > 0 && (
              <p className="text-xs text-primary/70 flex items-center gap-0.5">
                <HammerIcon className="size-3 shrink-0" />
                {t('page.applicationDetail.releases.stepCount', {
                  count: artifact.configSnapshot.lifecycle.build.steps.length,
                })}
              </p>
            )}
          </div>
        )}

        {data.state.message && (
          <p className="text-xs text-destructive line-clamp-2">
            {data.state.message}
          </p>
        )}

        {usesReleaseFolders && data.state.status !== 'deleted' && (
          <ServerReleases
            deploymentId={String(data.id)}
            serverName={data.serverSnapshot.hostName}
          />
        )}

        {data.osService && (
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClickActivity('start')}
            >
              <PlayIcon className="size-3" />
              {t('common.actions.start')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClickActivity('restart')}
            >
              <RotateCcwIcon className="size-3" />
              {t('common.actions.restart')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onClickActivity('stop')}
            >
              <SquareIcon className="size-3" />
              {t('common.actions.stop')}
            </Button>
          </div>
        )}

        <div className="flex justify-end gap-2">
          {data.state.status !== 'deleted' &&
            (artifact?.configSnapshot.lifecycle.setup.languages.length ?? 0) >
              0 && (
              <Button variant="outline" size="sm" onClick={onClickRuntime}>
                <LayersIcon className="size-3" />
                {t('page.applicationDetail.releases.runtime.button')}
              </Button>
            )}
          {canBackUpToGit(data.state.status) && (
            <Button variant="outline" size="sm" onClick={onClickGitBackup}>
              <GitBranchPlusIcon className="size-3" />
              {t('page.applicationDetail.releases.gitBackup.button')}
            </Button>
          )}
          {data.state.status === 'deleted' && (
            <Button variant="outline" size="sm" onClick={onClickRestore}>
              <UndoIcon className="size-3" />
              {t('common.actions.restore')}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={onClickDelete}
          >
            <Trash2Icon className="size-3" />
            {data.state.status === 'deleted'
              ? t('page.applicationDetail.releases.deleteForever')
              : t('common.actions.delete')}
          </Button>
        </div>
      </div>
    </div>
  );
}

DeploymentCard.ShimmerPlaceholder = function ShimmerPlaceholder() {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center pl-1 gap-x-1">
        <Shimmer className="mx-1 my-1.5 h-4 w-7" />
        <Shimmer className="mx-1 my-1.5 h-4 w-16" />
        <Shimmer className="mx-1 my-1.5 h-4 w-11" />
      </div>
      <div className="bg-card rounded-[7px] p-3 pt-2 flex flex-col gap-2">
        <Shimmer className="my-1 h-5 w-[30%]" />
        <Shimmer className="h-4 w-[60%]" />
        <Shimmer className="h-3 w-[45%]" />
      </div>
    </div>
  );
};

export interface DeploymentListProps {
  list: CicdDeployment[];
  artifactList: CicdArtifact[];
  /** The app deploys into release folders (deploy_strategy "releases"). */
  usesReleaseFolders?: boolean;
}

export function DeploymentList({
  list,
  artifactList,
  usesReleaseFolders = false,
}: DeploymentListProps) {
  const artifactMap = new Map(artifactList.map((a) => [a.id, a]));
  const emit = useEmit();

  const [handleActivity] = usePushServiceActivityUsecase({
    onSuccess: () =>
      emit('@applications::detail/deployment-history-refresh', null),
  });

  return (
    <>
      {list.map((deployment) => (
        <DeploymentCard
          key={deployment.id}
          data={deployment}
          artifact={artifactMap.get(deployment.pointerIds.artifact)}
          usesReleaseFolders={usesReleaseFolders}
          onClickActivity={(activity) =>
            handleActivity({
              activity,
              serviceName: deployment.osService!.serviceName,
              targetServerId: deployment.serverSnapshot.id,
            })
          }
          onClickDelete={() =>
            emit('@applications::detail/deployment-delete', {
              deploymentId: deployment.id,
              usesReleaseFolders,
            })
          }
          onClickRestore={() =>
            emit('@applications::detail/deployment-restore', {
              applicationId: deployment.pointerIds.application,
              artifactId: deployment.pointerIds.artifact,
              workerId: deployment.pointerIds.machine,
            })
          }
          onClickGitBackup={() =>
            emit('@applications::detail/deployment-git-backup', {
              deploymentId: deployment.id,
              serverName: deployment.serverSnapshot.hostName,
            })
          }
          onClickRuntime={() =>
            emit('@applications::detail/runtime-move', {
              applicationId: deployment.pointerIds.application,
              artifactId: deployment.pointerIds.artifact,
              workerId: deployment.pointerIds.machine,
            })
          }
        />
      ))}
    </>
  );
}
