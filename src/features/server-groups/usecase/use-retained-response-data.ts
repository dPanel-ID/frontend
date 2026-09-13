import { useEffect, useState } from 'react';

import type { Response } from '@/shared/libs/api-client/rules/types';

export function useRetainedResponseData<T>(response: Response<T>) {
  const [snapshot, setSnapshot] = useState<T | null>(null);

  useEffect(() => {
    if (response.$status === 'success') {
      setSnapshot(response as T);
    }
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
