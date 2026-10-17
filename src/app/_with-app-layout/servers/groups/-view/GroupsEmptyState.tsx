import { FolderTreeIcon, PlusIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

/** Explains why groups exist before asking for the first one. */
export function GroupsEmptyState(props: { onCreate: () => void }) {
  const t = useDevetekTranslations('page.serverGroups.empty');

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />
      <div className="relative flex flex-col items-center gap-4 px-6 py-10 text-center">
        <span
          className={cn(
            'flex size-14 items-center justify-center rounded-2xl border',
            FLOW_ACCENTS.sky.icon,
          )}
        >
          <FolderTreeIcon className="size-7" />
        </span>
        <div>
          <h3 className="text-xl font-bold">{t('title')}</h3>
          <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
            {t('message')}
          </p>
        </div>
        <button
          type="button"
          className={flowCtaClassName('sky')}
          onClick={props.onCreate}
        >
          <PlusIcon className="size-4" />
          {t('cta')}
        </button>
      </div>
    </div>
  );
}
