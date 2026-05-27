import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';

import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

export default function Header() {
  const t = useDevetekTranslations();
  const { userProfile } = useAuthLoggedIn();

  const displayName = userProfile.fullname || userProfile.username || 'there';

  return (
    <PageHeader
      title={t('page.dashboard.headerTitle')}
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
