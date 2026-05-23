import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiUser } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import type { LoginTraditional } from '../-rules/login';

export default function useLoginUsecase() {
  const t = useDevetekTranslations();

  const [pushToast] = useToaster();

  const navigate = useNavigate({
    from: '/',
  });

  const handleLoginWithGoogle = useHandler(() => {
    const backendEndpoint = import.meta.env.VITE_BACKEND ?? '';

    const redirectUrl =
      window.location.href.at(-1) === '/'
        ? window.location.href
        : `${window.location.href}/`;

    const constructedUrl = `${backendEndpoint}/v1/auth/google?state=${encodeURI(`${redirectUrl}dashboard`)}`;

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
        message: response.error.message,
      });

      throw response.error;
    },
  );

  return {
    handleLoginWithGoogle,
    handleLoginTraditional,
  };
}
