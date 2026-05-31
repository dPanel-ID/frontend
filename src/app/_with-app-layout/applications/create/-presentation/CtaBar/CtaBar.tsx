import { ArrowLeftIcon, ArrowRightIcon, Loader2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';

interface CtaBarProps {
  isPreviousHidden?: boolean;
  isPreviousDisabled?: boolean;
  isNextDisabled?: boolean;
  isNextLoading?: boolean;
  goToPrevious?: () => unknown | Promise<unknown>;
  goToNext?: () => unknown | Promise<unknown>;

  labelPrevious?: string;
  labelNext?: string;
  placement?: 'top' | 'bottom';
}

export default function CtaBar(props: CtaBarProps) {
  const t = useDevetekTranslations();

  const {
    isPreviousHidden,
    isPreviousDisabled,
    isNextDisabled,
    isNextLoading,
    goToPrevious,
    goToNext,
    labelPrevious = t('common.actions.back'),
    labelNext = t('page.applicationsCreate.actions.continue'),
    placement = 'bottom',
  } = props;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        placement === 'top' ? 'mb-5 border-b pb-4' : 'mt-5 border-t pt-4',
      )}
    >
      {!isPreviousHidden ? (
        <Button
          variant="outline"
          disabled={isPreviousDisabled}
          onClick={() => {
            void goToPrevious?.();
          }}
        >
          <ArrowLeftIcon className="size-4" />
          {labelPrevious}
        </Button>
      ) : (
        <div />
      )}

      <Button
        aria-busy={isNextLoading}
        disabled={isNextDisabled || isNextLoading}
        onClick={() => {
          void goToNext?.();
        }}
      >
        {isNextLoading ? <Loader2Icon className="size-4 animate-spin" /> : null}
        {labelNext}
        {!isNextLoading ? <ArrowRightIcon className="size-4" /> : null}
      </Button>
    </div>
  );
}
