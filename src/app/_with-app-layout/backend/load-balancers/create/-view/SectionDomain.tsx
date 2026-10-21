import { useMemo, useState } from 'react';

import { useController } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import type { Form } from '../-model/form';
import type { CreateResources } from '../-model/resources';

export function DomainField(props: {
  form: Form;
  domains: CreateResources['domains'];
}) {
  const { form, domains } = props;
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
  };

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
    </Card>
  );
}
