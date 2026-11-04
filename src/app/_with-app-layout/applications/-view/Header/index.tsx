import { Link } from '@tanstack/react-router';
import {
  AppWindowIcon,
  FileTextIcon,
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

import GithubAccountButton from '../GithubAccountButton';

/** Page opening in the same visual language as the servers module. */
export default function Header() {
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={AppWindowIcon}
      headnote={
        <Breadcrumb
          items={[{ text: t('sidebar.dashboard'), url: '/dashboard' }]}
        />
      }
      title={t('page.applications.headerTitle')}
      description={t('page.applications.headerDesc')}
      aside={
        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <GithubAccountButton />
          <Button variant="outline" size="sm" asChild>
            <Link to="/servers">
              <ServerIcon />
              <span className="hidden sm:inline">
                {t('page.applications.servers')}
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.applications.docs')}
              title={t('page.applications.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">
                {t('page.applications.docs')}
              </span>
            </a>
          </Button>
          <Link to="/applications/create" className={flowCtaClassName('sky')}>
            <PlusIcon className="size-4" />
            {t('page.applications.createApplication')}
          </Link>
        </div>
      }
    />
  );
}
