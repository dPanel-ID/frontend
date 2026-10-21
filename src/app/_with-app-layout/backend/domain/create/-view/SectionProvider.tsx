import { useDevetekTranslations } from '@/services/i18n';

import type { ApiDomain } from '@/shared/api';
import type { ProviderContract } from '@/shared/api/domain.providers';
import { Badge } from '@/shared/presentation/atoms/Badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/presentation/atoms/Select';
import { FailedState } from '@/widgets/failed-state';

import { getProviderLabel } from '../-lib/providers';
import { FieldLabel } from '../-view/-presentation/fields';

import { renderCredentialRequirement } from './-presentation/fields';

export function ProviderSection(props: {
  providers: ProviderContract[];
  response: ReturnType<typeof ApiDomain.Providers.useGet>[0];
  selectedProvider: string;
  isSubmitting: boolean;
  onRetry: () => void;
  onSelectProvider: (provider: string) => void;
}) {
  const {
    isSubmitting,
    onRetry,
    onSelectProvider,
    providers,
    response,
    selectedProvider,
  } = props;
  const t = useDevetekTranslations();
  const selectedProviderContract = providers.find(
    (provider) => provider.provider === selectedProvider,
  );

  return (
    <>
      {response.$status === 'loading' && providers.length < 1 && (
        <ProviderMetadataLoading />
      )}

      {response.$status === 'failed' && providers.length < 1 && (
        <FailedState.BannerRetryable
          classNameWrapper="mb-3"
          onClickRetry={onRetry}
        />
      )}

      {response.$status === 'success' && providers.length < 1 && (
        <div className="rounded-lg border bg-background p-4">
          <p className="text-sm font-semibold">
            {t('page.domainCreate.providerMetadata.emptyTitle')}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t('page.domainCreate.providerMetadata.emptyDesc')}
          </p>
        </div>
      )}

      {providers.length > 0 && (
        <div>
          <FieldLabel
            htmlFor="domain-create-provider"
            label={t('page.domainCreate.fields.provider.label')}
            description={t('page.domainCreate.fields.provider.description')}
            required
          />
          <Select
            value={selectedProvider || undefined}
            disabled={isSubmitting}
            onValueChange={onSelectProvider}
          >
            <SelectTrigger
              id="domain-create-provider"
              className="h-auto min-h-14 bg-background px-3 py-2"
            >
              {selectedProviderContract ? (
                <ProviderSelectOption provider={selectedProviderContract} />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {t('page.domainCreate.providerMetadata.placeholder')}
                </span>
              )}
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {providers.map((provider) => {
                const providerValue = provider.provider ?? '';

                return (
                  <SelectItem
                    key={providerValue}
                    value={providerValue}
                    className="py-2"
                  >
                    <ProviderSelectOption provider={provider} />
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {selectedProviderContract && (
            <div className="mt-3 rounded-lg border bg-background p-4">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                  <ProviderIconMark provider={selectedProviderContract} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {getProviderLabel(selectedProviderContract)}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {renderProviderDescription(selectedProviderContract, t)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline">
                      {renderCredentialRequirement(selectedProviderContract, t)}
                    </Badge>
                    {(selectedProviderContract.capabilities?.length ?? 0) >
                      0 && (
                      <Badge variant="outline">
                        {t(
                          'page.domainCreate.providerMetadata.capabilityCount',
                          {
                            count:
                              selectedProviderContract.capabilities?.length ??
                              0,
                          },
                        )}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}

export function renderProviderDescription(
  provider: ProviderContract,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const notes = provider.notes?.filter(Boolean) ?? [];
  if (notes[0]) return notes[0];

  const capabilities = provider.capabilities?.filter(Boolean) ?? [];
  if (capabilities.length > 0) {
    return t('page.domainCreate.providerMetadata.capabilityCount', {
      count: capabilities.length,
    });
  }

  return t('page.domainCreate.providerMetadata.contractBacked');
}

export function ProviderSelectOption(props: { provider: ProviderContract }) {
  const { provider } = props;
  const t = useDevetekTranslations();

  return (
    <span className="flex min-w-0 items-center gap-3 text-left">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card">
        <ProviderIconMark provider={provider} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold">
          {getProviderLabel(provider)}
        </span>
        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
          {renderCredentialRequirement(provider, t)}
        </span>
      </span>
    </span>
  );
}

export function ProviderIconMark(props: { provider: ProviderContract }) {
  const { provider } = props;
  const fallback =
    provider.icon?.fallback || provider.label?.slice(0, 2) || '?';

  if (provider.icon?.url) {
    return (
      <img
        alt=""
        src={provider.icon.url}
        className="size-6 object-contain"
        loading="lazy"
      />
    );
  }

  return <span className="text-xs font-bold uppercase">{fallback}</span>;
}

export function ProviderMetadataLoading() {
  return (
    <div className="space-y-3">
      <div className="h-14 animate-pulse rounded-lg border bg-background" />
      <div className="h-24 animate-pulse rounded-lg border bg-background" />
    </div>
  );
}
