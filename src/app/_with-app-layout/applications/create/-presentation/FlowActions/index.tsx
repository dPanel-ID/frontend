import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Loader2Icon,
  RocketIcon,
} from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

interface FlowActionsProps {
  backLabel: string;
  nextLabel: string;
  /** Shown beside the buttons when the primary one is disabled. */
  blockedHint?: string;
  isBackHidden?: boolean;
  isBackDisabled?: boolean;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  /** Renders the rocket instead of the arrow, for the last step. */
  isSubmit?: boolean;
  onBack: () => void;
  onNext: () => void;
}

/**
 * The flow's actions, once per step rather than above and below the form.
 *
 * On a phone the row pins itself to the bottom of the viewport so Continue
 * stays in reach through a long form. From `sm` up it is an ordinary card
 * at the end of the page, with the buttons at their natural width on the
 * right — a full-bleed bar across a desktop reads as a phone layout.
 */
export default function FlowActions(props: FlowActionsProps) {
  const {
    backLabel,
    blockedHint,
    isBackDisabled,
    isBackHidden,
    isNextDisabled,
    isNextLoading,
    isSubmit,
    nextLabel,
    onBack,
    onNext,
  } = props;

  const showHint = Boolean(blockedHint) && isNextDisabled && !isNextLoading;

  return (
    <div
      className={cn(
        // Phone: pinned to the bottom edge, above the home indicator.
        'sticky bottom-0 z-20 -mx-4 border-t bg-card/95 px-4 py-3 backdrop-blur',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        // Desktop: an ordinary block in the page.
        'sm:static sm:mx-0 sm:rounded-2xl sm:border sm:px-5 sm:py-4 sm:pb-4 sm:backdrop-blur-none',
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {showHint ? (
          <p className="hidden max-w-xl text-xs leading-relaxed text-muted-foreground sm:block">
            {blockedHint}
          </p>
        ) : (
          <span className="hidden sm:block" />
        )}

        <div className="flex items-center gap-2 sm:shrink-0">
          {!isBackHidden && (
            <Button
              variant="outline"
              disabled={isBackDisabled}
              onClick={onBack}
              className="shrink-0"
            >
              <ArrowLeftIcon className="size-4" />
              <span className="hidden sm:inline">{backLabel}</span>
            </Button>
          )}

          <button
            type="button"
            className={cn(
              flowCtaClassName('sky'),
              'flex-1 justify-center sm:flex-none',
              (isNextDisabled || isNextLoading) &&
                'bg-muted text-muted-foreground hover:bg-muted',
            )}
            disabled={isNextDisabled || isNextLoading}
            aria-busy={isNextLoading}
            onClick={onNext}
          >
            {isNextLoading ? (
              <Loader2Icon className="size-4 animate-spin" />
            ) : isSubmit ? (
              <RocketIcon className="size-4" />
            ) : null}
            {nextLabel}
            {!isNextLoading && !isSubmit && (
              <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
            )}
          </button>
        </div>
      </div>

      {showHint && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:hidden">
          {blockedHint}
        </p>
      )}
    </div>
  );
}
