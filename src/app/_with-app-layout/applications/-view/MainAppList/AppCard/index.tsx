import type { ComponentProps, ReactNode } from 'react';

import { useNavigate } from '@tanstack/react-router';
import dayjs from 'dayjs';
import {
  BuildingIcon,
  CalendarIcon,
  Code2Icon,
  ExternalLinkIcon,
  EyeIcon,
  FolderIcon,
  GitBranchIcon,
  GithubIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlayIcon,
  RocketIcon,
  ServerIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { ApplicationCard } from '@/entities/application/rules/schema';
import { getBundleIcon, getSourceBadge } from '@/entities/application/ui/lib';
import { CICD_ARTIFACT_STATUS_METADATA } from '@/entities/cicd-artifact/ui/constants/state-metadata';
import { OS_SERVICE_STATE_METADATA } from '@/entities/os-service/ui/constants/state-metadata';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import { excludeFalsy } from '@/shared/libs/browser/typeguards';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Tooltip } from '@/shared/presentation/atoms/Tooltip';
import IconEye from '@/shared/presentation/icons/Eye';
import IconEyeActive from '@/shared/presentation/icons/EyeActive';
import IconLastDateActive from '@/shared/presentation/icons/LastDateActive';
import ActionPopover from '@/shared/presentation/molecules/ActionPopover';
import { ResourceCard } from '@/widgets/resource-card';

import type { AppCardProps } from './types';

type ApplicationServer = ApplicationCard['additionalInfo']['servers'][number];
type DeploymentStatus = keyof typeof CICD_ARTIFACT_STATUS_METADATA;
type ServiceState = keyof typeof OS_SERVICE_STATE_METADATA;
type IconComponent = (props: { className?: string }) => ReactNode;
type PopoverAction = ComponentProps<typeof ActionPopover>['actions'][number];

export default function AppCard(props: AppCardProps) {
  const {
    variant,
    data,
    onClickEdit,
    onClickDelete,
    onClickMigrateOwnership,
    onClickDetails,
  } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();
  const navigate = useNavigate();

  const { status: lastArtifactStatus } = data.state.lastArtifact;
  const primaryServer = data.additionalInfo.servers[0];
  const primaryLanguage = data.configDefs.lifecycle?.setup.languages[0];
  const runtime = data.configDefs.lifecycle?.run;

  const lastUpdated = getDistanceFromNow(data.timestamp.updated, locale);

  const cnCardWrapper = cn({
    'border-red-500': lastArtifactStatus === 'failed',
    'border-orange-500 border-dashed': lastArtifactStatus === 'deleting',
    'border-cyan-500 border-dashed': lastArtifactStatus === 'progress',
  });

  const cnRowWrapper = cn(
    'border-l-2 border-l-transparent bg-card/20 transition-colors hover:bg-card/50',
    {
      'border-l-red-500': lastArtifactStatus === 'failed',
      'border-l-orange-500': lastArtifactStatus === 'deleting',
      'border-l-cyan-500': lastArtifactStatus === 'progress',
    },
  );

  const actions = [
    {
      label: t('common.actions.details'),
      icon: IconEye,
      iconActive: IconEyeActive,
      onClick: onClickDetails,
    },
    !!onClickEdit && {
      label: t('common.actions.edit'),
      icon: PencilIcon,
      onClick: onClickEdit,
    },
    {
      label: t('common.actions.migrateOwnership'),
      icon: BuildingIcon,
      onClick: onClickMigrateOwnership,
    },
    {
      variant: 'destructive' as const,
      label: t('common.actions.delete'),
      icon: Trash2Icon,
      onClick: onClickDelete,
    },
  ].filter(excludeFalsy);

  const getBadgeTooltip = () => {
    if (data.identity.source === 'repository') {
      return capitalizeFirstLetter(data.identity.sourceKind);
    }

    return undefined;
  };

  if (variant === 'compact') {
    const sourceValue =
      data.identity.source === 'repository'
        ? `${data.identity.repoOrganization}/${data.identity.repoName}`
        : undefined;

    const deployValue = data.configDefs.cicd.autoDeploy.enabled
      ? data.configDefs.cicd.autoDeploy.fromBranch
      : t('common.terms.off');

    return (
      <ResourceCard.Compact
        classNameCardWrapper={cnCardWrapper}
        onClickBody={() =>
          navigate({ to: '/applications/$id', params: { id: String(data.id) } })
        }
      >
        <ResourceCard.Compact.Main>
          <div className="flex items-start gap-x-2 w-full text-left">
            <ResourceCard.Compact.Main.Hero
              image={getBundleIcon(data.identity.bundleType)}
              badge={getSourceBadge(data.identity)}
              badgeTooltipMessage={getBadgeTooltip()}
            />
            <ResourceCard.Compact.Main.Content
              title={data.identity.name}
              status={[
                !!data.ownership.team && {
                  icon: BuildingIcon,
                  text: data.ownership.team,
                },
                {
                  icon: UserIcon,
                  text: data.ownership.owner,
                },
              ]}
            />
          </div>
        </ResourceCard.Compact.Main>
        <ResourceCard.Compact.SecondaryInfos
          infos={[
            {
              icon: GithubIcon,
              infoLabel: t('common.terms.source'),
              value: sourceValue,
            },
            {
              icon: GitBranchIcon,
              infoLabel: t('common.terms.auto'),
              value: deployValue,
            },
          ]}
        />
        <ResourceCard.Compact.Actions
          visibleActionOnlyIcon
          labelMore={t('common.actions.more')}
          actions={actions}
        />
        <ResourceCard.Compact.Footnote>
          {primaryLanguage && (
            <ResourceCard.Compact.Footnote.Item
              icon={Code2Icon}
              label={t('common.terms.language')}
              value={formatLanguage(primaryLanguage)}
            />
          )}
          <ResourceCard.Compact.Footnote.Spacer />
          <ResourceCard.Compact.Footnote.Item
            icon={IconLastDateActive}
            label={t('common.terms.lastUpdated')}
            value={lastUpdated}
          />
        </ResourceCard.Compact.Footnote>
      </ResourceCard.Compact>
    );
  }

  const bundleLabel =
    data.identity.bundleType === 'unknown'
      ? t('common.terms.unknown')
      : capitalizeFirstLetter(data.identity.bundleType);
  const sourceValue = getSourceValue(data);
  const branchValue = getBranchValue(data);
  const deploymentStatus = normalizeDeploymentStatus(
    primaryServer?.deployStatus || lastArtifactStatus,
  );
  const deploymentStatusMeta = CICD_ARTIFACT_STATUS_METADATA[deploymentStatus];
  const serviceState = normalizeServiceState(primaryServer?.serviceState);
  const serviceStateMeta = OS_SERVICE_STATE_METADATA[serviceState];
  const autoDeployLabel = data.configDefs.cicd.autoDeploy.enabled
    ? t('common.terms.autoDeploy')
    : t('common.terms.off');
  const serverCount = data.additionalInfo.servers.length;
  const createdAt = dayjs(data.timestamp.created).format('YYYY/MM/DD HH:mm');
  const updatedAt = dayjs(data.timestamp.updated).format('YYYY/MM/DD HH:mm');

  const handleOpenApplication = () => {
    navigate({ to: '/applications/$id', params: { id: String(data.id) } });
  };

  return (
    <article className={cnRowWrapper}>
      <div className="grid grid-cols-[minmax(280px,1.6fr)_minmax(190px,1fr)_minmax(170px,0.8fr)_minmax(170px,0.85fr)_88px] items-center gap-4 px-4 py-3">
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
          onClick={handleOpenApplication}
        >
          <ApplicationIcon icon={getBundleIcon(data.identity.bundleType)} />
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-2">
              <h3 className="truncate text-sm font-bold text-primary">
                {data.identity.name}
              </h3>
              {data.identity.source === 'repository' && (
                <GithubIcon className="size-3.5 shrink-0 text-primary/45" />
              )}
            </div>
            <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-primary/50">
              <InlineInfo icon={GithubIcon} value={sourceValue} />
              <InlineInfo icon={GitBranchIcon} value={branchValue} />
              <InlineInfo icon={GlobeIcon} value={data.additionalInfo.domain} />
            </div>
          </div>
        </button>

        <ServerSummary
          server={primaryServer}
          serverCount={serverCount}
          onClickServer={(serverId) =>
            navigate({ to: '/servers/$id', params: { id: String(serverId) } })
          }
        />

        <div className="min-w-0">
          <Badge variant="outline" className="max-w-full font-mono">
            <span className="truncate">{bundleLabel}</span>
          </Badge>
          <p className="mt-1 truncate text-xs font-medium text-primary/55">
            {formatLanguage(primaryLanguage) || t('common.terms.unknown')}
          </p>
        </div>

        <div className="flex min-w-0 flex-col items-start gap-1.5">
          <StatusPill
            icon={deploymentStatusMeta.icon}
            label={t(deploymentStatusMeta.i18n.statusLabel)}
            color={`var(${deploymentStatusMeta.color})`}
          />
          <div className="flex min-w-0 flex-wrap gap-1">
            <StatusPill
              icon={RocketIcon}
              label={autoDeployLabel}
              color={
                data.configDefs.cicd.autoDeploy.enabled
                  ? 'var(--color-green-500)'
                  : 'var(--color-gray-500)'
              }
              compact
            />
            {primaryServer?.serviceState && (
              <StatusPill
                icon={serviceStateMeta.icon}
                label={t(serviceStateMeta.i18n.statusLabel)}
                color={`var(${serviceStateMeta.color})`}
                compact
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-1">
          <Button
            size="icon-sm"
            buttonColor="secondary"
            buttonStyle="ghost"
            aria-label={t('common.actions.details')}
            onClick={onClickDetails}
          >
            <EyeIcon />
          </Button>
          <ActionPopover actions={toPopoverActions(actions.slice(1))}>
            <Button
              size="icon-sm"
              buttonColor="secondary"
              buttonStyle="ghost"
              aria-label={t('common.actions.more')}
            >
              <MoreHorizontalIcon />
            </Button>
          </ActionPopover>
        </div>
      </div>

      <div className="border-t border-dashed bg-background/20 px-4 py-3">
        <div className="grid gap-4 lg:grid-cols-3">
          <InfoGroup title={t('common.terms.infrastructure')}>
            <InfoItem
              icon={ServerIcon}
              label={t('common.terms.server')}
              value={formatServerLabel(primaryServer, t('common.terms.server'))}
              onClick={
                primaryServer
                  ? () =>
                      navigate({
                        to: '/servers/$id',
                        params: { id: String(primaryServer.id) },
                      })
                  : undefined
              }
            />
            <InfoItem
              icon={PlayIcon}
              label={t('common.terms.service')}
              value={runtime?.name || primaryServer?.serviceName}
            />
            <InfoItem
              icon={RocketIcon}
              label={t('common.terms.port')}
              value={runtime?.port ? `:${runtime.port}` : undefined}
            />
            <InfoItem
              icon={FolderIcon}
              label={t('common.terms.path')}
              value={data.additionalInfo.workdir}
            />
          </InfoGroup>

          <InfoGroup title={t('common.terms.sourceAndDeploy')}>
            <InfoItem
              icon={GithubIcon}
              label={t('common.terms.repository')}
              value={sourceValue}
              href={data.additionalInfo.repoUrl}
            />
            <InfoItem
              icon={GitBranchIcon}
              label={t('common.terms.branch')}
              value={branchValue}
            />
            <InfoItem
              icon={RocketIcon}
              label={t('common.terms.autoDeploy')}
              value={autoDeployLabel}
            />
            <InfoItem
              icon={Code2Icon}
              label={t('common.terms.command')}
              value={runtime?.command}
            />
          </InfoGroup>

          <InfoGroup title={t('common.terms.configuration')}>
            <InfoItem
              icon={Code2Icon}
              label={t('common.terms.language')}
              value={formatLanguage(primaryLanguage)}
            />
            <InfoItem
              icon={CalendarIcon}
              label={t('common.terms.createdAt')}
              value={createdAt}
            />
            <InfoItem
              icon={IconLastDateActive}
              label={t('common.terms.lastUpdated')}
              value={updatedAt}
            />
            <InfoItem
              icon={BuildingIcon}
              label={t('common.terms.ownership')}
              value={joinCompact([data.ownership.team, data.ownership.owner])}
            />
          </InfoGroup>
        </div>
      </div>
    </article>
  );
}

function ApplicationIcon(props: { icon: ReturnType<typeof getBundleIcon> }) {
  const { icon } = props;

  if (typeof icon === 'string') {
    return (
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background/70">
        <img src={icon} alt="" className="max-h-7 max-w-7 object-contain" />
      </span>
    );
  }

  const Icon = icon;

  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background/70">
      <Icon className="size-6 text-primary/65" />
    </span>
  );
}

function ServerSummary(props: {
  server?: ApplicationServer;
  serverCount: number;
  onClickServer: (serverId: number) => void;
}) {
  const { server, serverCount, onClickServer } = props;
  const t = useDevetekTranslations();

  if (!server) {
    return (
      <p className="text-xs italic text-primary/40">
        {t('common.terms.unknown')}
      </p>
    );
  }

  const serverName = server.name || `${t('common.terms.server')} ${server.id}`;

  return (
    <div className="min-w-0">
      <button
        type="button"
        className="flex min-w-0 items-center gap-1.5 text-left text-sm font-bold text-primary hover:underline"
        onClick={() => onClickServer(server.id)}
      >
        <ServerIcon className="size-4 shrink-0 text-primary/55" />
        <span className="truncate">{serverName}</span>
      </button>
      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-primary/50">
        <InlineInfo icon={GlobeIcon} value={server.address} />
        {serverCount > 1 && (
          <span className="rounded-full border bg-background/60 px-2 py-0.5 text-[0.7rem] font-bold text-primary/55">
            +{serverCount - 1}
          </span>
        )}
      </div>
    </div>
  );
}

function StatusPill(props: {
  icon: IconComponent;
  label: string;
  color: string;
  compact?: boolean;
}) {
  const { icon: Icon, label, color, compact } = props;

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-full border border-current bg-background/60 font-bold',
        compact ? 'px-2 py-0.5 text-[0.68rem]' : 'px-2.5 py-1 text-xs',
      )}
      style={{ color }}
    >
      <Icon className={compact ? 'size-3' : 'size-3.5'} />
      <span className="truncate">{label}</span>
    </span>
  );
}

function InfoGroup(props: { title: string; children: ReactNode }) {
  const { title, children } = props;

  return (
    <section className="min-w-0">
      <p className="mb-2 text-[0.68rem] font-bold uppercase tracking-wide text-primary/45">
        {title}
      </p>
      <div className="grid gap-1.5">{children}</div>
    </section>
  );
}

function InfoItem(props: {
  icon: IconComponent;
  label: string;
  value?: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  const { icon: Icon, label, value, href, onClick } = props;
  const t = useDevetekTranslations();
  const displayValue = isEmptyValue(value) ? (
    <em className="text-primary/35">{t('common.terms.unknown')}</em>
  ) : (
    value
  );
  const valueText = typeof value === 'string' ? value : undefined;

  const cnValue = cn(
    'min-w-0 truncate text-xs font-semibold text-primary/75',
    (href || onClick) && !isEmptyValue(value) && 'hover:underline',
  );

  const content = (
    <>
      <span className="flex min-w-[6.25rem] items-center gap-1.5 text-xs font-medium text-primary/45">
        <Icon className="size-3.5 shrink-0" />
        {label}
      </span>
      <span className={cnValue}>
        {displayValue}
        {href && !isEmptyValue(value) && (
          <ExternalLinkIcon className="ml-1 inline size-3 align-[-0.125rem] text-primary/40" />
        )}
      </span>
    </>
  );

  if (href && !isEmptyValue(value)) {
    return (
      <Tooltip message={valueText}>
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          {content}
        </a>
      </Tooltip>
    );
  }

  if (onClick && !isEmptyValue(value)) {
    return (
      <Tooltip message={valueText}>
        <button
          type="button"
          className="flex min-w-0 items-center gap-2 text-left"
          onClick={onClick}
        >
          {content}
        </button>
      </Tooltip>
    );
  }

  return (
    <Tooltip message={valueText}>
      <div className="flex min-w-0 items-center gap-2">{content}</div>
    </Tooltip>
  );
}

function InlineInfo(props: { icon: IconComponent; value?: string }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <Tooltip message={value}>
      <span className="inline-flex min-w-0 items-center gap-1">
        <Icon className="size-3.5 shrink-0" />
        <span className="truncate">{value}</span>
      </span>
    </Tooltip>
  );
}

function formatLanguage(
  language?: NonNullable<
    ApplicationCard['configDefs']['lifecycle']
  >['setup']['languages'][number],
) {
  if (!language) return undefined;

  return joinCompact([language.name, language.version]);
}

function getSourceValue(data: ApplicationCard) {
  if (data.identity.source !== 'repository') return undefined;

  return `${data.identity.repoOrganization}/${data.identity.repoName}`;
}

function getBranchValue(data: ApplicationCard) {
  if (data.configDefs.cicd.autoDeploy.enabled) {
    return data.configDefs.cicd.autoDeploy.fromBranch;
  }

  return (
    data.additionalInfo.latestArtifactBranch ??
    data.additionalInfo.defaultBranch
  );
}

function formatServerLabel(
  server: ApplicationServer | undefined,
  fallbackServerLabel: string,
) {
  if (!server) return undefined;

  return joinCompact([
    server.name || `${fallbackServerLabel} ${server.id}`,
    server.address ? `(${server.address})` : undefined,
  ]);
}

function normalizeDeploymentStatus(status?: string): DeploymentStatus {
  switch (status) {
    case 'ready':
    case 'failed':
    case 'deleted':
    case 'deleting':
    case 'cancelled':
      return status;

    case 'progress':
    case 'pending':
      return 'progress';

    default:
      return 'unknown';
  }
}

function normalizeServiceState(state?: string): ServiceState {
  if (state && state in OS_SERVICE_STATE_METADATA) {
    return state as ServiceState;
  }

  return 'unknown';
}

function toPopoverActions(
  actions: Array<{
    variant?: 'destructive' | 'normal';
    label: string;
    icon?: PopoverAction['icon'];
    iconActive?: PopoverAction['iconActive'];
    onClick?: () => void;
  }>,
): ComponentProps<typeof ActionPopover>['actions'] {
  return actions.map((action) => ({
    ...action,
    variant: action.variant === 'destructive' ? 'danger' : 'normal',
  }));
}

function isEmptyValue(value?: ReactNode) {
  return value == null || value === '';
}

function joinCompact(values: Array<string | undefined>) {
  const cleaned = values.filter((value): value is string => Boolean(value));

  if (cleaned.length === 0) return undefined;

  return cleaned.join(' ');
}
