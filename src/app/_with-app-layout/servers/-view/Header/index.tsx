import { useNavigate } from '@tanstack/react-router';
import { FileTextIcon, PlusCircleIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

export default function Header() {
  const t = useDevetekTranslations();

  const navigate = useNavigate();

  const handleClickAddMore = () => {
    navigate({
      to: '/servers/create',
    });
  };

  return (
    <PageHeader
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
      rightAppend={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.servers.docs')}
            href={LINK__DOCUMENTATION}
          />
          <Button variant="outline" size="sm" onClick={handleClickAddMore}>
            <PlusCircleIcon /> {t('page.servers.createServer')}
          </Button>
        </div>
      }
      description={t('page.servers.headerDesc')}
      footnote={t.rich('page.servers.headerFootnote', {
        code: (chunks) => <code>{chunks}</code>,
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
