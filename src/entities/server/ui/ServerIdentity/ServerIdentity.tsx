import type { ReactNode } from 'react';

import {
  GlobeIcon,
  HouseIcon,
  MapPinIcon,
  ServerIcon,
  TerminalIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { CloudProviderLogo } from '@/shared/presentation/molecules/CloudProviderLogo';

import {
  isCloudServer,
  serverDisplayName,
  serverProviderLabel,
  serverSystemLabel,
} from '../../lib/describeServer';
import type { ServerCard } from '../../rules/schema';

type ServerLike = Pick<ServerCard, 'id' | 'host' | 'cloud' | 'system'>;

export interface ServerIdentityProps {
  server: ServerLike;
  size?: 'sm' | 'md' | 'lg';
  /** Rendered after the name, typically the status pill. */
  trailing?: ReactNode;
  /** Shows the address, OS and region under the name. */
  meta?: boolean;
  /** Makes the name a button, for example to open the server's page. */
  onClickName?: () => void;
  className?: string;
}

const SIZE_CLASSES = {
  sm: { logo: 'size-8', icon: 'size-4', name: 'text-sm', radius: 'rounded-lg' },
  md: {
    logo: 'size-10',
    icon: 'size-5',
    name: 'text-base',
    radius: 'rounded-lg',
  },
  lg: {
    logo: 'size-12',
    icon: 'size-6',
    name: 'text-lg',
    radius: 'rounded-xl',
  },
} as const;

/**
 * Who a server is, at a glance: the provider's logo (or an own-server tile),
 * its name, and optionally where it lives and what it runs.
 */
export function ServerIdentity(props: ServerIdentityProps) {
  const {
    className,
    meta = false,
    onClickName,
    server,
    size = 'md',
    trailing,
  } = props;
  const t = useDevetekTranslations();
  const sizes = SIZE_CLASSES[size];
  const cloud = isCloudServer(server);

  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      {cloud ? (
        <CloudProviderLogo
          provider={server.cloud?.provider}
          className={cn(sizes.logo, sizes.radius)}
        />
      ) : (
        <span
          className={cn(
            'flex shrink-0 items-center justify-center border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
            sizes.logo,
            sizes.radius,
          )}
          aria-hidden
        >
          <ServerIcon className={sizes.icon} />
        </span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
          {onClickName ? (
            <button
              type="button"
              onClick={onClickName}
              className={cn(
                'truncate rounded text-left font-bold leading-tight text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                sizes.name,
              )}
            >
              {serverDisplayName(server)}
            </button>
          ) : (
            <span
              className={cn(
                'truncate font-bold leading-tight text-primary',
                sizes.name,
              )}
            >
              {serverDisplayName(server)}
            </span>
          )}
          {server.host.private && (
            <span
              className="shrink-0 rounded-full border border-violet-400/30 bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-700 dark:text-violet-300"
              title={t('common.terms.privateServerHint')}
            >
              {t('common.terms.privateBadge')}
            </span>
          )}
          {trailing}
        </div>

        {meta && (
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs font-medium text-muted-foreground">
            <MetaItem
              icon={GlobeIcon}
              value={server.host.name ? server.host.address : undefined}
            />
            <MetaItem icon={TerminalIcon} value={serverSystemLabel(server)} />
            <MetaItem
              icon={server.host.private ? HouseIcon : MapPinIcon}
              value={
                cloud
                  ? [serverProviderLabel(server), server.cloud?.region]
                      .filter(Boolean)
                      .join(' · ')
                  : server.host.private
                    ? t('common.terms.privateServer')
                    : t('common.terms.ownServer')
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem(props: { icon: LucideIcon; value?: string }) {
  const { icon: Icon, value } = props;
  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}
