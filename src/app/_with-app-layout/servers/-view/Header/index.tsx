import { Link } from '@tanstack/react-router';
import {
  FileTextIcon,
  FolderTreeIcon,
  PlusIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

/** Page opening in the same visual language as the create flows. */
export default function Header() {
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={ServerIcon}
      headnote={
        <Breadcrumb
          items={[
            {
              text: t('sidebar.dashboard'),
              url: '/dashboard',
            },
          ]}
        />
      }
      title={t('page.servers.headerTitle')}
      description={t('page.servers.hero.description')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to="/servers/groups">
              <FolderTreeIcon />
              <span className="hidden sm:inline">
                {t('page.servers.hero.groups')}
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.servers.docs')}
              title={t('page.servers.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">{t('page.servers.docs')}</span>
            </a>
          </Button>
          <Link to="/servers/create" className={flowCtaClassName('sky')}>
            <PlusIcon className="size-4" />
            {t('page.servers.createServer')}
          </Link>
        </div>
      }
    />
  );
}
