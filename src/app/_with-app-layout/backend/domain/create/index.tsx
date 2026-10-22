import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  CircleDotIcon,
  GlobeIcon,
  KeyRoundIcon,
  LoaderCircleIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiDomain } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { ReviewPanel } from '@/shared/presentation/organisms/ReviewPanel';
import type { ReviewPanelRow } from '@/shared/presentation/organisms/ReviewPanel';
import { StepCard } from '@/shared/presentation/organisms/StepCard';

import {
  getCredentialFields,
  getProviderContracts,
  getProviderLabel,
  hasUsableCredential,
  isCredentialFieldFilled,
} from './-lib/providers';
import { isValidDomain, schemaDomainCreateForm } from './-rules/form';
import type { DomainCreateForm } from './-rules/form';
import useCreateDomain from './-usecase/use-create-domain';
import { SecurityCard } from './-view/-presentation/fields';
import { CredentialSection } from './-view/SectionCredentials';
import { DomainIdentitySection } from './-view/SectionDomain';
import { ProviderSection } from './-view/SectionProvider';

export const Route = createFileRoute(
  '/_with-app-layout/backend/domain/create/',
)({
  head: () => ({
    meta: [{ title: 'Add a domain | dnocs' }],
  }),
  component: DomainCreatePage,
});

function DomainCreatePage() {
  const t = useDevetekTranslations();

  return (
    <>
      <title>{t('page.domainCreate.documentTitle')}</title>

      <div className="flex flex-col gap-4">
        <FlowHero
          accent="sky"
          icon={GlobeIcon}
          headnote={
            <Breadcrumb
              items={[
                { text: t('sidebar.dashboard'), url: '/dashboard' },
                { text: t('sidebar.backend') },
                {
                  text: t('page.domain.headerTitle'),
                  url: '/backend/domain',
                },
              ]}
            />
          }
          title={t('page.domainCreate.headerTitle')}
          description={t('page.domainCreate.headerDesc')}
        />

        <CreateFlow />
      </div>
    </>
  );
}

type StepKey = 'identity' | 'provider' | 'credentials';

function CreateFlow() {
  const t = useDevetekTranslations();
  const [providersResponse, refreshProviders] = ApiDomain.Providers.useGet();
  const { backToDomains, create, isSubmitting } = useCreateDomain();

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

  // The catalog decides the default provider, so the form follows it once
  // it arrives rather than holding a provider the backend does not offer.
  useEffect(() => {
    const firstProvider = providerContracts[0]?.provider;
    if (!firstProvider) return;
    if (providerContracts.some((p) => p.provider === values.provider)) return;

    form.setValue('provider', firstProvider, {
      shouldDirty: false,
      shouldValidate: true,
    });
    form.setValue('credentials', {}, { shouldDirty: false });
    form.clearErrors('credentials');
  }, [form, providerContracts, values.provider]);

  const handleSelectProvider = (provider: string) => {
    if (form.getValues('provider') === provider) return;

    form.setValue('provider', provider, {
      shouldDirty: true,
      shouldValidate: true,
    });
    form.setValue('credentials', {}, { shouldDirty: true });
    form.clearErrors('credentials');
  };

  const domainReady = isValidDomain(values.domain ?? '');
  const credentialsReady = Boolean(
    selectedProvider && hasUsableCredential(values, selectedProvider),
  );
  // How many fields the user actually filled, not how many exist.
  const credentialCount = selectedProvider
    ? getCredentialFields(selectedProvider).filter((field) =>
        isCredentialFieldFilled(values.credentials ?? {}, field.key),
      ).length
    : 0;

  const rows: ReviewPanelRow[] = [
    {
      key: 'domain',
      label: t('page.domainCreate.review.domain'),
      value: domainReady ? values.domain : undefined,
      done: domainReady,
    },
    {
      key: 'provider',
      label: t('page.domainCreate.review.provider'),
      value: selectedProvider ? getProviderLabel(selectedProvider) : undefined,
      done: Boolean(selectedProvider),
    },
    {
      key: 'credentials',
      label: t('page.domainCreate.review.credentials'),
      value: credentialsReady
        ? t('page.domainCreate.review.credentialsReady', {
            count: credentialCount,
          })
        : undefined,
      done: credentialsReady,
    },
  ];

  const steps: Array<{
    key: StepKey;
    icon: LucideIcon;
    title: string;
    description: string;
    done: boolean;
    content: ReactNode;
  }> = [
    {
      key: 'identity',
      icon: CircleDotIcon,
      title: t('page.domainCreate.sections.identity.title'),
      description: t('page.domainCreate.sections.identity.description'),
      done: domainReady,
      content: (
        <DomainIdentitySection form={form} isSubmitting={isSubmitting} />
      ),
    },
    {
      key: 'provider',
      icon: ShieldCheckIcon,
      title: t('page.domainCreate.sections.provider.title'),
      description: t('page.domainCreate.sections.provider.description'),
      done: Boolean(selectedProvider),
      content: (
        <ProviderSection
          isSubmitting={isSubmitting}
          providers={providerContracts}
          response={providersResponse}
          selectedProvider={selectedProvider?.provider ?? ''}
          onRetry={refreshProviders}
          onSelectProvider={handleSelectProvider}
        />
      ),
    },
    {
      key: 'credentials',
      icon: KeyRoundIcon,
      title: t('page.domainCreate.sections.credentials.title'),
      description: t('page.domainCreate.sections.credentials.description'),
      done: credentialsReady,
      content: (
        <CredentialSection
          form={form}
          isSubmitting={isSubmitting}
          provider={selectedProvider}
        />
      ),
    },
  ];

  const activeStep = steps.find((step) => !step.done)?.key;
  const ready = rows.every((row) => row.done) && Boolean(selectedProvider);

  const submit = form.handleSubmit((submitted) => {
    if (!selectedProvider) return;
    return create(submitted, selectedProvider);
  });

  return (
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={backToDomains}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('page.domainCreate.backToList')}
      </button>

      <form
        onSubmit={submit}
        className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]"
      >
        <div className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <StepCard
              key={step.key}
              number={index + 1}
              icon={step.icon}
              title={step.title}
              description={step.description}
              done={step.done}
              active={activeStep === step.key}
            >
              {step.content}
            </StepCard>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <ReviewPanel
            eyebrow={t('page.domainCreate.review.eyebrow')}
            title={t('page.domainCreate.review.title')}
            readyTitle={t('page.domainCreate.review.readyTitle')}
            rows={rows}
            footnote={t('page.domainCreate.review.footnote')}
            action={
              <button
                type="submit"
                disabled={!ready || isSubmitting}
                className={cn(flowCtaClassName('sky'), 'w-full')}
              >
                {isSubmitting ? (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                ) : (
                  <GlobeIcon className="size-4" />
                )}
                {t('page.domainCreate.submit')}
              </button>
            }
          />

          <SecurityCard />
        </div>
      </form>
    </div>
  );
}
