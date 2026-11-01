import { FileTextIcon, NetworkIcon, PlusIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { useEmit } from '../../-models/events';

/** Page opening in the same visual language as the servers module. */
export default function Header() {
  const t = useDevetekTranslations();
  const emit = useEmit();

  return (
    <FlowHero
      accent="sky"
      icon={NetworkIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('sidebar.backend') },
          ]}
        />
      }
      title={t('page.loadBalancers.headerTitle')}
      description={t('page.loadBalancers.headerDesc')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button variant="outline" size="sm" asChild>
            <a
              href={LINK__DOCUMENTATION}
              aria-label={t('page.loadBalancers.docs')}
              title={t('page.loadBalancers.docs')}
              target="_blank"
              rel="noreferrer"
            >
              <FileTextIcon />
              <span className="hidden sm:inline">
                {t('page.loadBalancers.docs')}
              </span>
            </a>
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
            onClick={() => emit('@load-balancers/open--create', null)}
          >
            <PlusIcon className="size-4" />
            {t('page.loadBalancers.createLoadBalancer')}
          </button>
        </div>
      }
    />
  );
}
