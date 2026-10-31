import { Fragment } from 'react';

import {
  BoltIcon,
  Calendar,
  CheckIcon,
  ChevronDownIcon,
  ClockIcon,
  CodeIcon,
  GitBranchIcon,
  GlobeIcon,
  HammerIcon,
  HashIcon,
  TerminalIcon,
  UserCogIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import {
  getDistanceFromNow,
  humanizeSeconds,
} from '@/shared/libs/browser/date';
import { excludeFalsy } from '@/shared/libs/browser/typeguards';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import Shimmer from '@/shared/presentation/atoms/Shimmer';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { ArtifactCardPartials as Partials } from './_Partials';
import type { ArtifactCardProps } from './types';

export default function ArtifactCard(props: ArtifactCardProps) {
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const {
    releaseStatus,
    data,
    isUsed,
    isDeploying,
    onClickLogs,
    logsDisabled,
    logsOptions,
    onClickDelete,
    onClickRollback,
    onClickStatus,
  } = props;
  const logsLabel = t('page.applicationDetail.releases.logs');

  const artifactBuildFormattedDate = getDistanceFromNow(
    data.timestamp.updated,
    locale,
  );

  const elCta = [
    logsOptions && logsOptions.length > 1 ? (
      <DropdownMenu key="logs">
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {logsLabel}
            <ChevronDownIcon className="size-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {logsOptions.map((opt) => (
            <DropdownMenuItem key={opt.machineId} onClick={opt.onClick}>
              {opt.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : (
      <Button
        key="logs"
        variant="outline"
        size="sm"
        disabled={logsDisabled}
        onClick={onClickLogs}
        aria-label={logsLabel}
        title={logsLabel}
      >
        {logsLabel}
      </Button>
    ),
    <Button
      key="rollback"
      variant="outline"
      size="sm"
      onClick={onClickRollback}
    >
      {t('page.applicationDetail.releases.rollback')}
    </Button>,
    <Button
      key="delete"
      className="text-red-500"
      variant="outline"
      size="sm"
      onClick={onClickDelete}
    >
      {t('common.actions.delete')}
    </Button>,
  ].filter(excludeFalsy);

  return (
    <Partials.CardWrapper releaseStatus={releaseStatus}>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,auto)] gap-x-2">
        <div className="pl-1 flex items-center gap-1 overflow-x-auto">
          <Partials.HeadingItemWrapper
            tooltipMessage={t('page.applicationDetail.releases.buildId')}
          >
            <BoltIcon className="size-3" />
            {data.id}
          </Partials.HeadingItemWrapper>

          <Partials.HeadingItemWrapper
            tooltipMessage={`Commit ${data.commitMetadata.head}`}
          >
            <HashIcon className="size-3" />
            {data.commitMetadata.head.slice(0, 7)}
          </Partials.HeadingItemWrapper>

          <Partials.HeadingItemWrapper
            tooltipMessage={t('common.terms.branch')}
          >
            <GitBranchIcon className="size-3" />
            {data.commitMetadata.fromBranch}
          </Partials.HeadingItemWrapper>

          <Partials.HeadingItemWrapper
            tooltipMessage={t('page.applicationDetail.releases.buildTime')}
          >
            <ClockIcon className="size-3" />
            {humanizeSeconds(data.timestamp.buildTimeInSeconds)}
          </Partials.HeadingItemWrapper>
        </div>

        <div className="flex items-center gap-2">
          {isDeploying && (
            <StatusPill
              tone="warning"
              label={t('common.terms.inProgress')}
              pulse
            />
          )}
          {isUsed && !isDeploying && (
            <StatusPill
              tone="info"
              icon={CheckIcon}
              label={t('common.terms.used')}
            />
          )}
          <Partials.ReleaseStatusPill
            releaseStatus={releaseStatus}
            onClick={onClickStatus}
          />
        </div>
      </div>

      <div className="bg-card rounded-[7px] p-3 pt-2 flex flex-col">
        <div className="flex flex-col gap-y-4 md:grid md:grid-cols-[minmax(0,1fr)_minmax(0,100px)] gap-x-4">
          <div className="flex flex-col justify-between">
            <div className="flex flex-col">
              <h5 className="text-sm md:text-lg font-bold">
                {data.commitMetadata.title}
              </h5>
              <p className="text-xs md:text-sm break-words line-clamp-1">
                {data.commitMetadata.description || (
                  <em className="opacity-50">
                    {t('page.applicationDetail.releases.noDescription')}
                  </em>
                )}
              </p>
            </div>

            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-2">
              <p className="text-xs text-primary/70 flex items-center gap-0.5">
                <UserCogIcon className="size-3" />
                {data.executor.userName}
              </p>

              <p className="text-xs text-primary/70 flex items-center gap-0.5">
                <Calendar className="size-3" />
                {artifactBuildFormattedDate}
              </p>
            </div>

            {/* ── Config Snapshot ── */}
            <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1 pt-2 border-t border-border/50">
              {data.configSnapshot.lifecycle.setup.languages.length > 0 && (
                <div className="flex items-center gap-1">
                  <CodeIcon className="size-3 text-muted-foreground shrink-0" />
                  {data.configSnapshot.lifecycle.setup.languages.map(
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

              {data.configSnapshot.lifecycle.build.steps.length > 0 && (
                <p className="text-xs text-primary/70 flex items-center gap-0.5">
                  <HammerIcon className="size-3 shrink-0" />
                  {t('page.applicationDetail.releases.stepCount', {
                    count: data.configSnapshot.lifecycle.build.steps.length,
                  })}
                </p>
              )}

              <p className="text-xs text-primary/70 flex items-center gap-0.5">
                <GlobeIcon className="size-3 shrink-0" />:
                {data.configSnapshot.lifecycle.run.port}
              </p>

              {data.configSnapshot.lifecycle.run.command && (
                <p className="text-xs text-primary/70 flex items-center gap-0.5 font-mono max-w-[180px] truncate">
                  <TerminalIcon className="size-3 shrink-0" />
                  {data.configSnapshot.lifecycle.run.command}
                </p>
              )}
            </div>
          </div>

          {elCta.length > 0 && (
            <div className="flex flex-col gap-2 md:w-[100px]">
              {elCta.map((el, index) => (
                <Fragment key={index}>{el}</Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </Partials.CardWrapper>
  );
}

ArtifactCard.ShimmerPlaceholder = function ShimmerPlaceholder() {
  return (
    <Partials.CardWrapper>
      <div className="flex items-center pl-1 gap-x-1">
        <Shimmer className="mx-1 my-1.5 h-4 w-7" />
        <Shimmer className="mx-1 my-1.5 h-4 w-16" />
        <Shimmer className="mx-1 my-1.5 h-4 w-11" />
      </div>

      <div className="bg-card rounded-[7px] p-3 pt-2 flex flex-col">
        <Shimmer className="my-1 h-5 w-[30%]" />
        <Shimmer className="my-0.5 h-4 w-[60%]" />

        <div className="mt-2 flex items-center flex-wrap gap-x-4 gap-y-1">
          <Shimmer className="h-4 w-24 shrink-0" />
          <Shimmer className="h-4 w-28 shrink-0" />
          <Shimmer className="h-4 w-26 shrink-0" />
        </div>
      </div>
    </Partials.CardWrapper>
  );
};
