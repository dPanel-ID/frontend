import { BoxesIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';

/** Page opening, matching the executor tasks page. */
export default function Header() {
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={BoxesIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            {
              text: t('page.adminResources.breadcrumbProfile'),
              url: '/profile',
            },
            { text: t('page.adminResources.breadcrumbAdmin') },
          ]}
        />
      }
      badge={t('page.adminResources.badge')}
      title={t('page.adminResources.headerTitle')}
      description={t('page.adminResources.headerDesc')}
    />
  );
}
