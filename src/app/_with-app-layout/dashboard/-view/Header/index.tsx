import { FileTextIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

export default function Header() {
  const t = useDevetekTranslations();
  const { userProfile } = useAuthLoggedIn();

  const displayName = userProfile.fullname || userProfile.username || 'there';

  return (
    <PageHeader
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
      rightAppend={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.dashboard.docs')}
            href={LINK__DOCUMENTATION}
          />
        </div>
      }
      description={
        <span>
          {t('page.dashboard.headerWelcome')}{' '}
          <span className="text-primary font-semibold">{displayName}</span>!
          {` ${t('page.dashboard.headerOverview')}`}
        </span>
      }
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
