import { PencilIcon, User2Icon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

interface HeaderProps {
  onEditProfile: () => void;
}

const Headnote = () => {
  const t = useDevetekTranslations();

  return (
    <Breadcrumb
      items={[
        { text: t('page.dashboard.headerTitle'), url: '/dashboard' },
        { text: t('page.profile.breadcrumb'), url: '/profile' },
      ]}
    />
  );
};

export default function Header(props: HeaderProps) {
  const { onEditProfile } = props;
  const { userProfile } = useAuthLoggedIn();
  const t = useDevetekTranslations();
  const displayName = userProfile.fullname || userProfile.username;

  useMetaTags(
    { title: `${t('page.profile.metaTitle', { name: displayName })} | dPanel` },
    [displayName],
  );

  return (
    <PageHeader
      heroIcon={User2Icon}
      headnote={<Headnote />}
      title={t('page.profile.headerTitle', { name: displayName })}
      description={t('page.profile.headerDesc')}
      rightAppend={
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          onClick={onEditProfile}
          aria-label={t('page.profile.editProfile')}
          title={t('page.profile.editProfile')}
        >
          <PencilIcon />
          <span className="hidden sm:inline">
            {t('page.profile.editProfile')}
          </span>
        </Button>
      }
    />
  );
}
