import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, createFileRoute } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ClipboardCheckIcon,
  FileTextIcon,
  Globe2Icon,
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
import { FlowActions } from '@/shared/presentation/organisms/FlowActions';
import {
  FLOW_ACCENTS,
  FlowHero,
} from '@/shared/presentation/organisms/FlowHero';
import { FlowStepper } from '@/shared/presentation/organisms/FlowStepper';
import type { ReviewPanelRow } from '@/shared/presentation/organisms/ReviewPanel';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import {
  getSelectedServer,
  getServerName,
  getServerPublicAddress,
} from './-lib/modules';
import { getRoutePreviewItems, isHttpsRequested } from './-lib/payload';
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
  head: () => ({
    meta: [{ title: 'Create a load balancer | dnocs' }],
  }),
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

type StepKey = 'gateway' | 'domain' | 'routing' | 'review';

const STEP_ORDER: StepKey[] = ['gateway', 'domain', 'routing', 'review'];

/** The review rows each step owns; a step is done when all of them are. */
const STEP_ROWS: Record<Exclude<StepKey, 'review'>, string[]> = {
  gateway: ['server', 'engine'],
  domain: ['domain'],
  routing: ['mode', 'https', 'routes'],
};

const STEP_ICONS: Record<StepKey, LucideIcon> = {
  gateway: ServerIcon,
  domain: Globe2Icon,
  routing: RouteIcon,
  review: ClipboardCheckIcon,
};

/**
 * One step at a time, as the application flow does: the gateway and its
 * engine first, since nothing else can be checked until the engine is
 * installed, then the domain, the routes and a last look before creating.
 */
function CreateFlow() {
  const t = useDevetekTranslations();
  const [current, setCurrent] = useState<StepKey>('gateway');

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

  // One validation pass drives every "done" state, so the steps can never
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

  // A managed domain stores the zone in `domain` and the subdomain beside
  // it, so the zone alone is not the host the load balancer will answer on.
  const subdomain = formValues.internalDomainMetadata?.subdomain.trim();
  const managed = Boolean(formValues.internalDomainMetadata?.id);
  const fullDomain =
    subdomain && formValues.domain
      ? `${subdomain}.${formValues.domain}`
      : formValues.domain;
  const proxied = formValues.internalDomainMetadata?.cloudflare?.proxied;
  // What will be sent, not what the switch last held: L4 never gets one.
  const https = isHttpsRequested(formValues);

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
      value:
        fullDomain &&
        (proxied === undefined
          ? fullDomain
          : `${fullDomain} · ${
              proxied
                ? t('page.loadBalancersCreate.dns.proxied')
                : t('page.loadBalancersCreate.dns.dnsOnly')
            }`),
      done:
        Boolean(formValues.domain) &&
        (!managed || Boolean(subdomain)) &&
        clean('domain', 'internalDomainMetadata'),
    },
    {
      key: 'mode',
      label: t('page.loadBalancersCreate.review.mode'),
      value: values.lbKind?.toUpperCase(),
      done: Boolean(values.lbKind) && clean('lbKind', 'features'),
    },
    {
      key: 'https',
      label: t('page.loadBalancersCreate.review.https'),
      value: https
        ? t('page.loadBalancersCreate.review.httpsOn')
        : t('page.loadBalancersCreate.review.httpsOff'),
      done: true,
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

  const ready = valid && engineReady;
  const byStep: Record<StepKey, boolean> = {
    gateway: rowsDone(rows, STEP_ROWS.gateway),
    domain: rowsDone(rows, STEP_ROWS.domain),
    routing: rowsDone(rows, STEP_ROWS.routing),
    review: ready,
  };

  const index = STEP_ORDER.indexOf(current);
  const isLast = index === STEP_ORDER.length - 1;
  // Forwards only over finished steps, so the engine is installed before
  // anything else can be set.
  const canGoTo = (step: StepKey) => {
    const target = STEP_ORDER.indexOf(step);
    return (
      target <= index || STEP_ORDER.slice(0, target).every((key) => byStep[key])
    );
  };

  const submit = form.handleSubmit((submitted) =>
    create(submitted, resources.selectedEngineRuntimeItem),
  );

  const Icon = STEP_ICONS[current];
  const stepText = (key: StepKey, part: 'title' | 'description') =>
    t(`page.loadBalancersCreate.steps.${key}.${part}`);

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/backend/load-balancers"
        search={{ page: 1, viewMode: 'table' }}
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('page.loadBalancersCreate.backToList')}
      </Link>

      <FlowStepper
        items={STEP_ORDER.map((key, position) => ({
          key,
          label: stepText(key, 'title'),
          done: byStep[key] && position < index,
          reachable: canGoTo(key),
        }))}
        activeKey={current}
        activeIndex={index}
        positionLabel={t('page.applicationsCreate.progress.position', {
          step: index + 1,
          total: STEP_ORDER.length,
        })}
        onSelect={(key) => {
          if (canGoTo(key as StepKey)) setCurrent(key as StepKey);
        }}
      />

      <form onSubmit={submit} className="flex flex-col gap-4">
        <section className="relative overflow-hidden rounded-2xl border bg-card">
          <div
            className={cn(
              'pointer-events-none absolute inset-0',
              FLOW_ACCENTS.sky.glow,
            )}
          />

          <header className="relative flex items-start gap-3 border-b p-4 sm:p-5">
            <span
              className={cn(
                'flex size-10 shrink-0 items-center justify-center rounded-xl border',
                FLOW_ACCENTS.sky.icon,
              )}
            >
              <Icon className="size-5" />
            </span>

            <div className="min-w-0">
              <h2 className="text-lg font-bold sm:text-xl">
                {stepText(current, 'title')}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                {stepText(current, 'description')}
              </p>
            </div>
          </header>

          <div className="relative flex flex-col gap-6 p-4 sm:p-5">
            {current === 'gateway' && (
              <>
                <ServerPicker form={form} resources={resources} />
                <EnginePicker form={form} resources={resources} />
              </>
            )}

            {current === 'domain' && (
              <DomainField
                form={form}
                domains={resources.domains}
                onRefreshDomains={resources.refreshDomains}
                gatewayAddress={getServerPublicAddress(selectedServer)}
                gatewayHasNoPublicAddress={Boolean(
                  selectedServer && !getServerPublicAddress(selectedServer),
                )}
              />
            )}

            {current === 'routing' && (
              <>
                <RoutingModePicker form={form} />
                {values.lbKind === 'l4' ? (
                  <L4RuleBuilder form={form} />
                ) : (
                  <L7RulesBuilder form={form} />
                )}
                <FeatureConfiguration form={form} />
              </>
            )}

            {current === 'review' && (
              <ReviewSummary
                rows={rows}
                routes={routes}
                https={https}
                onEdit={(row) =>
                  setCurrent(
                    (
                      Object.keys(STEP_ROWS) as Array<keyof typeof STEP_ROWS>
                    ).find((step) => STEP_ROWS[step].includes(row)) ??
                      'gateway',
                  )
                }
              />
            )}
          </div>
        </section>

        <FlowActions
          isBackHidden={index === 0}
          isBackDisabled={isSubmitting}
          isNextDisabled={!byStep[current]}
          isNextLoading={isLast && isSubmitting}
          isSubmit={isLast}
          submitIcon={NetworkIcon}
          backLabel={t('page.loadBalancersCreate.flow.back')}
          nextLabel={
            isLast
              ? t('page.loadBalancersCreate.submit')
              : t('page.loadBalancersCreate.flow.continue')
          }
          blockedHint={t(`page.loadBalancersCreate.flow.blocked.${current}`)}
          onBack={() => setCurrent(STEP_ORDER[Math.max(index - 1, 0)]!)}
          onNext={() => {
            if (isLast) {
              void submit();
              return;
            }
            if (byStep[current]) setCurrent(STEP_ORDER[index + 1]!);
          }}
        />
      </form>
    </div>
  );
}

function rowsDone(rows: ReviewPanelRow[], keys: string[]) {
  return rows.filter((row) => keys.includes(row.key)).every((r) => r.done);
}

/** Everything that will be created, with a way back to each part. */
function ReviewSummary(props: {
  rows: ReviewPanelRow[];
  routes: Array<{ key: string; match: string; destination: string }>;
  https: boolean;
  onEdit: (row: string) => void;
}) {
  const { https, onEdit, routes, rows } = props;
  const t = useDevetekTranslations();

  return (
    <div className="grid gap-4">
      <dl className="grid overflow-hidden rounded-xl border bg-background sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-start justify-between gap-3 border-b p-3 sm:odd:border-r"
          >
            <div className="min-w-0">
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-1 break-words text-sm font-semibold">
                {row.value ?? '—'}
              </dd>
            </div>
            <button
              type="button"
              onClick={() => onEdit(row.key)}
              className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {t('page.loadBalancersCreate.flow.edit')}
            </button>
          </div>
        ))}
      </dl>

      {routes.length > 0 && (
        <ul className="grid gap-1.5">
          {routes.map((route) => (
            <li
              key={route.key}
              className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm"
            >
              <code className="shrink-0 rounded border bg-card px-1.5 font-mono text-xs">
                {route.match}
              </code>
              <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{route.destination}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs leading-relaxed text-muted-foreground">
        {https
          ? t('page.loadBalancersCreate.review.footnote')
          : t('page.loadBalancersCreate.review.footnoteNoHttps')}
      </p>
    </div>
  );
}
