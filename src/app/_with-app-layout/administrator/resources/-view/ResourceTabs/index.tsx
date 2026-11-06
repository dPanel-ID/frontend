import {
  AppWindowIcon,
  GlobeIcon,
  KeyRoundIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { AdminResourceType } from '@/shared/api/admin.resource.find';
import { cn } from '@/shared/libs/tailwind/cn';
import { SearchInput } from '@/shared/presentation/atoms/SearchInput';

import { RESOURCE_TYPES } from '../../-lib/resource-types';
import { useAdminResourcesDataModel } from '../../-model/resources-data';

const ICONS: Record<AdminResourceType, LucideIcon> = {
  servers: ServerIcon,
  applications: AppWindowIcon,
  load_balancers: NetworkIcon,
  domains: GlobeIcon,
  ssh_keys: KeyRoundIcon,
};

/** One tab per resource type, with how many exist, and the search box. */
export default function ResourceTabs() {
  const t = useDevetekTranslations('page.adminResources');
  const [type, counts, searchInput, changeType, changeSearch] =
    useAdminResourcesDataModel((s) => {
      const { resources } = s;
      const data =
        resources.$status === 'success'
          ? resources
          : resources.$status === 'loading'
            ? resources.prevData
            : undefined;
      return [
        s.type,
        data?.counts,
        s.searchInput,
        s.changeType,
        s.changeSearch,
      ];
    });

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div
        role="tablist"
        aria-label={t('tabsLabel')}
        className="flex min-w-0 gap-1 overflow-x-auto rounded-xl border bg-card p-1"
      >
        {RESOURCE_TYPES.map((value) => {
          const Icon = ICONS[value];
          const active = value === type;
          const count = counts?.[value];
          return (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => changeType(value)}
              className={cn(
                'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground',
                active &&
                  'bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/30 dark:text-sky-200',
              )}
            >
              <Icon className="size-4" aria-hidden />
              {t(`tabs.${value}`)}
              {count != null && (
                <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <SearchInput
        classNameWrapper="w-full lg:max-w-xs"
        placeholder={t('searchPlaceholder')}
        value={searchInput}
        maxLength={100}
        onChange={changeSearch}
      />
    </div>
  );
}
