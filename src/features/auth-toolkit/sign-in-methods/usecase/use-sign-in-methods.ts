import { useMemo } from 'react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiAuth } from '@/shared/api';
import useHandler from '@/shared/libs/react-hooks/useHandler';

import {
  classifyUnlinkFailure,
  toSignInMethodViews,
} from '../lib/sign-in-methods';
import type { SignInProvider } from '../rules/sign-in-methods';

/** Where the browser comes back after linking: the profile page. */
const RETURN_PATH = '/profile';

/**
 * Loads the account's sign-in methods and links or unlinks Google and
 * GitHub. Linking leaves the page (the API sends the browser to GitHub and
 * back to the profile); unlinking asks first.
 */
export default function useSignInMethods() {
  const t = useDevetekTranslations();
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();

  const [response, refetch] = ApiAuth.SignInMethods.useGet();

  // While a refetch runs, keep showing the last answer.
  const data =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;

  const methods = useMemo(
    () => (data ? toSignInMethodViews(data.methods) : []),
    [data],
  );

  const providerName = (provider: SignInProvider) =>
    t(`page.profile.signInMethods.${provider}`);

  const link = useHandler((provider: SignInProvider) => {
    if (provider !== 'github') return;
    const returnUrl = new URL(RETURN_PATH, window.location.origin).toString();
    window.location.assign(ApiAuth.GithubLogin.buildLinkUrl(returnUrl));
  });

  const unlink = useHandler((provider: SignInProvider) => {
    if (provider === 'password') return;
    const name = providerName(provider);

    openDialog({
      title: t('page.profile.signInMethods.unlinkDialog.title', {
        provider: name,
      }),
      content: t('page.profile.signInMethods.unlinkDialog.message', {
        provider: name,
      }),
      variant: 'warning',
      actions: {
        variant: 'YesNo',
        yes: async () => {
          const result = await ApiAuth.SignInMethods.$Provider.doDelete({
            provider,
          });

          if (result.$status === 'success') {
            openToaster({
              variant: 'success',
              message: t('page.profile.signInMethods.toaster.unlinkSuccess', {
                provider: name,
              }),
            });
            refetch();
            return;
          }

          const failure =
            result.kind === 'api'
              ? classifyUnlinkFailure(result.error)
              : 'other';
          openToaster({
            variant: 'error',
            message:
              failure === 'lastMethod'
                ? t('page.profile.signInMethods.toaster.unlinkLastMethod')
                : t('page.profile.signInMethods.toaster.unlinkError', {
                    provider: name,
                  }),
          });
          if (failure === 'lastMethod') refetch();
        },
      },
    });
  });

  return {
    status: data ? 'success' : response.$status,
    methods,
    providerName,
    refetch,
    link,
    unlink,
  };
}
