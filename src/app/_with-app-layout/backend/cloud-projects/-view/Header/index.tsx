import { Link } from '@tanstack/react-router';
import { CloudIcon, FileTextIcon, PlusIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { useEmit } from '../../-model/events';

/** Page opening in the same visual language as the servers module. */
export default function Header() {
  const emit = useEmit();
  const t = useDevetekTranslations();

  return (
    <FlowHero
      accent="sky"
      icon={CloudIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('sidebar.backend') },
          ]}
        />
      }
      title={t('page.cloudProjects.headerTitle')}
      description={t('page.cloudProjects.headerDesc')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="outline" size="sm" asChild>
            <Link to="/servers">
              <ServerIcon />
              <span className="hidden sm:inline">
                {t('page.cloudProjects.servers')}
              </span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.cloudProjects.docs')}
              title={t('page.cloudProjects.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">
                {t('page.cloudProjects.docs')}
              </span>
            </a>
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
            onClick={() => emit('@cloud-projects/add-new', undefined)}
          >
            <PlusIcon className="size-4" />
            {t('page.cloudProjects.connectAccount')}
          </button>
        </div>
      }
    />
  );
}
