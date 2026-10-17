import IconBiznetGio from '@/shared/assets/biznetgio.png';
import IconAWS from '@/shared/assets/ico-aws.svg';
import IconGCloud from '@/shared/assets/ico-gcloud.png';
import IconIDCloudHost from '@/shared/assets/ico-idcloudhost.svg';
import IconServer from '@/shared/assets/ico-server.webp';
import IconDigitalOcean from '@/shared/assets/logo-digitalocean.png';

import type { SchemaServerParts } from '../../rules/schema';
import type { ServerProviderMetadata } from '../../rules/types';

export const SERVER_PROVIDER_METADATA: Record<
  SchemaServerParts.CloudProvider,
  ServerProviderMetadata
> = {
  other: {
    imageSrc: IconServer,
    i18n: {
      label: 'common.terms.other',
    },
  },
  aws: {
    imageSrc: IconAWS,
    i18n: {
      label: 'common.brands.aws',
    },
  },
  biznetgio: {
    imageSrc: IconBiznetGio,
    i18n: {
      label: 'common.brands.biznetGio',
    },
  },
  digitalocean: {
    imageSrc: IconDigitalOcean,
    i18n: {
      label: 'common.brands.digitalOcean',
    },
  },
  googlecloud: {
    imageSrc: IconGCloud,
    i18n: {
      label: 'common.brands.googleCloud',
    },
  },
  idcloudhost: {
    imageSrc: IconIDCloudHost,
    i18n: {
      label: 'common.brands.idCloudHost',
    },
  },
  do: {
    imageSrc: IconDigitalOcean,
    i18n: {
      label: 'common.brands.digitalOcean',
    },
  },
};
