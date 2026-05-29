import type { ComponentType, ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  CheckCircle2Icon,
  CircleDotIcon,
  InfoIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';
import * as tldts from 'tldts';
import { z } from 'zod';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiDomain } from '@/shared/api';
import type {
  ProviderContract,
  ProviderField,
} from '@/shared/api/domain.providers';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { Combobox } from '@/shared/presentation/molecules/Combobox';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { FailedState } from '@/widgets/failed-state';

export const Route = createFileRoute(
  '/_with-app-layout/backend/domain/create/',
)({
  component: DomainCreatePage,
});

const DOMAIN_CREATE_FORM_ID = 'domain-create-form';

const schemaDomainCreateForm = z.object({
  domain: z
    .string()
    .transform(normalizeDomainInput)
    .pipe(
      z
        .string()
        .min(1, 'formErrors.required')
        .refine(isValidDomain, 'formErrors.parseDomain.invalidDomain'),
    ),
  description: z.string().trim().optional(),
  provider: z.string().trim().min(1, 'formErrors.required'),
  credentials: z.record(z.string(), z.string().optional()),
});

type DomainCreateForm = z.output<typeof schemaDomainCreateForm>;

function DomainCreatePage() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [providersResponse, refreshProviders] = ApiDomain.Providers.useGet();

  const form = useForm<DomainCreateForm>({
    resolver: zodResolver(schemaDomainCreateForm),
    mode: 'onTouched',
    defaultValues: {
      domain: '',
      description: '',
      provider: '',
      credentials: {},
    },
  });

  const values = useWatch({ control: form.control });
  const providerContracts = useMemo(
    () => getProviderContracts(providersResponse),
    [providersResponse],
  );
  const selectedProvider =
    providerContracts.find((option) => option.provider === values.provider) ??
    providerContracts[0];
  const canSubmit =
    providersResponse.$status !== 'failed' && !!selectedProvider;

  useEffect(() => {
    const firstProvider = providerContracts[0]?.provider;

    if (!firstProvider) return;
    if (
      providerContracts.some(
        (provider) => provider.provider === values.provider,
      )
    ) {
      return;
    }

    form.setValue('provider', firstProvider, {
      shouldDirty: false,
      shouldValidate: true,
    });
    form.setValue(
      'credentials',
      {},
      {
        shouldDirty: false,
        shouldValidate: false,
      },
    );
    form.clearErrors('credentials');
  }, [form, providerContracts, values.provider]);

  const handleBackToDomains = () => {
    navigate({
      to: '/backend/domain',
      search: {
        page: 1,
        viewMode: 'auto',
      },
    });
  };

  const handleSelectProvider = (provider: string) => {
    const currentProvider = form.getValues('provider');
    if (currentProvider === provider) return;

    form.setValue('provider', provider, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue(
      'credentials',
      {},
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
    form.clearErrors('credentials');
  };

  const handleSubmit = form.handleSubmit(async (formValues) => {
    if (!selectedProvider) {
      openToaster({
        variant: 'error',
        title: t('page.domainCreate.toaster.errorTitle'),
        message: t('page.domainCreate.providerMetadata.emptyDesc'),
      });
      return;
    }

    if (!validateCredentialRequirements(selectedProvider, formValues, form)) {
      openToaster({
        variant: 'error',
        title: t('page.domainCreate.toaster.errorTitle'),
        message: t('page.domainCreate.toaster.fixCredentials'),
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const credential = buildCredentialPayload(selectedProvider, formValues);
      const response = await ApiDomain.Create.doPost({
        domain: formValues.domain,
        description: formValues.description?.trim() || undefined,
        provider: formValues.provider,
        credential,
      });

      if (response.$status === 'failed') {
        throw response.error;
      }

      openToaster({
        variant: 'success',
        message: t('page.domainCreate.toaster.success'),
      });

      handleBackToDomains();
    } catch (error) {
      openToaster({
        variant: 'error',
        title: t('page.domainCreate.toaster.errorTitle'),
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <>
      <title>{t('page.domainCreate.documentTitle')}</title>

      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.backend'),
              },
              {
                text: t('page.domain.headerTitle'),
                url: '/backend/domain',
              },
            ]}
          />
        }
        title={t('page.domainCreate.headerTitle')}
        description={t('page.domainCreate.headerDesc')}
        rightAppend={
          <DomainCreateActions
            formId={DOMAIN_CREATE_FORM_ID}
            isSubmitting={isSubmitting}
            disabled={!canSubmit}
            onCancel={handleBackToDomains}
          />
        }
      />

      <form
        id={DOMAIN_CREATE_FORM_ID}
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <SetupProgress values={values} provider={selectedProvider} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="flex min-w-0 flex-col gap-4">
            <DomainIdentitySection form={form} isSubmitting={isSubmitting} />
            <ProviderSection
              isSubmitting={isSubmitting}
              providers={providerContracts}
              response={providersResponse}
              selectedProvider={selectedProvider?.provider ?? ''}
              onRetry={refreshProviders}
              onSelectProvider={handleSelectProvider}
            />
            <CredentialSection
              form={form}
              isSubmitting={isSubmitting}
              provider={selectedProvider}
            />
          </main>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <ReviewCard
              values={values}
              provider={selectedProvider}
              hasValidDomain={isValidDomain(values.domain ?? '')}
            />
            <ReadinessCard values={values} provider={selectedProvider} />
            <SecurityCard />
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-2 flex flex-col-reverse gap-2 border-t bg-background/95 px-2 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
          <DomainCreateActions
            formId={DOMAIN_CREATE_FORM_ID}
            isSubmitting={isSubmitting}
            disabled={!canSubmit}
            onCancel={handleBackToDomains}
          />
        </div>
      </form>
    </>
  );
}

function DomainCreateActions(props: {
  formId: string;
  isSubmitting: boolean;
  disabled?: boolean;
  onCancel: () => void;
}) {
  const { disabled, formId, isSubmitting, onCancel } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <Button asChild buttonStyle="outline" buttonColor="secondary">
        <button type="button" disabled={isSubmitting} onClick={onCancel}>
          {t('common.actions.cancel')}
        </button>
      </Button>
      <Button asChild>
        <button type="submit" form={formId} disabled={isSubmitting || disabled}>
          {isSubmitting && <Spinner size="sm" className="text-current" />}
          <span>
            {isSubmitting
              ? t('page.domainCreate.actions.creating')
              : t('page.domainCreate.actions.create')}
          </span>
        </button>
      </Button>
    </div>
  );
}

function SetupProgress(props: {
  values: Partial<DomainCreateForm>;
  provider?: ProviderContract;
}) {
  const { provider, values } = props;
  const t = useDevetekTranslations();

  const steps = [
    {
      key: 'domain',
      complete: isValidDomain(values.domain ?? ''),
      icon: CircleDotIcon,
    },
    {
      key: 'provider',
      complete: Boolean(values.provider),
      icon: ShieldCheckIcon,
    },
    {
      key: 'credentials',
      complete: hasUsableCredential(values, provider),
      icon: KeyRoundIcon,
    },
    {
      key: 'review',
      complete:
        isValidDomain(values.domain ?? '') &&
        Boolean(values.provider) &&
        hasUsableCredential(values, provider),
      icon: CheckCircle2Icon,
    },
  ] as const;

  const activeIndex = Math.max(
    steps.findIndex((step) => !step.complete),
    0,
  );
  const completeCount = steps.filter((step) => step.complete).length;
  const progress = (completeCount / steps.length) * 100;

  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {t('page.domainCreate.progress.title')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('page.domainCreate.progress.description')}
          </p>
        </div>

        <div className="w-full lg:w-64">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const StepIcon = step.complete ? CheckCircle2Icon : step.icon;
          const isActive = index === activeIndex;

          return (
            <div
              key={step.key}
              className={cn(
                'rounded-md border p-3',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent bg-background',
                step.complete && 'border-emerald-500/40 text-emerald-400',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-7 items-center justify-center rounded-md border bg-card',
                    isActive &&
                      'border-primary bg-primary text-primary-foreground',
                    step.complete &&
                      'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
                  )}
                >
                  <StepIcon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold uppercase text-muted-foreground">
                    {t(`page.domainCreate.steps.${step.key}.eyebrow`)}
                  </span>
                  <span className="block text-sm font-semibold text-foreground">
                    {t(`page.domainCreate.steps.${step.key}.title`)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {t(`page.domainCreate.steps.${step.key}.description`)}
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function DomainIdentitySection(props: {
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  isSubmitting: boolean;
}) {
  const { form, isSubmitting } = props;
  const t = useDevetekTranslations();
  const tAll = useDevetekTranslations();

  return (
    <SectionCard
      icon={CircleDotIcon}
      title={t('page.domainCreate.sections.identity.title')}
      description={t('page.domainCreate.sections.identity.description')}
    >
      <div className="grid gap-4">
        <div>
          <FieldLabel
            htmlFor="domain-create-domain"
            label={t('page.domainCreate.fields.domain.label')}
            description={t('page.domainCreate.fields.domain.description')}
            required
          />
          <Input
            id="domain-create-domain"
            placeholder={t('page.domainCreate.fields.domain.placeholder')}
            autoComplete="off"
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.domain)}
            {...form.register('domain')}
          />
          <ErrorInline
            t={tAll}
            message={form.formState.errors.domain?.message}
          />
        </div>

        <div>
          <FieldLabel
            htmlFor="domain-create-description"
            label={t('page.domainCreate.fields.description.label')}
            description={t('page.domainCreate.fields.description.description')}
          />
          <TextArea
            id="domain-create-description"
            className="min-h-24 resize-y"
            placeholder={t('page.domainCreate.fields.description.placeholder')}
            disabled={isSubmitting}
            {...form.register('description')}
          />
        </div>
      </div>
    </SectionCard>
  );
}

function ProviderSection(props: {
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
    <SectionCard
      icon={ShieldCheckIcon}
      title={t('page.domainCreate.sections.provider.title')}
      description={t('page.domainCreate.sections.provider.description')}
    >
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
    </SectionCard>
  );
}

function CredentialSection(props: {
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  isSubmitting: boolean;
  provider?: ProviderContract;
}) {
  const { form, isSubmitting, provider } = props;
  const t = useDevetekTranslations();
  const credentialFields = getCredentialFields(provider);
  const credentialRules = provider?.credential_rules ?? [];

  return (
    <SectionCard
      icon={KeyRoundIcon}
      title={t('page.domainCreate.sections.credentials.title')}
      description={t('page.domainCreate.sections.credentials.description')}
    >
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
    </SectionCard>
  );
}

function CredentialInput(props: {
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

function ReviewCard(props: {
  values: Partial<DomainCreateForm>;
  provider?: ProviderContract;
  hasValidDomain: boolean;
}) {
  const { hasValidDomain, provider, values } = props;
  const t = useDevetekTranslations();
  const displayDomain = values.domain
    ? normalizeDomainInput(values.domain)
    : t('page.domainCreate.review.pending');

  return (
    <Card className="rounded-lg">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-md border bg-background text-primary">
            <CheckCircle2Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold">
              {t('page.domainCreate.review.title')}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {t('page.domainCreate.review.description')}
            </p>
          </div>
        </div>
      </div>
      <div className="space-y-3 p-4">
        <ReviewRow
          label={t('page.domainCreate.review.domain')}
          value={displayDomain}
          status={hasValidDomain ? 'ready' : 'pending'}
        />
        <ReviewRow
          label={t('page.domainCreate.review.provider')}
          value={
            provider
              ? getProviderLabel(provider)
              : t('page.domainCreate.review.pending')
          }
          status={provider ? 'ready' : 'pending'}
        />
        <ReviewRow
          label={t('page.domainCreate.review.credentials')}
          value={
            hasUsableCredential(values, provider)
              ? t('page.domainCreate.review.credentialsReady')
              : t('page.domainCreate.review.pending')
          }
          status={hasUsableCredential(values, provider) ? 'ready' : 'pending'}
        />
      </div>
    </Card>
  );
}

function ReadinessCard(props: {
  values: Partial<DomainCreateForm>;
  provider?: ProviderContract;
}) {
  const { provider, values } = props;
  const t = useDevetekTranslations();

  const items = [
    {
      label: t('page.domainCreate.checklist.domain'),
      complete: isValidDomain(values.domain ?? ''),
    },
    {
      label: t('page.domainCreate.checklist.provider'),
      complete: Boolean(values.provider),
    },
    {
      label: t('page.domainCreate.checklist.credentials'),
      complete: hasUsableCredential(values, provider),
    },
    {
      label: t('page.domainCreate.checklist.redaction'),
      complete: true,
    },
  ];

  return (
    <Card className="rounded-lg">
      <div className="border-b p-4">
        <h2 className="text-sm font-semibold">
          {t('page.domainCreate.checklist.title')}
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('page.domainCreate.checklist.description')}
        </p>
      </div>
      <div className="space-y-2 p-4">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-sm">
            <CheckCircle2Icon
              className={cn(
                'size-4 shrink-0',
                item.complete ? 'text-emerald-400' : 'text-muted-foreground',
              )}
            />
            <span
              className={cn(
                item.complete ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function SecurityCard() {
  const t = useDevetekTranslations();

  return (
    <Card className="rounded-lg border-primary/20 bg-primary/5">
      <div className="flex items-start gap-3 p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
          <LockKeyholeIcon className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold">
            {t('page.domainCreate.security.title')}
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('page.domainCreate.security.description')}
          </p>
        </div>
      </div>
    </Card>
  );
}

function SectionCard(props: {
  icon: ComponentType<LucideProps>;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { children, description, icon: Icon, title } = props;

  return (
    <Card className="rounded-lg">
      <div className="border-b p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
      </div>
      <div className="p-4">{children}</div>
    </Card>
  );
}

function FieldLabel(props: {
  htmlFor: string;
  label: string;
  description?: string;
  required?: boolean;
}) {
  const { description, htmlFor, label, required } = props;

  return (
    <label className="mb-1.5 block" htmlFor={htmlFor}>
      <span className="block text-sm font-semibold">
        {label}
        {required && <span className="text-destructive">*</span>}
      </span>
      {description && (
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      )}
    </label>
  );
}

function ReviewRow(props: {
  label: string;
  value: string;
  status: 'pending' | 'ready';
}) {
  const { label, status, value } = props;
  const t = useDevetekTranslations();

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="min-w-0">
          <span className="block text-xs font-semibold uppercase text-muted-foreground">
            {label}
          </span>
          <span className="mt-1 block break-words text-sm font-medium">
            {value}
          </span>
        </span>
        <Badge
          variant={status === 'ready' ? 'default' : 'outline'}
          className={cn(
            'shrink-0',
            status === 'ready' && 'bg-emerald-500 text-white',
          )}
        >
          {status === 'ready'
            ? t('page.domainCreate.review.ready')
            : t('page.domainCreate.review.pending')}
        </Badge>
      </div>
    </div>
  );
}

function hasUsableCredential(
  values: Partial<DomainCreateForm>,
  provider?: ProviderContract,
) {
  if (!provider) return false;

  const credentials = values.credentials ?? {};

  const requiredFieldsSatisfied = getCredentialFields(provider)
    .filter((field) => field.required)
    .every((field) => isCredentialFieldFilled(credentials, field.key));

  if (!requiredFieldsSatisfied) return false;

  return (provider.credential_rules ?? []).every((rule) =>
    isCredentialRuleSatisfied(rule, credentials),
  );
}

function getProviderContracts(
  response: ReturnType<typeof ApiDomain.Providers.useGet>[0],
) {
  if (response.$status === 'success') {
    return normalizeProviderContracts(response.providers);
  }

  if (response.$status === 'loading') {
    return normalizeProviderContracts(response.prevData?.providers);
  }

  return [];
}

function normalizeProviderContracts(providers?: ProviderContract[]) {
  return (providers ?? []).filter((provider) => !!provider.provider);
}

function getCredentialFields(provider?: ProviderContract) {
  return (provider?.credential_fields ?? []).filter((field) => !!field.key);
}

function getProviderLabel(provider: ProviderContract) {
  return provider.label || provider.provider || 'Unknown provider';
}

function renderProviderDescription(
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

function renderCredentialRequirement(
  provider: ProviderContract,
  t: ReturnType<typeof useDevetekTranslations>,
) {
  const requiredFields = getCredentialFields(provider).filter(
    (field) => field.required,
  );

  if (requiredFields.length < 1) {
    return t('page.domainCreate.providerMetadata.noRequired');
  }

  return t('page.domainCreate.providerMetadata.requiredCount', {
    count: requiredFields.length,
  });
}

function ProviderSelectOption(props: { provider: ProviderContract }) {
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

function ProviderIconMark(props: { provider: ProviderContract }) {
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

function ProviderMetadataLoading() {
  return (
    <div className="space-y-3">
      <div className="h-14 animate-pulse rounded-lg border bg-background" />
      <div className="h-24 animate-pulse rounded-lg border bg-background" />
    </div>
  );
}

function shouldRenderTextarea(field: ProviderField) {
  const type = field.type?.toLowerCase();
  return type === 'textarea' || type === 'multiline';
}

function buildCredentialPayload(
  provider: ProviderContract,
  values: DomainCreateForm,
) {
  const credentials = values.credentials;
  const payload: Record<string, string> = {};

  for (const field of getCredentialFields(provider)) {
    const fieldKey = field.key;
    if (!fieldKey) continue;

    const value = credentials[fieldKey]?.trim();
    if (value) payload[fieldKey] = value;
  }

  return payload;
}

function validateCredentialRequirements(
  provider: ProviderContract,
  values: DomainCreateForm,
  form: ReturnType<typeof useForm<DomainCreateForm>>,
) {
  const credentials = values.credentials;
  let isValid = true;

  for (const field of getCredentialFields(provider)) {
    if (!field.required || isCredentialFieldFilled(credentials, field.key)) {
      continue;
    }

    form.setError(`credentials.${field.key}` as const, {
      type: 'required',
      message: 'formErrors.required',
    });
    isValid = false;
  }

  for (const rule of provider.credential_rules ?? []) {
    if (isCredentialRuleSatisfied(rule, credentials)) continue;

    for (const fieldKey of getCredentialRuleFieldKeys(rule)) {
      form.setError(`credentials.${fieldKey}` as const, {
        type: 'required',
        message: rule.message || 'Required',
      });
    }
    isValid = false;
  }

  return isValid;
}

function isCredentialFieldFilled(
  credentials: Partial<Record<string, string | undefined>>,
  fieldKey?: string,
) {
  if (!fieldKey) return false;
  return Boolean(credentials[fieldKey]?.trim());
}

function isCredentialRuleSatisfied(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
  credentials: Partial<Record<string, string | undefined>>,
) {
  if (rule.type !== 'one_of') return true;

  return (rule.fields ?? []).some((fieldGroup) =>
    fieldGroup
      .split('+')
      .map((field) => field.trim())
      .filter(Boolean)
      .every((field) => isCredentialFieldFilled(credentials, field)),
  );
}

function getCredentialRuleFieldKeys(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
) {
  return (rule.fields ?? [])
    .flatMap((fieldGroup) => fieldGroup.split('+'))
    .map((field) => field.trim())
    .filter(Boolean);
}

function renderCredentialRule(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
) {
  return [rule.type, ...(rule.fields ?? [])].filter(Boolean).join(': ');
}

function normalizeDomainInput(value: string) {
  return value
    .trim()
    .replace(/^[a-z]+:\/\//i, '')
    .replace(/[/?#].*$/, '')
    .toLowerCase();
}

function isValidDomain(value: string) {
  const normalizedValue = normalizeDomainInput(value);
  const parsed = tldts.parse(normalizedValue);

  return Boolean(
    parsed.hostname && parsed.publicSuffix && parsed.domainWithoutSuffix,
  );
}
