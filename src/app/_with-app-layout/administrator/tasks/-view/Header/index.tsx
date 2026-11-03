import { ListChecksIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';

/** Page opening in the same visual language as the servers module. */
export default function Header() {
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={ListChecksIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('page.adminTasks.breadcrumbProfile'), url: '/profile' },
            { text: t('page.adminTasks.breadcrumbAdmin') },
          ]}
        />
      }
      badge={t('page.adminTasks.badge')}
      title={t('page.adminTasks.headerTitle')}
      description={t('page.adminTasks.headerDesc')}
    />
  );
}
