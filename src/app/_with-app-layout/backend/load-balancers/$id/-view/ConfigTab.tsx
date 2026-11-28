import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import {
  CloudIcon,
  GaugeIcon,
  Globe2Icon,
  RouteIcon,
  SaveIcon,
  ServerIcon,
  Settings2Icon,
  ShieldCheckIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { LoadBalancerDetails } from '@/entities/load-balancer/rules/schema';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';

import { ApiLoadBalancer } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Switch } from '@/shared/presentation/atoms/Switch';

import {
  getRuntimeConfigDraft,
  serializeRuntimeConfigDraft,
  toLoadBalancerConfigPayload,
} from '../-lib/runtime-config';
import type {
  HttpSettingsDraft,
  IconComponent,
  RawLoadBalancerDetailsDto,
} from '../-lib/types';

import { DetailSurface } from './-presentation/surfaces';

export function ConfigTab(props: {
  details: LoadBalancerDetails;
  onSaved: () => void;
  rawDetails?: RawLoadBalancerDetailsDto;
}) {
  const { details, onSaved, rawDetails } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const sourceConfig = useMemo(
    () => getRuntimeConfigDraft(rawDetails, details),
    [details, rawDetails],
  );
  const [draft, setDraft] = useState(sourceConfig);
  const [isSaving, setIsSaving] = useState(false);

  // A new saved config replaces the draft. Adjusted during render, so the
  // stale draft is never painted.
  const [draftSource, setDraftSource] = useState(sourceConfig);
  if (draftSource !== sourceConfig) {
    setDraftSource(sourceConfig);
    setDraft(sourceConfig);
  }

  const webserver = LOAD_BALANCER_WEBSERVER_ENGINE[details.webserver.engine];
  const isL4 = details.configuration.lbKind === 'l4';
  // Only Caddy (and the legacy nginx records it renders) applies config.http.
  const appliesHttpSettings =
    details.webserver.engine === 'caddy' ||
    details.webserver.engine === 'nginx';
  const hasDraftChanges =
    serializeRuntimeConfigDraft(draft) !==
    serializeRuntimeConfigDraft(sourceConfig);

  const saveConfig = async () => {
    if (!hasDraftChanges || isSaving) return;

    setIsSaving(true);

    try {
      const response = await ApiLoadBalancer.Update.$Id.doPost({
        loadBalancerId: details.id,
        advanceMode: true,
        name: details.description,
        config: toLoadBalancerConfigPayload(rawDetails, details, draft),
      });

      if (response.$status === 'success') {
        openToaster({
          variant: 'success',
          message: t('page.loadBalancersDetail.config.saveSuccess'),
        });
        onSaved();
        return;
      }

      openToaster({
        variant: 'error',
        title: t('page.loadBalancersDetail.config.saveFailed'),
        message: response.error.message,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DetailSurface
      icon={Settings2Icon}
      title={t('page.loadBalancersDetail.sections.configuration')}
      description={t('page.loadBalancersDetail.sections.configurationDesc')}
      action={
        <Button
          disabled={!hasDraftChanges || isSaving}
          onClick={saveConfig}
          title={t('page.loadBalancersDetail.config.saveTitle')}
        >
          {isSaving ? <Spinner /> : <SaveIcon />}
          {t('common.actions.save')}
        </Button>
      }
    >
      <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
        {t('page.loadBalancersDetail.config.backendRequired')}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.45fr)]">
        <div className="grid gap-3">
          <ConfigToggle
            checked={draft.sslEnabled}
            description={t('page.loadBalancersDetail.config.sslDesc')}
            icon={ShieldCheckIcon}
            label={t('page.loadBalancersDetail.config.ssl')}
            onCheckedChange={(sslEnabled) =>
              setDraft((current) => ({ ...current, sslEnabled }))
            }
          />
          <ConfigToggle
            checked={draft.cloudflareProxied}
            description={t('page.loadBalancersDetail.config.cloudflareDesc')}
            icon={CloudIcon}
            label={t('page.loadBalancersDetail.config.cloudflare')}
            onCheckedChange={(cloudflareProxied) =>
              setDraft((current) => ({ ...current, cloudflareProxied }))
            }
          />
          {!isL4 && (
            <HttpSettingsCard
              disabled={!appliesHttpSettings}
              value={draft.http}
              onChange={(http) => setDraft((current) => ({ ...current, http }))}
            />
          )}
        </div>

        <div className="grid gap-3 rounded-lg border bg-background p-4">
          <ConfigInfoRow
            icon={ShieldCheckIcon}
            label={t('common.terms.engine')}
            value={t(webserver.i18n.brandName)}
          />
          <ConfigInfoRow
            icon={RouteIcon}
            label={t('page.loadBalancers.lbKind')}
            value={details.configuration.lbKind.toUpperCase()}
          />
          <ConfigInfoRow
            icon={Globe2Icon}
            label={t('page.loadBalancersDetail.config.protocol')}
            value={draft.protocol.toUpperCase()}
          />
          <ConfigInfoRow
            icon={ServerIcon}
            label={t('page.loadBalancers.gatewayServer')}
            value={
              details.gateway?.server.hostname ||
              t('page.loadBalancers.noGateway')
            }
          />
        </div>
      </div>
    </DetailSurface>
  );
}

const HTTP_SETTINGS_INPUTS = [
  { field: 'requestBodyMax', key: 'requestBodyMax', placeholder: '100MB' },
  { field: 'readBodyTimeout', key: 'readBodyTimeout', placeholder: '10s' },
  { field: 'responseTimeout', key: 'responseTimeout', placeholder: '60s' },
  { field: 'healthPath', key: 'healthPath', placeholder: '/up' },
  { field: 'healthInterval', key: 'healthInterval', placeholder: '10s' },
  { field: 'healthTimeout', key: 'healthTimeout', placeholder: '5s' },
] as const satisfies ReadonlyArray<{
  field: keyof HttpSettingsDraft;
  key: string;
  placeholder: string;
}>;

function HttpSettingsCard(props: {
  disabled: boolean;
  onChange: (value: HttpSettingsDraft) => void;
  value: HttpSettingsDraft;
}) {
  const { disabled, onChange, value } = props;
  const t = useDevetekTranslations();

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex min-w-0 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
          <GaugeIcon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">
            {t('page.loadBalancersDetail.config.http.title')}
          </span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {t(
              disabled
                ? 'page.loadBalancersDetail.config.http.caddyOnly'
                : 'page.loadBalancersDetail.config.http.description',
            )}
          </span>
        </span>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {HTTP_SETTINGS_INPUTS.map(({ field, key, placeholder }) => (
          <label key={field} className="grid gap-1.5 text-sm">
            <span className="font-semibold">
              {t(`page.loadBalancersDetail.config.http.${key}`)}
            </span>
            <Input
              inputSize="sm"
              className="font-mono"
              disabled={disabled}
              value={value[field]}
              placeholder={placeholder}
              onChange={(event) =>
                onChange({ ...value, [field]: event.target.value })
              }
            />
            <span className="text-xs leading-relaxed text-muted-foreground">
              {t(`page.loadBalancersDetail.config.http.${key}Hint`)}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ConfigToggle(props: {
  checked: boolean;
  description: string;
  icon: IconComponent;
  label: string;
  onCheckedChange: (checked: boolean) => void;
}) {
  const { checked, description, icon: Icon, label, onCheckedChange } = props;

  return (
    <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">{label}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={label}
      />
    </div>
  );
}

export function ConfigInfoRow(props: {
  icon: IconComponent;
  label: string;
  value: ReactNode;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="grid grid-cols-[24px_minmax(0,0.75fr)_minmax(0,1fr)] items-start gap-3 text-sm">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <span className="font-semibold text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-semibold">{value}</span>
    </div>
  );
}
