import { useRouter } from '@tanstack/react-router';
import { GlobeIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';
import { setLocale } from '@/services/i18n/usecase';

import { cn } from '@/shared/libs/tailwind/cn';

/**
 * The documentation is written in both languages, and these pages sit outside
 * the app shell that normally carries the language control, so they bring
 * their own.
 */
export function DocsLanguageToggle(props: { className?: string }) {
  const locale = useDevetekLocale();
  const router = useRouter();
  const t = useDevetekTranslations('page.docs');
  const nextLocale = locale === 'en' ? 'id' : 'en';

  const handleClick = () => {
    setLocale(nextLocale);
    router.invalidate();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t('switchLanguage')}
      title={t('switchLanguage')}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border bg-card px-3 py-2 text-xs font-semibold text-primary/80',
        'transition-colors hover:border-sky-400/40 hover:text-primary',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        props.className,
      )}
    >
      <GlobeIcon className="size-4" aria-hidden />
      {nextLocale.toUpperCase()}
    </button>
  );
}
