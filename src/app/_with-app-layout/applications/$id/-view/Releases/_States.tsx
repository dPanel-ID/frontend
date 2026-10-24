import { HammerIcon, RocketIcon, ServerIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { FailedState } from '@/widgets/failed-state';

import { ArtifactCard } from './_presentation';
import type { ArtifactsHistoryStateFailedProps as FailedProps } from './types';

interface PlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

function Placeholder(props: PlaceholderProps) {
  const { icon: Icon, title, description, action } = props;

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed px-6 py-10 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground">
        <Icon className="size-5" />
      </span>
      <p className="text-sm font-semibold">{title}</p>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        {description}
      </p>
      {action && (
        <Button size="sm" className="mt-1" onClick={action.onClick}>
          <RocketIcon className="size-4" />
          {action.label}
        </Button>
      )}
    </div>
  );
}

function Loading() {
  return (
    <>
      <ArtifactCard.ShimmerPlaceholder />
      <ArtifactCard.ShimmerPlaceholder />
      <ArtifactCard.ShimmerPlaceholder />
    </>
  );
}

function Failed(props: FailedProps) {
  const { error, onClickRetry } = props;

  return (
    <div className="relative">
      <div className="relative flex flex-col gap-2 opacity-50">
        <ArtifactCard.ShimmerPlaceholder />
        <ArtifactCard.ShimmerPlaceholder />
      </div>

      <div className="absolute left-1/2 top-1/2 -translate-1/2">
        <FailedState.WallCentered.Retryable
          withCard
          errorPayload={error.message}
          onClickRetry={onClickRetry}
        />
      </div>
    </div>
  );
}

function NotEligible() {
  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <Placeholder
      icon={HammerIcon}
      title={t('notEligibleTitle')}
      description={t('notEligibleDescription')}
    />
  );
}

function EmptyBuilds(props: { onClickNew: () => void }) {
  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <Placeholder
      icon={HammerIcon}
      title={t('emptyBuildsTitle')}
      description={t('emptyBuildsDescription')}
      action={{ label: t('newBuild'), onClick: props.onClickNew }}
    />
  );
}

function EmptyServers() {
  const t = useDevetekTranslations('page.applicationDetail.releases');

  return (
    <Placeholder
      icon={ServerIcon}
      title={t('emptyServersTitle')}
      description={t('emptyServersDescription')}
    />
  );
}

export const ReleasesStates = {
  Loading,
  Failed,
  NotEligible,
  EmptyBuilds,
  EmptyServers,
};
