import { CloudIcon, LockKeyholeIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { ChoiceTile } from '@/shared/presentation/molecules/ChoiceTile';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';
import type { FlowAccent } from '@/shared/presentation/organisms/FlowHero';

import type { WorkersMode } from '../../rules/types';

interface ModeSelectorProps {
  mode: WorkersMode;
  accent: FlowAccent;
  /** False shows the mode without a way to change it. */
  canManage: boolean;
  /** Private needs at least one worker. */
  hasWorkers: boolean;
  /** The mode being applied, while the request runs. */
  pendingMode: WorkersMode | null;
  onSelect: (mode: WorkersMode) => void;
}

const MODE_ICONS = {
  shared: CloudIcon,
  private: LockKeyholeIcon,
} as const;

/** Shared workers (dPanel) or private workers, with what each one means. */
export default function ModeSelector(props: ModeSelectorProps) {
  const { accent, canManage, hasWorkers, mode, onSelect, pendingMode } = props;
  const t = useDevetekTranslations('widget.workers.mode');

  const modes: WorkersMode[] = ['shared', 'private'];
  const tone = FLOW_ACCENTS[accent];

  return (
    <div className="flex flex-col gap-3">
      <div
        role="radiogroup"
        aria-label={t('label')}
        className="grid gap-2 sm:grid-cols-2"
      >
        {modes.map((item) => {
          const Icon = MODE_ICONS[item];
          const selected = (pendingMode ?? mode) === item;
          const blocked = item === 'private' && !hasWorkers && mode !== item;

          return (
            <ChoiceTile
              key={item}
              accent={accent}
              selected={selected}
              disabled={
                !canManage || pendingMode != null || (blocked && !selected)
              }
              onSelect={() => {
                if (item !== mode) onSelect(item);
              }}
              leading={
                <span
                  className={cn(
                    'flex size-9 shrink-0 items-center justify-center rounded-lg border',
                    selected ? tone.icon : 'bg-background/60',
                  )}
                  aria-hidden
                >
                  <Icon className="size-4" />
                </span>
              }
              title={t(`${item}.title`)}
              subtitle={
                blocked ? t('private.needsWorker') : t(`${item}.subtitle`)
              }
              badge={mode === item ? t('current') : undefined}
            />
          );
        })}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('note')}
      </p>
    </div>
  );
}
