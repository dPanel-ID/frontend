import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  CheckIcon,
  InfoIcon,
  KeyRoundIcon,
  PlugZapIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';
import type { FlowAccent } from '@/shared/presentation/organisms/FlowHero';

type Method = 'agent' | 'ssh';

const METHODS: Array<{
  key: Method;
  icon: LucideIcon;
  accent: FlowAccent;
  points: string[];
}> = [
  {
    key: 'agent',
    icon: PlugZapIcon,
    accent: 'violet',
    points: ['runsOn', 'noInbound', 'noKey'],
  },
  {
    key: 'ssh',
    icon: KeyRoundIcon,
    accent: 'sky',
    points: ['workers', 'trust', 'publicIP'],
  },
];

/**
 * "dPanel agent or SSH?": where the work runs and what access the user gives
 * dPanel, side by side, so the choice between the two is an informed one.
 */
export default function JoinMethodComparison() {
  const t = useDevetekTranslations('page.servers.create.chooser.compare');

  return (
    <section
      aria-labelledby="join-method-comparison"
      className="rounded-2xl border bg-card/60 p-5"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h2 id="join-method-comparison" className="text-base font-bold">
            {t('title')}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <Link
          to="/docs/$section/$page"
          params={{ section: 'servers', page: 'register-a-private-machine' }}
          hash={t('docsAnchor')}
          className="group/cta inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-sky-600 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 dark:text-sky-300"
        >
          {t('learnMore')}
          <ArrowRightIcon className="size-4 transition-transform group-hover/cta:translate-x-0.5" />
        </Link>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {METHODS.map(({ accent, icon: Icon, key, points }) => {
          const tone = FLOW_ACCENTS[accent];
          return (
            <div key={key} className="rounded-xl border bg-background/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg border',
                      tone.icon,
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="truncate text-sm font-bold">
                    {t(`${key}.title`)}
                  </span>
                </span>
                <span
                  className={cn(
                    'shrink-0 rounded-full border px-2 py-0.5 text-[0.65rem] font-semibold',
                    tone.badge,
                  )}
                >
                  {t(`${key}.badge`)}
                </span>
              </div>
              <ul className="mt-3 flex flex-col gap-2">
                {points.map((point) => {
                  const caution = key === 'ssh' && point !== 'workers';
                  const PointIcon = caution ? InfoIcon : CheckIcon;
                  return (
                    <li
                      key={point}
                      className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground"
                    >
                      <PointIcon
                        className={cn(
                          'mt-1 size-3.5 shrink-0',
                          caution
                            ? 'text-amber-600 dark:text-amber-300'
                            : tone.text,
                        )}
                      />
                      {t(`${key}.points.${point}`)}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
