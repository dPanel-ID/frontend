import type { ComponentType, ReactNode } from 'react';
import { useMemo, useState } from 'react';

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

import { SchemaDomainParts } from '@/entities/domain/rules/schema';

import { ApiDomain } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import IconBrandCloudflare from '@/shared/presentation/icons/BrandCloudflare';
import IconBrandDigitalOcean from '@/shared/presentation/icons/BrandDigitalOcean';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

export const Route = createFileRoute(
  '/_with-app-layout/backend/domain/create/',
)({
  component: DomainCreatePage,
});

const PROVIDER_VALUES = [
  SchemaDomainParts.ProviderIdent.cloudflare,
  SchemaDomainParts.ProviderIdent.digitalOcean,
] as const;
const DOMAIN_CREATE_FORM_ID = 'domain-create-form';

const schemaDomainCreateForm = z
  .object({
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
    provider: z.enum(PROVIDER_VALUES),
    apiToken: z.string().trim().min(1, 'formErrors.required'),
    zoneId: z.string().trim().optional(),
  })
  .superRefine((data, ctx) => {
    if (
      data.provider === SchemaDomainParts.ProviderIdent.cloudflare &&
      !data.zoneId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['zoneId'],
        message: 'formErrors.required',
      });
    }
  });

type DomainCreateForm = z.output<typeof schemaDomainCreateForm>;
type ProviderValue = (typeof PROVIDER_VALUES)[number];
type ProviderOption = {
  value: ProviderValue;
  icon: ComponentType<LucideProps>;
  name: string;
  badge: string;
  description: string;
};

function DomainCreatePage() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const providerOptions = useMemo<ProviderOption[]>(
    () => [
      {
        value: SchemaDomainParts.ProviderIdent.cloudflare,
        icon: IconBrandCloudflare,
        name: t('page.domainCreate.providers.cloudflare.name'),
        badge: t('page.domainCreate.providers.cloudflare.badge'),
        description: t('page.domainCreate.providers.cloudflare.description'),
      },
      {
        value: SchemaDomainParts.ProviderIdent.digitalOcean,
        icon: IconBrandDigitalOcean,
        name: t('page.domainCreate.providers.digitalOcean.name'),
        badge: t('page.domainCreate.providers.digitalOcean.badge'),
        description: t('page.domainCreate.providers.digitalOcean.description'),
      },
    ],
    [t],
  );

  const form = useForm<DomainCreateForm>({
    resolver: zodResolver(schemaDomainCreateForm),
    mode: 'onTouched',
    defaultValues: {
      domain: '',
      description: '',
      provider: SchemaDomainParts.ProviderIdent.cloudflare,
      apiToken: '',
      zoneId: '',
    },
  });

  const values = useWatch({ control: form.control });
  const selectedProvider =
    providerOptions.find((option) => option.value === values.provider) ??
    providerOptions[0]!;

  const handleBackToDomains = () => {
    navigate({
      to: '/backend/domain',
      search: {
        page: 1,
        viewMode: 'auto',
      },
    });
  };

  const handleSelectProvider = (provider: ProviderValue) => {
    form.setValue('provider', provider, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (provider === SchemaDomainParts.ProviderIdent.digitalOcean) {
      form.setValue('zoneId', '', {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const handleSubmit = form.handleSubmit(async (formValues) => {
    setIsSubmitting(true);

    try {
      const resolvedZoneId =
        formValues.provider === SchemaDomainParts.ProviderIdent.digitalOcean
          ? formValues.domain
          : formValues.zoneId!;

      const response = await ApiDomain.Create.doPost({
        domain: formValues.domain,
        description: formValues.description?.trim() || undefined,
        provider: formValues.provider,
        credential: {
          api_token: formValues.apiToken,
          zone_id: resolvedZoneId,
        },
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
            onCancel={handleBackToDomains}
          />
        }
      />

      <form
        id={DOMAIN_CREATE_FORM_ID}
        className="mt-6 flex flex-col gap-4"
        onSubmit={handleSubmit}
      >
        <SetupProgress values={values} />

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <main className="flex min-w-0 flex-col gap-4">
            <DomainIdentitySection form={form} isSubmitting={isSubmitting} />
            <ProviderSection
              isSubmitting={isSubmitting}
              options={providerOptions}
              selectedProvider={selectedProvider.value}
              onSelectProvider={handleSelectProvider}
            />
            <CredentialSection
              form={form}
              isSubmitting={isSubmitting}
              provider={selectedProvider.value}
            />
          </main>

          <aside className="flex min-w-0 flex-col gap-4 xl:sticky xl:top-4 xl:self-start">
            <ReviewCard
              values={values}
              provider={selectedProvider}
              hasValidDomain={isValidDomain(values.domain ?? '')}
            />
            <ReadinessCard values={values} />
            <SecurityCard />
          </aside>
        </div>

        <div className="sticky bottom-0 z-10 -mx-2 flex flex-col-reverse gap-2 border-t bg-background/95 px-2 py-3 backdrop-blur sm:flex-row sm:items-center sm:justify-end">
          <DomainCreateActions
            formId={DOMAIN_CREATE_FORM_ID}
            isSubmitting={isSubmitting}
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
  onCancel: () => void;
}) {
  const { formId, isSubmitting, onCancel } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex w-full flex-col-reverse gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
      <Button asChild buttonStyle="outline" buttonColor="secondary">
        <button type="button" disabled={isSubmitting} onClick={onCancel}>
          {t('common.actions.cancel')}
        </button>
      </Button>
      <Button asChild>
        <button type="submit" form={formId} disabled={isSubmitting}>
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

function SetupProgress(props: { values: Partial<DomainCreateForm> }) {
  const { values } = props;
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
      complete: hasUsableCredential(values),
      icon: KeyRoundIcon,
    },
    {
      key: 'review',
      complete:
        isValidDomain(values.domain ?? '') &&
        Boolean(values.provider) &&
        hasUsableCredential(values),
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
  options: ProviderOption[];
  selectedProvider: ProviderValue;
  isSubmitting: boolean;
  onSelectProvider: (provider: ProviderValue) => void;
}) {
  const { isSubmitting, onSelectProvider, options, selectedProvider } = props;
  const t = useDevetekTranslations();

  return (
    <SectionCard
      icon={ShieldCheckIcon}
      title={t('page.domainCreate.sections.provider.title')}
      description={t('page.domainCreate.sections.provider.description')}
    >
      <div className="grid gap-3 md:grid-cols-2">
        {options.map((option) => {
          const Icon = option.icon;
          const isSelected = option.value === selectedProvider;

          return (
            <button
              key={option.value}
              type="button"
              disabled={isSubmitting}
              aria-pressed={isSelected}
              onClick={() => onSelectProvider(option.value)}
              className={cn(
                'rounded-lg border bg-background p-4 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                isSelected
                  ? 'border-primary bg-primary/10'
                  : 'hover:border-primary/45 hover:bg-primary/5',
                isSubmitting && 'cursor-not-allowed opacity-60',
              )}
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-card">
                    <Icon className="size-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">
                      {option.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {option.badge}
                    </span>
                  </span>
                </span>
                {isSelected && (
                  <CheckCircle2Icon className="mt-1 size-4 shrink-0 text-primary" />
                )}
              </span>
              <span className="mt-4 block text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function CredentialSection(props: {
  form: ReturnType<typeof useForm<DomainCreateForm>>;
  provider: ProviderValue;
  isSubmitting: boolean;
}) {
  const { form, isSubmitting, provider } = props;
  const t = useDevetekTranslations();
  const tAll = useDevetekTranslations();
  const isCloudflare = provider === SchemaDomainParts.ProviderIdent.cloudflare;

  return (
    <SectionCard
      icon={KeyRoundIcon}
      title={t('page.domainCreate.sections.credentials.title')}
      description={t('page.domainCreate.sections.credentials.description')}
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="flex min-w-0 flex-col gap-4">
          <div>
            <FieldLabel
              htmlFor="domain-create-token"
              label={t('page.domainCreate.fields.token.label')}
              description={t('page.domainCreate.fields.token.description')}
              required
            />
            <TextArea
              id="domain-create-token"
              className="min-h-28 resize-y font-mono text-xs"
              placeholder={t('page.domainCreate.fields.token.placeholder')}
              autoComplete="off"
              spellCheck={false}
              disabled={isSubmitting}
              aria-invalid={Boolean(form.formState.errors.apiToken)}
              {...form.register('apiToken')}
            />
            <ErrorInline
              t={tAll}
              message={form.formState.errors.apiToken?.message}
            />
          </div>

          {isCloudflare && (
            <div>
              <FieldLabel
                htmlFor="domain-create-zone"
                label={t('page.domainCreate.fields.zoneId.label')}
                description={t('page.domainCreate.fields.zoneId.description')}
                required
              />
              <Input
                id="domain-create-zone"
                placeholder={t('page.domainCreate.fields.zoneId.placeholder')}
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={Boolean(form.formState.errors.zoneId)}
                {...form.register('zoneId')}
              />
              <ErrorInline
                t={tAll}
                message={form.formState.errors.zoneId?.message}
              />
            </div>
          )}
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
                {isCloudflare
                  ? t('page.domainCreate.credentialHelp.cloudflare')
                  : t('page.domainCreate.credentialHelp.digitalOcean')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

function ReviewCard(props: {
  values: Partial<DomainCreateForm>;
  provider: ProviderOption;
  hasValidDomain: boolean;
}) {
  const { hasValidDomain, provider, values } = props;
  const t = useDevetekTranslations();
  const isCloudflare =
    values.provider === SchemaDomainParts.ProviderIdent.cloudflare;
  const displayDomain = values.domain
    ? normalizeDomainInput(values.domain)
    : t('page.domainCreate.review.pending');
  const zoneValue = isCloudflare
    ? values.zoneId
      ? t('page.domainCreate.review.zoneReady')
      : t('page.domainCreate.review.pending')
    : isValidDomain(values.domain ?? '')
      ? t('page.domainCreate.review.zoneDerived')
      : t('page.domainCreate.review.pending');
  const zoneStatus = isCloudflare
    ? Boolean(values.zoneId)
    : isValidDomain(values.domain ?? '');

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
          value={provider.name}
          status="ready"
        />
        <ReviewRow
          label={t('page.domainCreate.review.zone')}
          value={zoneValue}
          status={zoneStatus ? 'ready' : 'pending'}
        />
        <ReviewRow
          label={t('page.domainCreate.review.credentials')}
          value={
            values.apiToken
              ? t('page.domainCreate.review.credentialsReady')
              : t('page.domainCreate.review.pending')
          }
          status={values.apiToken ? 'ready' : 'pending'}
        />
      </div>
    </Card>
  );
}

function ReadinessCard(props: { values: Partial<DomainCreateForm> }) {
  const { values } = props;
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
      complete: hasUsableCredential(values),
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

function hasUsableCredential(values: Partial<DomainCreateForm>) {
  const hasToken = Boolean(values.apiToken?.trim());

  if (!hasToken) return false;

  if (values.provider === SchemaDomainParts.ProviderIdent.digitalOcean) {
    return isValidDomain(values.domain ?? '');
  }

  return Boolean(values.zoneId?.trim());
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
