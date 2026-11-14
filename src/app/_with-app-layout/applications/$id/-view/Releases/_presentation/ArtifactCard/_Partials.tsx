import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Tooltip } from '@/shared/presentation/atoms/Tooltip';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { isMovingStatus, releaseTone } from '../../../../-lib/describe-detail';
import type { ReleaseStatus } from '../../../../-lib/describe-detail';

import type { CardWrapperProps, HeadingItemWrapperProps } from './types';

const CardWrapper = (props: CardWrapperProps) => {
  const { children, releaseStatus } = props;

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-all',
        'hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        {
          'border-emerald-500/40': releaseStatus === 'deployed',
          'border-red-500/40': releaseStatus === 'failed',
          'border-sky-400/40':
            releaseStatus === 'progress' || releaseStatus === 'removing',
          'border-amber-400/40': releaseStatus === 'cancelled',
        },
      )}
    >
      {children}
    </div>
  );
};

const HeadingItemWrapper = (props: HeadingItemWrapperProps) => {
  const { className, children, tooltipMessage } = props;

  const cnWrapper = cn(
    'text-xs font-semibold px-1 py-1.5 flex items-center shrink-0 gap-0.5 w-max overflow-hidden',
    className,
  );

  return (
    <Tooltip message={tooltipMessage} className={cnWrapper}>
      {children}
    </Tooltip>
  );
};

/**
 * The release state of one build. This used to be a hand-rolled badge that
 * never rendered, because the status it keys off was never passed down.
 */
const ReleaseStatusPill = (props: {
  releaseStatus?: ReleaseStatus;
  onClick?: () => void;
}) => {
  const { releaseStatus, onClick } = props;

  const t = useDevetekTranslations('page.applicationDetail.releaseStatus');

  if (!releaseStatus) return null;

  return (
    <StatusPill
      tone={releaseTone(releaseStatus)}
      label={t(releaseStatus)}
      pulse={isMovingStatus(releaseStatus)}
      size="sm"
      onClick={onClick}
    />
  );
};

export const ArtifactCardPartials = {
  CardWrapper,
  HeadingItemWrapper,
  ReleaseStatusPill,
};
