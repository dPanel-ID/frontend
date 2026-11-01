import { GlobeIcon, RouteIcon, ServerIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

/**
 * "Load balancer" sounds like a traffic-splitting appliance, and most people
 * here want the simpler thing it also is: the front door that terminates
 * HTTPS and forwards a path to an application. Shown to people who have none
 * yet; once they do, the list is the page.
 */
export function GuideSteps() {
  const t = useDevetekTranslations();

  return (
    <ol className="grid gap-2 text-left sm:grid-cols-3">
      <Step
        number={1}
        icon={ServerIcon}
        title={t('page.loadBalancers.guide.steps.gateway.title')}
        description={t('page.loadBalancers.guide.steps.gateway.description')}
      />
      <Step
        number={2}
        icon={GlobeIcon}
        title={t('page.loadBalancers.guide.steps.domain.title')}
        description={t('page.loadBalancers.guide.steps.domain.description')}
      />
      <Step
        number={3}
        icon={RouteIcon}
        title={t('page.loadBalancers.guide.steps.routes.title')}
        description={t('page.loadBalancers.guide.steps.routes.description')}
      />
    </ol>
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
