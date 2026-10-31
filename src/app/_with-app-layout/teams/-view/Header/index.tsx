import { PlusIcon, UsersIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { useEmit } from '../../-model/events';

/** Page opening in the same visual language as the resource pages. */
export default function Header() {
  const emit = useEmit();
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="violet"
      icon={UsersIcon}
      headnote={
        <Breadcrumb
          items={[{ text: t('sidebar.dashboard'), url: '/dashboard' }]}
        />
      }
      title={t('page.teams.headerTitle')}
      description={t('page.teams.hero.description')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <button
            type="button"
            className={flowCtaClassName('violet')}
            onClick={() => emit('@teams/add-new', undefined)}
          >
            <PlusIcon className="size-4" />
            {t('page.teams.addTeam')}
          </button>
        </div>
      }
    />
  );
}
