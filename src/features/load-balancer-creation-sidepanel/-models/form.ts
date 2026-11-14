import { zodResolver } from '@hookform/resolvers/zod';
import type { DefaultValues } from 'react-hook-form';

import { buildRHF } from '@/shared/libs/react-factories/buildRHF';

import type { CreationFormValues } from '../-rules/schemas/form';
import { schemaCreationForm } from '../-rules/schemas/form';

export const [FormProvider, useLbCreationForm] = buildRHF({
  resolver: zodResolver(schemaCreationForm),
  defaultValues: {
    description: '',
    domain: '',
    internalDomainMetadata: {
      id: '',
      subdomain: '',
    },
    serverId: '',
    lbKind: 'l7' as const,
    features: {
      sslEnabled: true,
      protocol: 'http' as const,
    },
    l7rules: [
      {
        pathMatch: '/*',
        type: 'proxy-pass' as const,
        upstreamsIfProxyPass: [{ address: 'localhost', port: 80 }],
        applicationIdIfProxyPassApp: '',
      },
    ],
    // The kind control renders the value as is, so the compiler keeps a
    // valid kind here and the field is never blank, even after reset().
  } satisfies DefaultValues<CreationFormValues> &
    Pick<CreationFormValues, 'lbKind'>,
});
