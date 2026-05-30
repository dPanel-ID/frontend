import type { LucideProps } from 'lucide-react';
import {
  BoxesIcon,
  CircleQuestionMarkIcon,
  CloudIcon,
  GlobeIcon,
  NetworkIcon,
  ServerIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import IconBrandCloudflare from '@/shared/presentation/icons/BrandCloudflare';
import IconBrandDigitalOcean from '@/shared/presentation/icons/BrandDigitalOcean';

import { SchemaDomainParts } from '../../rules/schema';
import type { DomainProvider } from '../../rules/types';

const UnknownIcon = (props: LucideProps) => {
  const cnIcon = cn('opacity-10 text-primary', props.className);

  return <CircleQuestionMarkIcon {...props} className={cnIcon} />;
};

export const DOMAIN_PROVIDER_BRANDS: Record<
  SchemaDomainParts.Provider,
  DomainProvider
> = {
  [SchemaDomainParts.ProviderIdent.cloudflare]: {
    icon: IconBrandCloudflare,
    label: 'Cloudflare',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.digitalOcean]: {
    icon: IconBrandDigitalOcean,
    label: 'DigitalOcean',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.goDaddy]: {
    icon: ShieldCheckIcon,
    label: 'GoDaddy',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.netlify]: {
    icon: NetworkIcon,
    label: 'Netlify',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.namecheap]: {
    icon: GlobeIcon,
    label: 'Namecheap',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.vultr]: {
    icon: CloudIcon,
    label: 'Vultr',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.linode]: {
    icon: BoxesIcon,
    label: 'Linode',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.hetzner]: {
    icon: ServerIcon,
    label: 'Hetzner',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
  [SchemaDomainParts.ProviderIdent.unknown]: {
    icon: UnknownIcon,
    label: 'Unknown provider',
    i18n: {
      brandName: 'common.terms.unknown',
    },
  },
};

export function getDomainProviderLabel(
  provider: SchemaDomainParts.Provider,
  unknownLabel: string,
) {
  if (provider === SchemaDomainParts.ProviderIdent.unknown) {
    return unknownLabel;
  }

  return DOMAIN_PROVIDER_BRANDS[provider].label || unknownLabel;
}
