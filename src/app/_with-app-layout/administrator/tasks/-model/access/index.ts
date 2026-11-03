import { useAuthModel } from '@/services/auth/model';

import { isDpanelAdmin } from '@/entities/user/lib/admin-role';

export type AdminAccess = 'checking' | 'allowed' | 'denied';

/**
 * Whether the signed-in account may open this page, from the profile the app
 * shell already loads. Fails closed: a profile that cannot be read denies.
 */
export function useAdminAccess(): AdminAccess {
  const { resUserProfile } = useAuthModel();

  if (resUserProfile.$status === 'success') {
    return isDpanelAdmin(resUserProfile.casdoor?.roles) ? 'allowed' : 'denied';
  }

  if (resUserProfile.$status === 'loading' && resUserProfile.prevData) {
    return isDpanelAdmin(resUserProfile.prevData.casdoor?.roles)
      ? 'allowed'
      : 'denied';
  }

  if (resUserProfile.$status === 'failed') return 'denied';

  return 'checking';
}
