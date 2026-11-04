import { FileTextIcon, LayoutDashboardIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

/**
 * Page opening in the same visual language as the rest of the product: the
 * accent glow, icon tile and action row the servers and create pages use.
 */
export default function Header() {
  const t = useDevetekTranslations();
  const { userProfile } = useAuthLoggedIn();

  const displayName = userProfile.fullname || userProfile.username || '';

  return (
    <FlowHero
      accent="sky"
      icon={LayoutDashboardIcon}
      headnote={
        <Breadcrumb
          items={[
            {
              text: t('page.dashboard.homeBreadcrumb'),
              url: '/',
            },
          ]}
        />
      }
      title={t('page.dashboard.headerTitle')}
      description={
        displayName
          ? t('page.dashboard.hero.descriptionNamed', { name: displayName })
          : t('page.dashboard.hero.description')
      }
      aside={
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.dashboard.docs')}
              title={t('page.dashboard.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">
                {t('page.dashboard.docs')}
              </span>
            </a>
          </Button>
        </div>
      }
    />
  );
}
