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
  /** Shown under the buttons when the primary one is disabled. */
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
 * One row of actions for the whole flow, pinned to the bottom of the
 * viewport so it is in reach on a phone without scrolling to find it. The
 * old flow drew this twice per step, above and below the form.
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

  return (
    <div
      className={cn(
        'sticky bottom-0 z-20 -mx-4 border-t bg-card/95 px-4 py-3 backdrop-blur',
        'pb-[max(0.75rem,env(safe-area-inset-bottom))]',
        'sm:mx-0 sm:rounded-2xl sm:border sm:pb-3',
      )}
    >
      <div className="flex items-center gap-2">
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
          className={cn(flowCtaClassName('sky'), 'flex-1 justify-center')}
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

      {blockedHint && isNextDisabled && !isNextLoading && (
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          {blockedHint}
        </p>
      )}
    </div>
  );
}
