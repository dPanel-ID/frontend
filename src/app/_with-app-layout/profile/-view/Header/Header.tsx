import { PencilIcon, User2Icon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

interface HeaderProps {
  onEditProfile: () => void;
}

/** Page opening in the same visual language as the servers module. */
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
    <FlowHero
      accent="sky"
      icon={User2Icon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('page.dashboard.headerTitle'), url: '/dashboard' },
            { text: t('page.profile.breadcrumb'), url: '/profile' },
          ]}
        />
      }
      title={t('page.profile.headerTitle', { name: displayName })}
      description={t('page.profile.headerDesc')}
      aside={
        <button
          type="button"
          className={flowCtaClassName('sky')}
          onClick={onEditProfile}
        >
          <PencilIcon className="size-4" />
          {t('page.profile.editProfile')}
        </button>
      }
    />
  );
}
