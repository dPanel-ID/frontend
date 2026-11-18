import { useWatch } from 'react-hook-form';

import { resolveJoinMethod } from './join';
import type { JoinMethod } from './join';

import { useForm } from '.';

/**
 * How the new VM joins dPanel with the form as it stands, read the same way
 * the connect step reads it; undefined until a provider is picked.
 */
export function useJoinMethod(): JoinMethod | undefined {
  const { form } = useForm();
  const [provider, contract, joinMethod, reservePublicIP] = useWatch({
    control: form.control,
    name: ['provider', 'contract', 'joinMethod', 'spec.reservePublicIP'],
  });

  if (!provider) return undefined;
  return resolveJoinMethod({
    joinMethod,
    contract,
    spec: { reservePublicIP },
  });
}
