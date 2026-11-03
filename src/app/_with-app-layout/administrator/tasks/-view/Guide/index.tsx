import { ListChecksIcon, RotateCcwIcon, Trash2Icon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

/**
 * What the list holds and what the two actions do, in three short steps, so
 * an administrator knows the consequence before opening a confirm dialog.
 */
export default function Guide() {
  const t = useDevetekTranslations('page.adminTasks.guide');

  return (
    <section className="rounded-2xl border bg-card p-5">
      <h2 className="text-base font-bold">{t('title')}</h2>
      <ol className="mt-3 grid gap-2 md:grid-cols-3">
        <Step
          number={1}
          icon={ListChecksIcon}
          title={t('list.title')}
          description={t('list.description')}
        />
        <Step
          number={2}
          icon={RotateCcwIcon}
          title={t('reclaim.title')}
          description={t('reclaim.description')}
        />
        <Step
          number={3}
          icon={Trash2Icon}
          title={t('delete.title')}
          description={t('delete.description')}
        />
      </ol>
    </section>
  );
}

interface StepProps {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

function Step(props: StepProps) {
  const { description, icon: Icon, number, title } = props;

  return (
    <li className="flex min-w-0 gap-3 rounded-xl border bg-background/60 p-3">
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg border text-xs font-bold',
          FLOW_ACCENTS.sky.icon,
        )}
        aria-hidden
      >
        {number}
      </span>
      <div className="min-w-0">
        <p className="flex items-start gap-1.5 text-sm font-semibold">
          <Icon
            className="mt-0.5 size-3.5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <span>{title}</span>
        </p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </li>
  );
}
