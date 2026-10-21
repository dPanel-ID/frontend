import { useState } from 'react';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import type { SSHCreateModalProps as Props } from './types';

export const [SSHCreateProvider, useSSHCreateContext] = buildContext(
  'SSHKeyCreateModal',
  (props: Props) => {
    const [displayName, setDisplayName] = useState('');

    // Ed25519 unless someone picks the compatibility option, which is the
    // only case where a size has to be chosen.
    const [algorithm, setAlgorithm] = useState('ed25519');

    const [keyLength, setKeyLength] = useState<number>(4096);

    const [isMutating, setIsMutating] = useState(false);

    return {
      props,
      displayName,
      setDisplayName,
      algorithm,
      setAlgorithm,
      keyLength,
      setKeyLength,
      isMutating,
      setIsMutating,
    };
  },
);
