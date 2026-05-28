import { CheckCircle2Icon, CircleDotIcon, ShieldCheckIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Card } from '@/shared/presentation/atoms/Card';

import {
  getApplicationFlowStepIndex,
  getApplicationFlowSteps,
} from '../../-model/progress-steps';
import { useFormStore } from '../../-model/store/form';

export default function AsideProgress() {
  const [flowMode, progress, setProgress] = useFormStore((s) => [
    s.flowMode,
    s.progress,
    s.setProgress,
  ]);
  const t = useDevetekTranslations('page.applicationsCreate.progress');
  const visibleSteps = getApplicationFlowSteps(flowMode);
  const currentIndex = Math.max(
    0,
    getApplicationFlowStepIndex(progress, flowMode),
  );
  const progressPercent =
    visibleSteps.length > 1
      ? (currentIndex / (visibleSteps.length - 1)) * 100
      : 100;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <div className="w-full lg:w-64">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
        {visibleSteps.map((step, index) => {
          const isActive = step.key === progress;
          const isDone = index < currentIndex;
          const isAccessible = index <= currentIndex;
          const StepIcon = isDone
            ? CheckCircle2Icon
            : isActive
              ? CircleDotIcon
              : ShieldCheckIcon;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!isAccessible}
              onClick={() => setProgress(step.key)}
              className={cn(
                'rounded-md border p-3 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent bg-transparent hover:border-border hover:bg-background',
                !isAccessible && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-7 items-center justify-center rounded-md border bg-card',
                    isActive &&
                      'border-primary bg-primary text-primary-foreground',
                    isDone && 'border-emerald-500/40 text-emerald-400',
                  )}
                >
                  <StepIcon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold uppercase text-muted-foreground">
                    {t('stepLabel', { step: index + 1 })}
                  </span>
                  <span className="block text-sm font-semibold">
                    {t(step.labelKey)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {t(step.descKey)}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
