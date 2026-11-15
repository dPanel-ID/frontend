import { useEffect, useState } from 'react';

import { useRouter } from '@tanstack/react-router';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { takeAuthRedirectError } from '../../-lib/oauth-auth-error';

function readFromLocation() {
  if (typeof window === 'undefined') return null;
  return takeAuthRedirectError(window.location.href);
}

/**
 * Reads the `auth_error` the API put on the URL after a Google or GitHub
 * sign-in or link, once, and removes it from the address bar so a reload or
 * a shared link does not show it again.
 */
export default function useAuthRedirectError() {
  const router = useRouter();

  const [found] = useState(readFromLocation);
  const [dismissed, setDismissed] = useState(false);

  const cleanHref = found?.cleanHref;

  useEffect(() => {
    if (cleanHref == null) return;
    router.history.replace(cleanHref, router.history.location.state);
  }, [cleanHref, router]);

  const dismiss = useHandler(() => {
    setDismissed(true);
  });

  return {
    errorKey: dismissed ? undefined : found?.key,
    dismiss,
  };
}
