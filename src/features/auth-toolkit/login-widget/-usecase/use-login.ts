import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiAuth, ApiUser } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import { readReturnUrl } from '../-lib/return-url';
import type { LoginTraditional } from '../-rules/login';
import { useAuthErrorMessage } from '../../-usecase/use-auth-error-message';

/**
 * Where the browser goes after a Google or GitHub sign-in. Another dPanel
 * service (such as db-manager) may have sent the user here to sign in; the
 * backend checks the state again before redirecting.
 */
function signInReturnUrl() {
  return (
    readReturnUrl() ?? new URL('/dashboard', window.location.origin).toString()
  );
}

export default function useLoginUsecase() {
  const t = useDevetekTranslations();
  const localizedAuthError = useAuthErrorMessage();

  const [pushToast] = useToaster();

  const navigate = useNavigate({
    from: '/',
  });

  const handleLoginWithGoogle = useHandler(() => {
    const backendEndpoint = import.meta.env.VITE_BACKEND ?? '';
    const returnUrl = signInReturnUrl();

    const constructedUrl = `${backendEndpoint}/v1/auth/google?state=${encodeURIComponent(returnUrl)}`;

    window.open(constructedUrl, '_self', 'noreferer');

    return Promise.resolve('infinite' as const);
  });

  const handleLoginWithGithub = useHandler(() => {
    window.open(
      ApiAuth.GithubLogin.buildSignInUrl(signInReturnUrl()),
      '_self',
      'noreferer',
    );

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
        message: localizedAuthError(response.error),
      });

      throw response.error;
    },
  );

  return {
    handleLoginWithGoogle,
    handleLoginWithGithub,
    handleLoginTraditional,
  };
}
