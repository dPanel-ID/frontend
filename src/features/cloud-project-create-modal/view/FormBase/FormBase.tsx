import {
  AlertCircleIcon,
  CheckCircle2Icon,
  CloudIcon,
  RefreshCwIcon,
} from 'lucide-react';
import { useController } from 'react-hook-form';

import type { DTOs } from '@/shared/api';
import IconBiznetGio from '@/shared/assets/biznetgio.png';
import IconAlibabaCloud from '@/shared/assets/ico-alibabacloud.svg';
import IconAmazonWebServices from '@/shared/assets/ico-aws.svg';
import IconGoogleCloudPlatform from '@/shared/assets/ico-gcloud.png';
import IconIDCloudHost from '@/shared/assets/ico-idcloudhost.svg';
import IconProxmox from '@/shared/assets/ico-proxmox.png';
import IconTencentCloud from '@/shared/assets/ico-tencentcloud.svg';
import IconDigitalOcean from '@/shared/assets/logo-digitalocean.png';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useCpcFormContext } from '../../model/forms/context';
import {
  getCredentialFields,
  getProviderIconFallback,
  getProviderLabel,
  getProviderValue,
} from '../../model/provider-contract';

interface FormBaseProps {
  error?: unknown;
  isLoadingProviders: boolean;
  onRetryProviders: () => void;
  providers: DTOs.CloudProviderContractV1[];
}

function getProviderIconUrl(provider: DTOs.CloudProviderContractV1) {
  const iconUrl = provider.icon?.url || provider.icon?.value;

  if (iconUrl?.startsWith('http')) return iconUrl;

  return getLocalProviderIcon(provider);
}

function getLocalProviderIcon(provider: DTOs.CloudProviderContractV1) {
  const tokens = [
    provider.id,
    provider.name,
    ...(provider.aliases ?? []),
  ].map(normalizeProviderToken);

  if (tokens.some((token) => token === 'biznetgio' || token === 'biznetgioneolite')) {
    return IconBiznetGio;
  }

  if (tokens.some((token) => token === 'aws' || token.includes('amazonwebservices') || token.includes('amazonaws'))) {
    return IconAmazonWebServices;
  }

  if (tokens.some((token) => token === 'gcp' || token.includes('googlecloud'))) {
    return IconGoogleCloudPlatform;
  }

  if (tokens.some((token) => token.includes('idcloudhost'))) {
    return IconIDCloudHost;
  }

  if (tokens.some((token) => token.includes('digitalocean') || token === 'do')) {
    return IconDigitalOcean;
  }

  if (tokens.some((token) => token.includes('proxmox'))) {
    return IconProxmox;
  }

  if (
    tokens.some(
      (token) =>
        token.includes('alibabacloud') ||
        token === 'alicloud' ||
        token === 'aliyun',
    )
  ) {
    return IconAlibabaCloud;
  }

  if (tokens.some((token) => token.includes('tencent') || token === 'qcloud')) {
    return IconTencentCloud;
  }

  return undefined;
}

function normalizeProviderToken(value?: string) {
  return (
    value
      ?.trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, '') ?? ''
  );
}

export default function FormBase(props: FormBaseProps) {
  const { error, isLoadingProviders, onRetryProviders, providers } = props;
  const {
    formBase,
    formDynamicCredential,
    formGCP,
    formIDCloudHost,
    formProxmox,
  } = useCpcFormContext();

  const nameControl = useController({
    control: formBase.control,
    name: 'metaTitle',
  });
  const providerControl = useController({
    control: formBase.control,
    name: 'cloudProvider',
  });

  const resetProviderForms = () => {
    formDynamicCredential.reset({ credential: {} });
    formGCP.reset();
    formIDCloudHost.reset();
    formProxmox.reset();
  };

  const handleSelectProvider = (provider: DTOs.CloudProviderContractV1) => {
    providerControl.field.onChange(getProviderValue(provider));
    resetProviderForms();
  };

  return (
    <div className="space-y-4">
      <section className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
              <CloudIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Connection</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Name the account and choose the provider contract used for this
                cloud connection.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-4">
          <div>
            <label className="mb-1.5 block" htmlFor="cloud-project-name">
              <span className="block text-sm font-semibold">
                Connection name<span className="text-destructive">*</span>
              </span>
              <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                Use a name your team can recognize later.
              </span>
            </label>
            <Input
              id="cloud-project-name"
              placeholder="Production cloud account"
              aria-invalid={Boolean(nameControl.fieldState.error)}
              {...nameControl.field}
            />
            <ErrorInline message={nameControl.fieldState.error?.message} />
          </div>

          <div>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <label className="block" htmlFor="cloud-provider-grid">
                <span className="block text-sm font-semibold">
                  Cloud provider<span className="text-destructive">*</span>
                </span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                  Provider cards are loaded from the backend contract.
                </span>
              </label>

              <Button
                size="sm"
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={onRetryProviders}
              >
                <RefreshCwIcon className="size-4" />
                Refresh
              </Button>
            </div>

            {isLoadingProviders && providers.length < 1 && (
              <ProviderLoadingGrid />
            )}

            {error != null && providers.length < 1 && (
              <ProviderFailure error={error} onRetry={onRetryProviders} />
            )}

            {!isLoadingProviders && !error && providers.length < 1 && (
              <ProviderEmpty />
            )}

            {providers.length > 0 && (
              <div
                id="cloud-provider-grid"
                className="grid gap-2 sm:grid-cols-2"
              >
                {providers.map((provider) => {
                  const providerValue = getProviderValue(provider);
                  const isSelected =
                    providerControl.field.value === providerValue;

                  return (
                    <ProviderCard
                      key={providerValue}
                      provider={provider}
                      selected={isSelected}
                      onClick={() => handleSelectProvider(provider)}
                    />
                  );
                })}
              </div>
            )}

            <ErrorInline message={providerControl.fieldState.error?.message} />
          </div>
        </div>
      </section>
    </div>
  );
}

function ProviderCard(props: {
  onClick: () => void;
  provider: DTOs.CloudProviderContractV1;
  selected: boolean;
}) {
  const { onClick, provider, selected } = props;
  const credentialFields = getCredentialFields(provider);
  const requiredCredentialCount = credentialFields.filter(
    (field) => field.required,
  ).length;
  const providerLabel = getProviderLabel(provider);
  const providerIconUrl = getProviderIconUrl(provider);

  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={`Select ${providerLabel}`}
      onClick={onClick}
      className={cn(
        'group min-h-28 rounded-lg border bg-background p-3 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected
          ? 'border-primary bg-primary/10 text-primary'
          : 'hover:border-primary/60 hover:bg-primary/5',
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-card text-xs font-bold uppercase">
          {providerIconUrl ? (
            <img
              alt=""
              className="size-6 object-contain"
              loading="lazy"
              src={providerIconUrl}
            />
          ) : (
            getProviderIconFallback(provider)
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex min-w-0 items-center justify-between gap-2">
            <span className="truncate text-sm font-semibold">
              {providerLabel}
            </span>
            {selected && (
              <CheckCircle2Icon className="size-4 shrink-0 text-primary" />
            )}
          </span>

          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
            {provider.notes?.[0] ||
              provider.category ||
              'Cloud provider contract'}
          </span>
        </span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <ProviderBadge>
          {requiredCredentialCount > 0
            ? `${requiredCredentialCount} required`
            : 'No required secret'}
        </ProviderBadge>
        {(provider.capabilities?.length ?? 0) > 0 && (
          <ProviderBadge>
            {`${provider.capabilities?.length ?? 0} capabilities`}
          </ProviderBadge>
        )}
      </div>
    </button>
  );
}

function ProviderBadge(props: { children: string }) {
  return (
    <span className="rounded-md border bg-card px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
      {props.children}
    </span>
  );
}

function ProviderLoadingGrid() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-28 animate-pulse rounded-lg border bg-background"
        />
      ))}
    </div>
  );
}

function ProviderFailure(props: { error: unknown; onRetry: () => void }) {
  const { error, onRetry } = props;

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <div className="flex items-start gap-3">
        <AlertCircleIcon className="mt-0.5 size-4 shrink-0 text-destructive" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-destructive">
            Failed to load provider contracts
          </p>
          <p className="mt-1 break-words text-xs leading-relaxed text-muted-foreground">
            {getApiErrorDetail(error)}
          </p>
          <Button
            size="sm"
            className="mt-3"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onRetry}
          >
            <RefreshCwIcon className="size-4" />
            Retry
          </Button>
        </div>
      </div>
    </div>
  );
}

function ProviderEmpty() {
  return (
    <div className="rounded-lg border bg-background p-4">
      <p className="text-sm font-semibold">No cloud providers available</p>
      <p className="mt-1 text-sm text-muted-foreground">
        The backend did not return any provider contracts for this workspace.
      </p>
    </div>
  );
}
