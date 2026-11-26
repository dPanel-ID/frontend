import {
  ArrowRightIcon,
  BadgeCheckIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { ApplicationAddressMode } from '@/entities/load-balancer/rules/schema/parts';

import { ApiLoadBalancer } from '@/shared/api';
import type { Dto as ReachDto } from '@/shared/api/load-balancer.application-reach';
import type { Response } from '@/shared/libs/api-client/rules/types';
import { cn } from '@/shared/libs/tailwind/cn';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

/** The modes a person picks here; custom targets are set at create. */
export type ChoosableAddressMode = 'registered' | 'private';

const CHOICES: Array<{ mode: ChoosableAddressMode; icon: typeof NetworkIcon }> =
  [
    { mode: 'registered', icon: BadgeCheckIcon },
    { mode: 'private', icon: NetworkIcon },
  ];

/**
 * How the load balancer's server would reach each deployment of the
 * application, by address mode, with the mode dPanel recommends.
 */
export function useApplicationReach(serverId?: string, applicationId?: string) {
  const [response] = ApiLoadBalancer.ApplicationReach.useGet({
    applicationId: applicationId ?? '',
    serverId: serverId ?? '',
    options: { skip: !serverId || !applicationId },
  });

  return response;
}

/** The recommended mode once the preview has loaded. */
export function getRecommendedAddressMode(
  reach: Response<ReachDto>,
): ChoosableAddressMode | undefined {
  return reach.$status === 'success' ? reach.recommended_mode : undefined;
}

/**
 * Choice between the registered and the private address of an application
 * route, with where each deployment would be reached. `value` is the mode
 * shown as chosen; a custom route shows its mode and can switch away from it.
 */
export function ApplicationAddressModeChoice(props: {
  onChange: (mode: ChoosableAddressMode) => void;
  reach: Response<ReachDto>;
  value?: ApplicationAddressMode;
}) {
  const { onChange, reach, value } = props;
  const t = useDevetekTranslations(
    'page.loadBalancersDetail.upstreams.addressMode',
  );
  const recommended = getRecommendedAddressMode(reach);

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold">{t('chooseTitle')}</p>
      <div
        role="radiogroup"
        aria-label={t('chooseTitle')}
        className="grid gap-2 sm:grid-cols-2"
      >
        {CHOICES.map(({ icon: Icon, mode }) => {
          const selected = value === mode;

          return (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(mode)}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border bg-card p-2.5 text-left transition-colors',
                'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
                selected ? 'border-primary bg-primary/10' : 'hover:bg-accent',
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0">
                <span className="flex flex-wrap items-center gap-1.5 text-sm font-semibold">
                  {t(mode)}
                  {recommended === mode ? (
                    <span className="rounded-full border px-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {t('recommended')}
                    </span>
                  ) : null}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {t(`${mode}Description`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {value === 'custom' ? (
        <p className="text-xs text-muted-foreground">{t('customKept')}</p>
      ) : null}

      <ApplicationReachPreview
        reach={reach}
        mode={value === 'private' ? 'private' : 'registered'}
        show={value === 'registered' || value === 'private'}
      />
    </div>
  );
}

function ApplicationReachPreview(props: {
  mode: ChoosableAddressMode;
  reach: Response<ReachDto>;
  show: boolean;
}) {
  const { mode, reach, show } = props;
  const t = useDevetekTranslations(
    'page.loadBalancersDetail.upstreams.addressMode',
  );

  if (reach.$status === 'loading') {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Spinner />
        {t('previewLoading')}
      </p>
    );
  }
  if (reach.$status === 'failed') {
    return (
      <p className="text-xs text-muted-foreground">{t('previewFailed')}</p>
    );
  }
  if (reach.$status !== 'success') return null;

  return (
    <div className="grid gap-1.5">
      <p className="text-xs text-muted-foreground">
        {t(`reason.${reach.reason}`)}
      </p>
      {show ? (
        <ul className="grid gap-1.5" aria-label={t('previewTitle')}>
          {reach.targets.length === 0 ? (
            <li className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              {t('noDeployments')}
            </li>
          ) : null}
          {reach.targets.map((target) => {
            const address =
              mode === 'private'
                ? target.private_address
                : target.registered_address;

            return (
              <li
                key={target.machine_id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border bg-card px-3 py-2 text-sm"
              >
                <ServerIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate font-medium">
                  {target.server_name
                    ? `${target.server_name} (#${target.machine_id})`
                    : `#${target.machine_id}`}
                </span>
                <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                {address ? (
                  <code className="font-mono text-xs">
                    {address}
                    {target.port ? `:${target.port}` : ''}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {target.network_known
                      ? t('noPrivateAddress')
                      : t('networkUnknown')}
                  </span>
                )}
                {target.same_server ? (
                  <span className="ml-auto rounded-full border px-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {t('sameServer')}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
