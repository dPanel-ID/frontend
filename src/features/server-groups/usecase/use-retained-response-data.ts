import { startTransition, useEffect, useState } from 'react';

import type { Response } from '@/shared/libs/api-client/rules/types';

/**
 * Returns the latest successful payload of a response and keeps showing it
 * while a refetch is loading or after it fails, so a page can degrade instead
 * of blanking.
 */
export function useRetainedResponseData<T>(response: Response<T>) {
  const [snapshot, setSnapshot] = useState<T | null>(null);

  useEffect(() => {
    if (response.$status !== 'success') {
      return;
    }

    // The snapshot is read only once the response stops being a success, so
    // remembering it can be a non-urgent update instead of a cascading render.
    startTransition(() => {
      setSnapshot(response as T);
    });
  }, [response]);

  const data =
    response.$status === 'success'
      ? (response as T)
      : response.$status === 'loading'
        ? (response.prevData ?? snapshot)
        : snapshot;

  return {
    data,
    isDegraded: response.$status === 'failed' && snapshot != null,
  } as const;
}
