import { Link } from '@tanstack/react-router';
import { FileTextIcon, GlobeIcon, PlusIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

/** Page opening in the same visual language as the servers module. */
export default function Header() {
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={GlobeIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('sidebar.backend') },
          ]}
        />
      }
      title={t('page.domain.headerTitle')}
      description={t('page.domain.headerDesc')}
      aside={
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to="/servers">
              <ServerIcon />
              <span className="hidden sm:inline">
                {t('page.domain.servers')}
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.domain.docs')}
              title={t('page.domain.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">{t('page.domain.docs')}</span>
            </a>
          </Button>
          <Link to="/backend/domain/create" className={flowCtaClassName('sky')}>
            <PlusIcon className="size-4" />
            {t('page.domain.createDomain')}
          </Link>
        </div>
      }
    />
  );
}
