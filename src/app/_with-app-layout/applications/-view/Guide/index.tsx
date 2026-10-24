import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  GithubIcon,
  PackageIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

/**
 * The thing people get wrong here: dNocs is not a host. It builds your
 * repository into an artifact and installs that on a server you already
 * own, which is why an application needs a server before it needs anything
 * else.
 */
export default function Guide() {
  const t = useDevetekTranslations();

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-bold">
              {t('page.applications.guide.title')}
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
              {t('page.applications.guide.description')}
            </p>
          </div>

          <Link
            to="/applications/create"
            className={cn(flowCtaClassName('sky'), 'shrink-0')}
          >
            <PackageIcon className="size-4" />
            {t('page.applications.guide.cta')}
            <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
          </Link>
        </div>

        <ol className="grid gap-2 sm:grid-cols-3">
          <Step
            number={1}
            icon={GithubIcon}
            title={t('page.applications.guide.steps.connect.title')}
            description={t('page.applications.guide.steps.connect.description')}
          />
          <Step
            number={2}
            icon={PackageIcon}
            title={t('page.applications.guide.steps.build.title')}
            description={t('page.applications.guide.steps.build.description')}
          />
          <Step
            number={3}
            icon={ServerIcon}
            title={t('page.applications.guide.steps.deploy.title')}
            description={t('page.applications.guide.steps.deploy.description')}
          />
        </ol>
      </div>
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
