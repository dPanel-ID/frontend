import { InfoIcon } from 'lucide-react';
import type { useForm } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import type {
  ProviderContract,
  ProviderField,
} from '@/shared/api/domain.providers';
import { cn } from '@/shared/libs/tailwind/cn';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { getCredentialFields, shouldRenderTextarea } from '../-lib/providers';
import type { DomainCreateForm } from '../-rules/form';
import { FieldLabel } from '../-view/-presentation/fields';


export function CredentialSection(props: {
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  isSubmitting: boolean;
  provider?: ProviderContract;
}) {
  const { form, isSubmitting, provider } = props;
  const t = useDevetekTranslations();
  const credentialFields = getCredentialFields(provider);
  const credentialRules = provider?.credential_rules ?? [];

  return (
    <>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-4">
          {!provider && (
            <div className="rounded-lg border bg-background p-4 text-sm text-muted-foreground">
              {t('page.domainCreate.providerMetadata.emptyDesc')}
            </div>
          )}

          {provider && credentialFields.length < 1 && (
            <div className="rounded-lg border bg-background p-4">
              <p className="text-sm font-semibold">
                {t('page.domainCreate.providerMetadata.noCredentialTitle')}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t('page.domainCreate.providerMetadata.noCredentialDesc')}
              </p>
            </div>
          )}

          {credentialFields.map((field) => (
            <CredentialInput
              key={field.key}
              field={field}
              form={form}
              isSubmitting={isSubmitting}
            />
          ))}
        </div>

        <div className="rounded-lg border bg-background p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-card text-primary">
              <InfoIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {t('page.domainCreate.credentialHelp.title')}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t('page.domainCreate.credentialHelp.description')}
              </p>
              {credentialRules.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {t('page.domainCreate.credentialHelp.rules')}
                  </p>
                  {credentialRules.map((rule, index) => (
                    <p
                      key={`${rule.type}-${index}`}
                      className="rounded-md border bg-card px-2.5 py-2 text-xs leading-relaxed text-muted-foreground"
                    >
                      {rule.message || renderCredentialRule(rule)}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function CredentialInput(props: {
  field: ProviderField;
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  isSubmitting: boolean;
}) {
  const { field, form, isSubmitting } = props;
  const t = useDevetekTranslations();
  const fieldKey = field.key ?? '';
  const fieldName = `credentials.${fieldKey}` as const;
  const fieldError = form.formState.errors.credentials?.[fieldKey]?.message;
  const inputId = `domain-create-credential-${fieldKey}`;
  const options = field.options ?? [];

  if (!fieldKey) return null;

  return (
    <div>
      <FieldLabel
        htmlFor={inputId}
        label={field.label || fieldKey}
        description={field.help}
        required={field.required}
      />

      {options.length > 0 ? (
        <Combobox
          classNameButton="w-full"
          items={options.map((option) => ({
            label: option.label || option.value || '',
            value: option.value || '',
          }))}
          value={form.watch(fieldName)}
          onChange={(value) => {
            form.setValue(fieldName, value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          placeholder={field.placeholder || field.label || fieldKey}
        />
      ) : shouldRenderTextarea(field) ? (
        <TextArea
          id={inputId}
          className={cn(
            'min-h-28 resize-y',
            field.secret && 'font-mono text-xs',
          )}
          placeholder={field.placeholder}
          autoComplete="off"
          spellCheck={false}
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldError)}
          {...form.register(fieldName)}
        />
      ) : (
        <Input
          id={inputId}
          type={field.secret || field.type === 'password' ? 'password' : 'text'}
          placeholder={field.placeholder}
          autoComplete="off"
          disabled={isSubmitting}
          aria-invalid={Boolean(fieldError)}
          {...form.register(fieldName)}
        />
      )}

      <ErrorInline
        message={fieldError}
        t={(key) => (key.startsWith('formErrors.') ? t(key) : key)}
      />
    </div>
  );
}

export function renderCredentialRule(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
) {
  return [rule.type, ...(rule.fields ?? [])].filter(Boolean).join(': ');
}
