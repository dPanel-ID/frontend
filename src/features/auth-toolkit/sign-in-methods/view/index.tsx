import { RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import Shimmer from '@/shared/presentation/atoms/Shimmer';

import { SIGN_IN_PROVIDERS } from '../rules/sign-in-methods';
import useSignInMethods from '../usecase/use-sign-in-methods';

import SignInMethodRow from './-presentation/SignInMethodRow';

/**
 * The account's sign-in methods (password, Google, GitHub) with Link and
 * Unlink. Separate from the GitHub repository access, which is its own flow.
 */
export default function SignInMethodsList() {
  const t = useDevetekTranslations();
  const { link, methods, providerName, refetch, status, unlink } =
    useSignInMethods();

  if (status === 'failed') {
    return (
      <div
        role="alert"
        className="flex flex-col items-start gap-3 rounded-md border border-dashed bg-background p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="text-sm text-muted-foreground">
          {t('page.profile.signInMethods.loadFailed')}
        </p>
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => refetch()}
        >
          <RefreshCwIcon />
          {t('common.actions.retry')}
        </Button>
      </div>
    );
  }

  if (status !== 'success') {
    return (
      <ul className="grid gap-3" aria-busy="true">
        {SIGN_IN_PROVIDERS.map((provider) => (
          <li
            key={provider}
            className="flex items-center gap-3 rounded-md border bg-background p-3"
          >
            <Shimmer className="size-8 shrink-0 rounded-md" />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <Shimmer className="h-4 w-28" />
              <Shimmer className="h-3 w-48 max-w-full" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="grid gap-3">
      {methods.map((method) => (
        <SignInMethodRow
          key={method.provider}
          method={method}
          providerName={providerName(method.provider)}
          onLink={() => link(method.provider)}
          onUnlink={() => unlink(method.provider)}
        />
      ))}
    </ul>
  );
}
