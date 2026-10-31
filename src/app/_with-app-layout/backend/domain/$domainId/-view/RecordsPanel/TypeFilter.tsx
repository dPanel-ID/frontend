import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import { DNS_RECORD_TYPES } from '../../-lib/records';

interface TypeFilterProps {
  value?: string;
  onChange: (type?: string) => void;
}

/** One chip per common record type; picking the current one clears it. */
export function TypeFilter(props: TypeFilterProps) {
  const { onChange, value } = props;
  const t = useDevetekTranslations('page.domainDetail.records');

  const options: Array<{ label: string; type?: string }> = [
    { label: t('allTypes') },
    ...DNS_RECORD_TYPES.map((type) => ({ label: type, type })),
  ];

  return (
    <div
      role="group"
      aria-label={t('typeFilter')}
      className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-0.5"
    >
      {options.map((option) => {
        const isActive = option.type === value;

        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={isActive}
            onClick={() =>
              onChange(isActive && option.type ? undefined : option.type)
            }
            className={cn(
              'h-8 shrink-0 rounded-lg border px-2.5 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
              isActive
                ? 'border-sky-500/40 bg-sky-500/10 text-sky-700 dark:text-sky-200'
                : 'bg-background/50 text-primary/70 hover:bg-border/40 hover:text-primary',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
