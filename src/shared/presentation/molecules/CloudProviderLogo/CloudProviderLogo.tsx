import IconBiznetGio from '@/shared/assets/biznetgio.png';
import IconAWS from '@/shared/assets/ico-aws.svg';
import IconDigitalOcean from '@/shared/assets/ico-do.svg';
import IconGoogleCloud from '@/shared/assets/ico-gcloud.png';
import IconIDCloudHost from '@/shared/assets/ico-idcloudhost.svg';
import IconProxmox from '@/shared/assets/ico-proxmox.png';
import { cn } from '@/shared/libs/tailwind/cn';

const PROVIDER_LOGOS: Record<string, { src: string; label: string }> = {
  aws: { src: IconAWS, label: 'AWS' },
  amazon: { src: IconAWS, label: 'AWS' },
  amazonwebservices: { src: IconAWS, label: 'AWS' },
  gcp: { src: IconGoogleCloud, label: 'Google Cloud' },
  googlecloud: { src: IconGoogleCloud, label: 'Google Cloud' },
  googlecloudplatform: { src: IconGoogleCloud, label: 'Google Cloud' },
  digitalocean: { src: IconDigitalOcean, label: 'DigitalOcean' },
  do: { src: IconDigitalOcean, label: 'DigitalOcean' },
  idcloudhost: { src: IconIDCloudHost, label: 'IDCloudHost' },
  biznetgio: { src: IconBiznetGio, label: 'Biznet Gio' },
  biznetgioneolite: { src: IconBiznetGio, label: 'Biznet Gio' },
  neolite: { src: IconBiznetGio, label: 'Biznet Gio' },
  proxmox: { src: IconProxmox, label: 'Proxmox VE' },
};

/** Normalizes provider IDs such as "IDCloudHost" or "biznet-gio" for lookup. */
export function normalizeCloudProviderKey(provider?: string) {
  return (provider ?? '').toLowerCase().replace(/[\s_-]/g, '');
}

/** Providers listed first, in this order; others follow in API order. */
const PREFERRED_ORDER = [
  'aws',
  'gcp',
  'digitalocean',
  'idcloudhost',
  'biznetgio',
];

/** Sort rank of a provider for pickers: preferred providers first. */
export function cloudProviderRank(provider?: string) {
  const index = PREFERRED_ORDER.indexOf(normalizeCloudProviderKey(provider));
  return index === -1 ? PREFERRED_ORDER.length : index;
}

/** Display name of a cloud provider, or undefined when it is unknown. */
export function getCloudProviderLabel(provider?: string) {
  return PROVIDER_LOGOS[normalizeCloudProviderKey(provider)]?.label;
}

interface CloudProviderLogoProps {
  provider?: string;
  /** Text used for the fallback badge when no logo is bundled. */
  fallbackLabel?: string;
  className?: string;
}

/**
 * Renders a cloud provider's logo on a light tile, so dark and colored
 * marks stay legible in both themes. Unknown providers get an initials badge.
 */
export function CloudProviderLogo(props: CloudProviderLogoProps) {
  const { className, fallbackLabel, provider } = props;
  const logo = PROVIDER_LOGOS[normalizeCloudProviderKey(provider)];

  return (
    <span
      className={cn(
        'flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-black/5 bg-white p-1.5 shadow-sm',
        className,
      )}
    >
      {logo ? (
        <img
          alt={logo.label}
          className="size-full object-contain"
          src={logo.src}
        />
      ) : (
        <span className="text-xs font-bold uppercase text-neutral-700">
          {(fallbackLabel || provider || '?').slice(0, 2)}
        </span>
      )}
    </span>
  );
}
