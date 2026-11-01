import { useMemo, useState } from 'react';

import { ArrowRightIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { ProviderIdent } from '@/entities/domain/rules/schema/parts';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import type { Form } from '../-model/form';
import type { CreateResources } from '../-model/resources';

export function DomainField(props: {
  form: Form;
  domains: CreateResources['domains'];
  /** Where the record points: the gateway server's address. */
  gatewayAddress?: string;
}) {
  const { form, domains, gatewayAddress } = props;
  const t = useDevetekTranslations();
  const [isExternal, setIsExternal] = useState(true);
  const domain = useController({ control: form.control, name: 'domain' });
  const internalDomainId = useController({
    control: form.control,
    name: 'internalDomainMetadata.id',
  });
  const internalDomainSubdomain = useController({
    control: form.control,
    name: 'internalDomainMetadata.subdomain',
  });

  const domainItems = useMemo(() => {
    if (domains.$status !== 'success') return [];

    return domains.list.map((item) => ({
      value: item.id,
      label: `.${item.domain.hostname}`,
      description: item.ownership.owner,
    }));
  }, [domains]);

  const changeDomainMode = (nextExternal: boolean) => {
    setIsExternal(nextExternal);
    form.setValue('domain', '');
    form.setValue('internalDomainMetadata', {
      id: '',
      subdomain: '',
    });
  };

  const selectInternalDomain = (id: string) => {
    if (domains.$status !== 'success') return;

    const selected = domains.list.find((item) => item.id === id);
    if (!selected) return;

    internalDomainId.field.onChange(id);
    domain.field.onChange(selected.domain.hostname);
    form.setValue(
      'internalDomainMetadata.cloudflare',
      selected.provider === ProviderIdent.cloudflare
        ? { proxied: false }
        : undefined,
    );
  };

  const selectedDomain =
    domains.$status === 'success'
      ? domains.list.find((item) => item.id === internalDomainId.field.value)
      : undefined;

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold">
            {t('sidepanel.loadBalancerCreation.fieldDomain.title')}
            <span className="text-destructive">*</span>
          </p>
          <p className="text-xs text-muted-foreground">
            {t('page.loadBalancersCreate.gateway.domainHint')}
          </p>
        </div>

        <div
          className="inline-flex rounded-md border bg-background p-1"
          role="group"
          aria-label={t('page.loadBalancersCreate.gateway.domainMode')}
        >
          <Button
            size="sm"
            buttonStyle={isExternal ? 'flat' : 'ghost'}
            buttonColor={isExternal ? 'primary' : 'secondary'}
            onClick={() => changeDomainMode(true)}
          >
            {t('page.loadBalancersCreate.gateway.externalDomain')}
          </Button>
          <Button
            size="sm"
            buttonStyle={!isExternal ? 'flat' : 'ghost'}
            buttonColor={!isExternal ? 'primary' : 'secondary'}
            onClick={() => changeDomainMode(false)}
          >
            {t('page.loadBalancersCreate.gateway.internalDomain')}
          </Button>
        </div>
      </div>

      {isExternal ? (
        <Input
          {...domain.field}
          placeholder={t(
            'sidepanel.loadBalancerCreation.fieldDomain.placeholder',
          )}
        />
      ) : (
        // The two fields are one hostname, so on desktop they sit on one
        // line with the dot that joins them; they stack on phones.
        <div className="grid items-center gap-2 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1.3fr)]">
          <Input
            {...internalDomainSubdomain.field}
            aria-label={t('page.loadBalancersCreate.gateway.subdomain')}
            placeholder={t('page.loadBalancersCreate.gateway.subdomain')}
          />
          <span
            aria-hidden
            className="hidden text-sm font-semibold text-muted-foreground sm:inline"
          >
            .
          </span>
          <Combobox
            classNameButton="w-full"
            items={domainItems}
            value={internalDomainId.field.value}
            onChange={selectInternalDomain}
            placeholder={t('page.loadBalancersCreate.gateway.selectDomain')}
          />
        </div>
      )}

      <ErrorInline t={t} message={form.formState.errors.domain?.message} />

      <DnsRecordPanel
        form={form}
        external={isExternal}
        provider={selectedDomain?.provider}
        gatewayAddress={gatewayAddress}
      />
    </Card>
  );
}

/**
 * What happens in DNS. A registered domain gets its record created; on
 * Cloudflare the user also picks whether it is proxied. Both engines issue
 * the certificate over DNS-01 when it is, so the choice is open for Caddy
 * and APISIX alike. An external domain only gets the record to add.
 */
function DnsRecordPanel(props: {
  form: Form;
  external: boolean;
  provider?: string;
  gatewayAddress?: string;
}) {
  const { external, form, gatewayAddress, provider } = props;
  const t = useDevetekTranslations('page.loadBalancersCreate.dns');
  const values = useWatch({ control: form.control });
  const proxied = useController({
    control: form.control,
    name: 'internalDomainMetadata.cloudflare.proxied',
  });

  const subdomain = values.internalDomainMetadata?.subdomain?.trim();
  const host = external
    ? values.domain?.trim()
    : values.domain && subdomain
      ? `${subdomain}.${values.domain}`
      : undefined;
  const isCloudflare = !external && provider === ProviderIdent.cloudflare;

  if (!external && !provider) return null;

  return (
    <div className="mt-4 grid gap-3 rounded-lg border bg-background p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {external
            ? t('externalTitle')
            : t('managedTitle', { provider: provider ?? '' })}
        </p>
        {!external && (
          <span className="rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground">
            {isCloudflare && proxied.field.value ? t('proxied') : t('dnsOnly')}
          </span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded border bg-card px-1.5 py-0.5 font-semibold">
          A
        </span>
        <span className="min-w-0 break-all">{host || t('hostPending')}</span>
        <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="break-all">
          {gatewayAddress || t('gatewayPending')}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {external
          ? t('externalHint')
          : isCloudflare && proxied.field.value
            ? t('proxiedHint')
            : t('dnsOnlyHint')}
      </p>

      {isCloudflare && (
        <label className="flex items-center justify-between gap-4 border-t pt-3">
          <span>
            <span className="block text-sm font-semibold">
              {t('proxiedToggle')}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t('proxiedToggleHint')}
            </span>
          </span>
          <Switch
            checked={proxied.field.value ?? false}
            onCheckedChange={proxied.field.onChange}
            aria-label={t('proxiedToggle')}
          />
        </label>
      )}
    </div>
  );
}
