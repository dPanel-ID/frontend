import { GithubIcon, HelpCircleIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import type { WorkerKind } from '../../rules/types';

const KIND_STYLES: Record<WorkerKind, string> = {
  vm: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  github:
    'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  unknown: 'border-border bg-background/60 text-muted-foreground',
};

const KIND_ICONS = {
  vm: ServerIcon,
  github: GithubIcon,
  unknown: HelpCircleIcon,
} as const;

/** "VM" or "GitHub workflow", so a glance tells how the worker runs. */
export default function WorkerTypeBadge(props: { kind: WorkerKind }) {
  const { kind } = props;
  const t = useDevetekTranslations('widget.workers.types');
  const Icon = KIND_ICONS[kind];

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold',
        KIND_STYLES[kind],
      )}
    >
      <Icon className="size-3" aria-hidden />
      {t(kind)}
    </span>
  );
}
