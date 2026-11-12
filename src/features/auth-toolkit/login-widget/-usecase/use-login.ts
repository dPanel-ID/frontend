import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiUser } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { readReturnUrl } from '../-lib/return-url';
import type { LoginTraditional } from '../-rules/login';

export default function useLoginUsecase() {
  const t = useDevetekTranslations();

  const [pushToast] = useToaster();

  const navigate = useNavigate({
    from: '/',
  });

  const handleLoginWithGoogle = useHandler(() => {
    const backendEndpoint = import.meta.env.VITE_BACKEND ?? '';

    // Another dPanel service (such as db-manager) may have sent the user here
    // to sign in; the backend checks the state again before redirecting.
    const returnUrl =
      readReturnUrl() ??
      new URL('/dashboard', window.location.origin).toString();

    const constructedUrl = `${backendEndpoint}/v1/auth/google?state=${encodeURIComponent(returnUrl)}`;

    window.open(constructedUrl, '_self', 'noreferer');

    return Promise.resolve('infinite' as const);
  });

  const handleLoginTraditional = useHandler(
    async (payload: LoginTraditional) => {
      const { username, password } = payload;

      const response = await ApiUser.Login.doPost({
        username,
        password,
      });

      if (response.$status === 'success') {
        const returnUrl = readReturnUrl();
        if (returnUrl) {
          window.location.assign(returnUrl);
          return;
        }
        await navigate({
          to: '/dashboard',
          reloadDocument: true,
        });
        return;
      }

      pushToast({
        variant: 'error',
        title: t('toaster.loginByEmail.error', {
          email: username,
        }),
        message: getApiErrorDetail(response.error),
      });

      throw response.error;
    },
  );

  return {
    handleLoginWithGoogle,
    handleLoginTraditional,
  };
}
