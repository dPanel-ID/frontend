import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';

interface CtaBarProps {
  isPreviousHidden?: boolean;
  isNextDisabled?: boolean;
  goToPrevious?: () => void;
  goToNext?: () => void;

  labelPrevious?: string;
  labelNext?: string;
  placement?: 'top' | 'bottom';
}

export default function CtaBar(props: CtaBarProps) {
  const t = useDevetekTranslations();

  const {
    isPreviousHidden,
    isNextDisabled,
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
        <Button variant="outline" onClick={goToPrevious}>
          <ArrowLeftIcon className="size-4" />
          {labelPrevious}
        </Button>
      ) : (
        <div />
      )}

      <Button disabled={isNextDisabled} onClick={goToNext}>
        {labelNext}
        <ArrowRightIcon className="size-4" />
      </Button>
    </div>
  );
}
