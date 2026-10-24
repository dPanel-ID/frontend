import { Link, useParams } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import { APPLICATION_DETAIL_TAB_ITEMS } from '../../-rules/tabs';
import type { ApplicationDetailTab } from '../../-rules/tabs';

interface TabNavProps {
  active: ApplicationDetailTab;
}

/** The page's sections as links, so a tab is a shareable URL. */
export default function TabNav(props: TabNavProps) {
  const { active } = props;

  const { id } = useParams({ from: '/_with-app-layout/applications/$id/' });
  const t = useDevetekTranslations('page.applicationDetail.tabs');

  return (
    <nav aria-label={t('ariaLabel')} className="overflow-x-auto">
      <div className="flex w-max min-w-full gap-1 rounded-xl border bg-card/60 p-1">
        {APPLICATION_DETAIL_TAB_ITEMS.map(({ id: tab, icon: Icon }) => {
          const isActive = tab === active;

          return (
            <Link
              key={tab}
              to="/applications/$id"
              params={{ id }}
              search={{ tab }}
              replace
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                isActive
                  ? 'bg-background text-primary shadow-sm ring-1 ring-sky-400/40'
                  : 'text-muted-foreground hover:bg-background/60 hover:text-primary',
              )}
            >
              <Icon
                className={cn(
                  'size-4',
                  isActive ? 'text-sky-600 dark:text-sky-300' : undefined,
                )}
              />
              {t(tab)}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
