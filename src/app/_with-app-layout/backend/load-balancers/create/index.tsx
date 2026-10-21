import { useMemo } from 'react';
import type { ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  FileTextIcon,
  Globe2Icon,
  LoaderCircleIcon,
  NetworkIcon,
  RouteIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { schemaLoadBalancerCreationForm } from '@/features/load-balancer-creation-sidepanel';
import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';

import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { ReviewPanel } from '@/shared/presentation/organisms/ReviewPanel';
import type { ReviewPanelRow } from '@/shared/presentation/organisms/ReviewPanel';
import { StepCard } from '@/shared/presentation/organisms/StepCard';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { getSelectedServer, getServerName } from './-lib/modules';
import { getRoutePreviewItems } from './-lib/payload';
import { DEFAULT_VALUES } from './-model/form';
import { useLoadBalancerCreateResources } from './-model/resources';
import useCreateLoadBalancer from './-usecase/use-create';
import { DomainField } from './-view/SectionDomain';
import { EnginePicker, ServerPicker } from './-view/SectionGateway';
import {
  FeatureConfiguration,
  L4RuleBuilder,
  L7RulesBuilder,
  RoutingModePicker,
} from './-view/SectionRouting';

export const Route = createFileRoute(
  '/_with-app-layout/backend/load-balancers/create/',
)({
  component: CreateLoadBalancerPage,
});

function CreateLoadBalancerPage() {
  const t = useDevetekTranslations();

  return (
    <>
      <title>{t('page.loadBalancersCreate.documentTitle')}</title>

      <div className="flex flex-col gap-4">
        <FlowHero
          accent="sky"
          icon={NetworkIcon}
          headnote={
            <Breadcrumb
              items={[
                { text: t('sidebar.dashboard'), url: '/dashboard' },
                {
                  text: t('sidebar.loadBalancers'),
                  url: '/backend/load-balancers',
                },
              ]}
            />
          }
          title={t('page.loadBalancersCreate.headerTitle')}
          description={t('page.loadBalancersCreate.headerDesc')}
          aside={
            <a
              href={LINK__DOCUMENTATION}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background"
            >
              <FileTextIcon className="size-4" />
              {t('page.loadBalancers.docs')}
            </a>
          }
        />

        <CreateFlow />
      </div>
    </>
  );
}

type StepKey = 'gateway' | 'domain' | 'routing';

/** The review rows each step owns; a step is done when all of them are. */
const STEP_ROWS: Record<StepKey, string[]> = {
  gateway: ['server', 'engine'],
  domain: ['domain', 'https'],
  routing: ['mode', 'routes'],
};

function CreateFlow() {
  const t = useDevetekTranslations();

  const form = useForm<LoadBalancerCreationFormValues>({
    resolver: zodResolver(schemaLoadBalancerCreationForm),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const values = useWatch({ control: form.control });
  const resources = useLoadBalancerCreateResources(
    values.serverId,
    values.engine,
  );
  const { create, isSubmitting } = useCreateLoadBalancer();

  // One validation pass drives every "done" state, so the panel can never
  // disagree with what the form will accept.
  const { issuePaths, valid } = useMemo(() => {
    const result = schemaLoadBalancerCreationForm.safeParse(values);
    const paths: string[] = [];

    if (!result.success) {
      for (const issue of result.error.issues) {
        paths.push(issue.path.map(String).join('.'));
      }
    }

    return { issuePaths: paths, valid: result.success };
  }, [values]);

  const clean = (...fields: string[]) =>
    fields.every(
      (field) =>
        !issuePaths.some(
          (path) => path === field || path.startsWith(field + '.'),
        ),
    );

  const formValues = values as Partial<LoadBalancerCreationFormValues>;
  const selectedServer = getSelectedServer(resources, formValues.serverId);
  const engineLabel = resources.selectedEngineRuntimeItem?.title;
  const routes = getRoutePreviewItems(
    formValues,
    resources.applications.$status === 'success'
      ? resources.applications.list
      : [],
  );
  const engineReady = Boolean(resources.selectedEngineRuntimeItem);

  const rows: ReviewPanelRow[] = [
    {
      key: 'server',
      label: t('page.loadBalancersCreate.review.server'),
      value: selectedServer ? getServerName(selectedServer) : undefined,
      done: Boolean(values.serverId) && clean('serverId'),
    },
    {
      key: 'engine',
      label: t('page.loadBalancersCreate.review.engine'),
      value: engineLabel ?? values.engine,
      done: Boolean(values.engine) && engineReady && clean('engine'),
    },
    {
      key: 'domain',
      label: t('page.loadBalancersCreate.review.domain'),
      value: values.domain,
      done: Boolean(values.domain) && clean('domain'),
    },
    {
      key: 'https',
      label: t('page.loadBalancersCreate.review.https'),
      value: values.features?.sslEnabled
        ? t('page.loadBalancersCreate.review.httpsOn')
        : t('page.loadBalancersCreate.review.httpsOff'),
      done: Boolean(values.domain),
    },
    {
      key: 'mode',
      label: t('page.loadBalancersCreate.review.mode'),
      value: values.lbKind?.toUpperCase(),
      done: Boolean(values.lbKind) && clean('lbKind', 'features'),
    },
    {
      key: 'routes',
      label: t('page.loadBalancersCreate.review.routes'),
      value:
        routes.length > 0
          ? t('page.loadBalancers.xRules', { length: routes.length })
          : undefined,
      done: routes.length > 0 && clean('l7rules', 'l4rule'),
    },
  ];

  const stepDone = (step: StepKey) =>
    rows
      .filter((row) => STEP_ROWS[step].includes(row.key))
      .every((r) => r.done);

  const steps: Array<{
    key: StepKey;
    icon: LucideIcon;
    title: string;
    description: string;
    content: ReactNode;
  }> = [
    {
      key: 'gateway',
      icon: ServerIcon,
      title: t('page.loadBalancersCreate.steps.gateway.title'),
      description: t('page.loadBalancersCreate.steps.gateway.description'),
      content: (
        <div className="flex flex-col gap-6">
          <ServerPicker form={form} resources={resources} />
          <EnginePicker form={form} resources={resources} />
        </div>
      ),
    },
    {
      key: 'domain',
      icon: Globe2Icon,
      title: t('page.loadBalancersCreate.steps.domain.title'),
      description: t('page.loadBalancersCreate.steps.domain.description'),
      content: (
        <div className="flex flex-col gap-6">
          <DomainField form={form} domains={resources.domains} />
          <FeatureConfiguration form={form} />
        </div>
      ),
    },
    {
      key: 'routing',
      icon: RouteIcon,
      title: t('page.loadBalancersCreate.steps.routing.title'),
      description: t('page.loadBalancersCreate.steps.routing.description'),
      content: (
        <div className="flex flex-col gap-6">
          <RoutingModePicker form={form} />
          {values.lbKind === 'l4' ? (
            <L4RuleBuilder form={form} />
          ) : (
            <L7RulesBuilder form={form} />
          )}
        </div>
      ),
    },
  ];

  const activeStep = steps.find((step) => !stepDone(step.key))?.key;
  const ready = valid && engineReady;

  const submit = form.handleSubmit((submitted) =>
    create(submitted, resources.selectedEngineRuntimeItem),
  );

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/backend/load-balancers"
        search={{ page: 1, viewMode: 'auto' }}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('page.loadBalancersCreate.backToList')}
      </Link>

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
              done={stepDone(step.key)}
              active={activeStep === step.key}
            >
              {step.content}
            </StepCard>
          ))}
        </div>

        <ReviewPanel
          eyebrow={t('page.loadBalancersCreate.review.eyebrow')}
          title={t('page.loadBalancersCreate.review.title')}
          readyTitle={t('page.loadBalancersCreate.review.readyTitle')}
          rows={rows}
          footnote={t('page.loadBalancersCreate.review.footnote')}
          action={
            <button
              type="submit"
              disabled={!ready || isSubmitting}
              className={cn(flowCtaClassName('sky'), 'w-full')}
            >
              {isSubmitting ? (
                <LoaderCircleIcon className="size-4 animate-spin" />
              ) : (
                <NetworkIcon className="size-4" />
              )}
              {t('page.loadBalancersCreate.submit')}
            </button>
          }
        />
      </form>
    </div>
  );
}
