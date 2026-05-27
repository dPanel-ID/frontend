import { useNavigate } from '@tanstack/react-router';
import { FileTextIcon, PlusCircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

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
        ]}
      />
    </span>
  );
};

export default function Header() {
  const t = useDevetekTranslations();

  const navigate = useNavigate();

  const handleClickAddMore = () => {
    navigate({
      to: '/applications/create',
    });
  };

  return (
    <PageHeader
      headnote={<Headnote />}
      title={t('page.applications.headerTitle')}
      rightAppend={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.applications.docs')}
            href={LINK__DOCUMENTATION}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleClickAddMore}
            aria-label={t('page.applications.createApplication')}
          >
            <PlusCircleIcon /> {t('page.applications.createApplication')}
          </Button>
        </div>
      }
      description={t('page.applications.headerDesc')}
      footnote={t.rich('page.applications.headerFootnote', {
        a: (chunks) => (
          <a className="underline" href="//www.youtube.com/@dpanel_id">
            {chunks}
          </a>
        ),
        i: (chunks) => <span className="italic">{chunks}</span>,
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
    <Button variant="outline" size="sm" asChild>
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
