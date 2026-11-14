import { useDevetekTranslations } from '@/services/i18n';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';

import { publicAuthErrorKey } from '../-lib/public-auth-error';

/**
 * Turns a failed sign-in or sign-up response into the text for the toast:
 * a known API message in the reader's language, anything else as sent.
 */
export function useAuthErrorMessage() {
  const t = useDevetekTranslations('toaster.authPublic');

  return (error: unknown) => {
    const detail = getApiErrorDetail(error);
    const key = publicAuthErrorKey(detail);
    return key ? t(key) : detail;
  };
}
