import { FileTextIcon, PlusCircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { useEmit } from '../../-models/events';

const Headnote = () => {
  const t = useDevetekTranslations();

  return (
    <span className="flex items-center justify-between">
      <Breadcrumb
        items={[
          {
            text: t('sidebar.dashboard'),
            url: '/dashboard',
          },
          {
            text: t('sidebar.backend'),
          },
        ]}
      />
    </span>
  );
};

export default function Header() {
  const t = useDevetekTranslations();
  const emit = useEmit();

  return (
    <PageHeader
      headnote={<Headnote />}
      title={t('page.loadBalancers.headerTitle')}
      rightAppend={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.loadBalancers.docs')}
            href={LINK__DOCUMENTATION}
          />
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('page.loadBalancers.createLoadBalancer')}
            onClick={() => emit('@load-balancers/open--create', null)}
          >
            <PlusCircleIcon /> {t('page.loadBalancers.createLoadBalancer')}
          </Button>
        </div>
      }
      description={t('page.loadBalancers.headerDesc')}
      footnote={t.rich('page.loadBalancers.headerFootnote', {
        a: (chunks) => (
          <a className="underline" href="//www.youtube.com/@dpanel_id">
            {chunks}
          </a>
        ),
      })}
    />
  );
}

function HeaderHelpAction(props: {
  icon: LucideIcon;
  label: string;
  href: string;
}) {
  const { icon: Icon, label, href } = props;
  const isMail = href.startsWith('mailto:');

  return (
    <Button buttonStyle="outline" buttonColor="secondary" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target={isMail ? undefined : '_blank'}
        rel={isMail ? undefined : 'noreferrer'}
      >
        <Icon />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </Button>
  );
}
