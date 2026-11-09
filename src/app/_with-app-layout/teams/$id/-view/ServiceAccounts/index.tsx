import { EyeIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ServiceAccountsPanel } from '@/features/service-accounts';

import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { useMembersDataModel } from '../../-model/members-data';

/**
 * This team's service accounts, for its owners and admins. Tokens are
 * credentials, so nobody else, and nobody whose access is not known yet, gets
 * the panel; the API refuses them too.
 */
export default function ServiceAccounts() {
  const t = useDevetekTranslations('widget.serviceAccounts');
  const { members, orgId } = useMembersDataModel();

  if (members.$status === 'loading') {
    return <Shimmer className="h-40 w-full rounded-2xl" />;
  }

  const myAccess = members.$status === 'success' ? members.myAccess : undefined;
  if (myAccess !== 'owner' && myAccess !== 'admin') {
    return (
      <p className="flex items-start gap-2 rounded-2xl border bg-card p-5 text-sm leading-relaxed text-muted-foreground">
        <EyeIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('readOnly')}
      </p>
    );
  }

  return <ServiceAccountsPanel workspaceId={orgId} />;
}
