import { useNavigate } from '@tanstack/react-router';
import { FileTextIcon, PlusCircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
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
  const navigate = useNavigate();

  const handleClickAddNew = () => {
    navigate({ to: '/backend/domain/create' });
  };

  return (
    <PageHeader
      headnote={<Headnote />}
      title={t('page.domain.headerTitle')}
      rightAppend={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.domain.docs')}
            href={LINK__DOCUMENTATION}
          />
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('page.domain.createDomain')}
            onClick={handleClickAddNew}
          >
            <PlusCircleIcon /> {t('page.domain.createDomain')}
          </Button>
        </div>
      }
      description={t('page.domain.headerDesc')}
      footnote={t.rich('page.domain.headerFootnote', {
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
  const { href, icon: Icon, label } = props;
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
