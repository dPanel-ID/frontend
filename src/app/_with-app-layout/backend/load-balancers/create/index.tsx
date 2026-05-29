import type { ComponentType, ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  FileTextIcon,
  Globe2Icon,
  Layers3Icon,
  LoaderCircleIcon,
  NetworkIcon,
  PlusIcon,
  RefreshCwIcon,
  RouteIcon,
  SearchIcon,
  ServerIcon,
  ShieldCheckIcon,
  TrashIcon,
} from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import {
  useController,
  useFieldArray,
  useForm,
  useWatch,
} from 'react-hook-form';
import type { UseFormReturn } from 'react-hook-form';

import { useAuthLoggedIn } from '@/services/auth';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import type { ApplicationCard } from '@/entities/application/rules/schema';
import { AdapterDomainFromDto } from '@/entities/domain/adapter';
import { normalizeLoadBalancerPathMatchForPayload } from '@/entities/load-balancer/lib/path-match';
import { LOAD_BALANCER_WEBSERVER_ENGINE } from '@/entities/load-balancer/ui/constants/webserver';
import { AdapterServerFromDto } from '@/entities/server/adapter';
import type { ServerCard } from '@/entities/server/rules/schema';
import { toServerModuleFromCatalog } from '@/entities/server-modules/lib/catalog';
import type { ServerModule } from '@/entities/server-modules/model/types';

import { schemaLoadBalancerCreationForm } from '@/features/load-balancer-creation-sidepanel';
import type { LoadBalancerCreationFormValues } from '@/features/load-balancer-creation-sidepanel';
import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import {
  ApiApplication,
  ApiDomain,
  ApiLoadBalancer,
  ApiModule,
  ApiServer,
} from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { Combobox } from '@/shared/presentation/molecules/Combobox';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

export const Route = createFileRoute(
  '/_with-app-layout/backend/load-balancers/create/',
)({
  component: CreateLoadBalancerPage,
});

type WizardStep = 'gateway' | 'routing' | 'preview';
type IconComponent = ComponentType<LucideProps>;
type Form = UseFormReturn<LoadBalancerCreationFormValues>;
type LoadBalancerRuntimeItem = {
  name: string;
  title?: string;
  version?: string;
  category?: string;
  roles: string[];
  installationKey?: string;
  variables: Record<string, unknown>;
  source?: string;
  moduleRef?: string;
  moduleSourceCommit?: string;
};
type InfrastructureModuleCatalog = {
  repository: DTOs.IACRepositorySummaryV1;
  list: ServerModule[];
};

const STEPS: Array<{
  key: WizardStep;
  icon: IconComponent;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: 'gateway',
    icon: ServerIcon,
    labelKey: 'gateway.label',
    descKey: 'gateway.description',
  },
  {
    key: 'routing',
    icon: RouteIcon,
    labelKey: 'routing.label',
    descKey: 'routing.description',
  },
  {
    key: 'preview',
    icon: ShieldCheckIcon,
    labelKey: 'preview.label',
    descKey: 'preview.description',
  },
];

const SERVER_PAGE_SIZE = 6;

const DEFAULT_VALUES: LoadBalancerCreationFormValues = {
  description: '',
  domain: '',
  internalDomainMetadata: {
    id: '',
    subdomain: '',
  },
  serverId: '',
  engine: '',
  lbKind: 'l7',
  features: {
    sslEnabled: true,
    protocol: 'http',
  },
  l7rules: [
    {
      pathMatch: '/*',
      type: 'proxy-pass',
      upstreamsIfProxyPass: [{ address: 'localhost', port: 80 }],
      applicationIdIfProxyPassApp: '',
    },
  ],
  l4rule: {
    upstreams: [{ address: 'localhost', port: 80 }],
  },
};

function CreateLoadBalancerPage() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [activeStep, setActiveStep] = useState<WizardStep>('gateway');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<LoadBalancerCreationFormValues>({
    resolver: zodResolver(schemaLoadBalancerCreationForm),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });

  const watchedValues = useWatch({ control: form.control });
  const resources = useLoadBalancerCreateResources(
    watchedValues.serverId,
    watchedValues.engine,
  );
  const formValues = form.getValues();
  const activeIndex = getStepIndex(activeStep);
  const step = STEPS[activeIndex] ?? STEPS[0]!;

  const goBack = () => {
    if (activeStep === 'gateway') {
      navigate({
        to: '/backend/load-balancers',
        search: {
          page: 1,
          viewMode: 'auto',
        },
      });
      return;
    }

    setActiveStep(STEPS[Math.max(0, activeIndex - 1)]!.key);
  };

  const goNext = async () => {
    if (activeStep === 'gateway') {
      const valid = await form.trigger(['domain', 'serverId', 'engine']);

      if (!valid) {
        openToaster({
          variant: 'error',
          message: t('page.loadBalancersCreate.toaster.fixGateway'),
        });
        return;
      }

      if (
        resources.selectedEngineDetail.$status === 'loading' ||
        resources.infrastructureModules.$status === 'loading'
      ) {
        openToaster({
          variant: 'error',
          message: t('page.loadBalancersCreate.toaster.engineLoading'),
        });
        return;
      }

      if (!resources.selectedEngineRuntimeItem) {
        openToaster({
          variant: 'error',
          message: t('page.loadBalancersCreate.toaster.engineRequired'),
        });
        return;
      }

      setActiveStep('routing');
      return;
    }

    if (activeStep === 'routing') {
      const lbKind = form.getValues('lbKind');
      const valid = await form.trigger(
        lbKind === 'l4'
          ? ['lbKind', 'features', 'l4rule']
          : ['lbKind', 'features', 'l7rules'],
      );

      if (!valid) {
        openToaster({
          variant: 'error',
          message: t('page.loadBalancersCreate.toaster.fixRouting'),
        });
        return;
      }

      setActiveStep('preview');
    }
  };

  const submit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const response = await ApiLoadBalancer.Create.doPost(
        toCreateLoadBalancerPayload(
          values,
          resources.selectedEngineRuntimeItem,
        ),
      );

      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('toaster.loadBalancerCreate.error'),
          message: response.error.message,
        });
        return;
      }

      openToaster({
        variant: 'success',
        message: t('toaster.loadBalancerCreate.success'),
      });

      navigate({
        to: '/backend/load-balancers',
        search: {
          page: 1,
          viewMode: 'auto',
        },
        replace: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.loadBalancers'),
                url: '/backend/load-balancers',
              },
            ]}
          />
        }
        title={t('page.loadBalancersCreate.headerTitle')}
        description={t('page.loadBalancersCreate.headerDesc')}
        rightAppend={
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.loadBalancers.docs')}
            href={LINK__DOCUMENTATION}
          />
        }
      />

      <WizardProgress
        activeStep={activeStep}
        onStepClick={(stepKey) => {
          if (getStepIndex(stepKey) <= activeIndex) setActiveStep(stepKey);
        }}
      />

      <CtaBar
        placement="top"
        isSubmitting={isSubmitting}
        isPreview={activeStep === 'preview'}
        onBack={goBack}
        onNext={activeStep === 'preview' ? submit : goNext}
      />

      <StepSurface
        eyebrow={t('page.loadBalancersCreate.progress.stepLabel', {
          step: activeIndex + 1,
        })}
        title={t(`page.loadBalancersCreate.progress.${step.labelKey}`)}
        description={t(`page.loadBalancersCreate.progress.${step.descKey}`)}
      >
        {activeStep === 'gateway' && (
          <StepGateway form={form} resources={resources} />
        )}
        {activeStep === 'routing' && <StepRouting form={form} />}
        {activeStep === 'preview' && (
          <StepPreview formValues={formValues} resources={resources} />
        )}
      </StepSurface>

      <CtaBar
        placement="bottom"
        isSubmitting={isSubmitting}
        isPreview={activeStep === 'preview'}
        onBack={goBack}
        onNext={activeStep === 'preview' ? submit : goNext}
      />
    </div>
  );
}

function useLoadBalancerCreateResources(
  selectedServerId?: string,
  selectedEngine?: string,
) {
  const { userProfile } = useAuthLoggedIn();
  const [serverSearch, setServerSearch] = useState('');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [serverPage, setServerPage] = useState(1);

  const [responseServers, refreshServers] = ApiServer.Find.useGet({
    userId: userProfile.id,
    searchQuery: serverSearch,
    page: serverPage,
    pageSize: SERVER_PAGE_SIZE,
  });

  const [responseApplications, refreshApplications] =
    ApiApplication.Find.useGet({
      name: applicationSearch,
      page: 1,
      limit: 12,
    });

  const [responseDomains, refreshDomains] = ApiDomain.Find.useGet({
    page: 1,
    perPage: 12,
  });

  const [responseModules, refreshModules] = ApiModule.Find.useGet({
    serverId: selectedServerId || undefined,
    options: {
      skip: !selectedServerId,
    },
  });

  const [responseServerModules, refreshServerModules] =
    ApiServer.Modules.$Id.useGet({
      serverId: String(selectedServerId ?? ''),
      options: {
        skip: !selectedServerId,
      },
    });

  const servers = useAdapter(responseServers, (raw) => ({
    list: (raw.machines ?? []).map((machine) =>
      AdapterServerFromDto.toServerCard(machine).unwrap(),
    ),
    pagination: raw.pagination,
  }));

  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));

  const domains = useAdapter(responseDomains, (raw) => ({
    list: (raw.domains ?? []).map((domain) =>
      AdapterDomainFromDto.toDomainCard(domain).unwrap(),
    ),
    pagination: raw.pagination,
  }));

  const infrastructureCatalogModules = useAdapter(responseModules, (raw) => ({
    repository: raw.repository,
    list: raw.modules
      .map((module) =>
        toServerModuleFromCatalog(
          module,
          raw.repository.ref.name,
          raw.repository.ref.resolved_commit,
        ),
      )
      .filter(
        (module) =>
          module.category.includes('infrastructure') ||
          module.installerType === 'infrastructure',
      ),
  }));
  const serverModuleInventory = useMemo(() => {
    if (responseServerModules.$status === 'success') {
      return responseServerModules.modules ?? [];
    }

    if (responseServerModules.$status === 'loading') {
      return responseServerModules.prevData?.modules ?? [];
    }

    return [];
  }, [responseServerModules]);
  const infrastructureModules = useMemo<
    typeof infrastructureCatalogModules
  >(() => {
    const mergeData = <T extends InfrastructureModuleCatalog>(data: T): T => ({
      ...data,
      list: mergeCatalogModulesWithServerInventory(
        data.list,
        serverModuleInventory,
      ),
    });

    if (infrastructureCatalogModules.$status === 'success') {
      return mergeData(infrastructureCatalogModules);
    }

    if (infrastructureCatalogModules.$status === 'loading') {
      return {
        ...infrastructureCatalogModules,
        prevData: infrastructureCatalogModules.prevData
          ? mergeData(infrastructureCatalogModules.prevData)
          : undefined,
      };
    }

    return infrastructureCatalogModules;
  }, [infrastructureCatalogModules, serverModuleInventory]);

  const moduleCatalog =
    infrastructureModules.$status === 'success'
      ? infrastructureModules
      : infrastructureModules.$status === 'loading'
        ? infrastructureModules.prevData
        : undefined;
  const selectedInfrastructureModule = selectedEngine
    ? moduleCatalog?.list.find((module) => module.id === selectedEngine)
    : undefined;
  const catalogRef = moduleCatalog?.repository.ref.name;

  const [selectedEngineDetail, refreshSelectedEngineDetail] =
    ApiModule.Detail.$Name.useGet({
      name: selectedEngine || '',
      ref: catalogRef,
      options: {
        skip: !selectedServerId || !selectedEngine || !catalogRef,
      },
    });

  const selectedEngineDetailData =
    selectedEngineDetail.$status === 'success' &&
    selectedEngineDetail.id === selectedEngine
      ? selectedEngineDetail
      : undefined;

  const selectedEngineRuntimeItem =
    selectedInfrastructureModule && selectedEngineDetailData
      ? runtimeItemFromInfrastructureModule(
          selectedInfrastructureModule,
          selectedEngineDetailData,
        )
      : undefined;

  const updateServerSearch = (value: string) => {
    setServerSearch(value);
    setServerPage(1);
  };

  return {
    servers,
    applications,
    domains,
    infrastructureModules,
    selectedEngineDetail,
    selectedEngineRuntimeItem,
    refreshServers,
    refreshApplications,
    refreshDomains,
    refreshModules: () => {
      refreshModules();
      refreshServerModules();
    },
    refreshSelectedEngineDetail,
    serverSearch,
    setServerSearch: updateServerSearch,
    applicationSearch,
    setApplicationSearch,
    serverPage,
    setServerPage,
  };
}

function StepGateway(props: {
  form: Form;
  resources: ReturnType<typeof useLoadBalancerCreateResources>;
}) {
  const { form, resources } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-5">
      <SectionIntro
        icon={Globe2Icon}
        title={t('page.loadBalancersCreate.gateway.title')}
        description={t('page.loadBalancersCreate.gateway.description')}
      />

      <div className="flex flex-col gap-4">
        <FormField
          label={t('sidepanel.loadBalancerCreation.fieldDescription.title')}
          description={t('page.loadBalancersCreate.gateway.nameHint')}
        >
          <Input
            {...form.register('description')}
            placeholder={t('page.loadBalancersCreate.gateway.namePlaceholder')}
          />
        </FormField>

        <DomainField form={form} domains={resources.domains} />

        <ServerPicker form={form} resources={resources} />
        <EnginePicker form={form} resources={resources} />
      </div>
    </div>
  );
}

function StepRouting(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const lbKind = useWatch({ control: form.control, name: 'lbKind' });

  return (
    <div className="flex flex-col gap-5">
      <SectionIntro
        icon={RouteIcon}
        title={t('page.loadBalancersCreate.routing.title')}
        description={t('page.loadBalancersCreate.routing.description')}
      />

      <div className="flex flex-col gap-4">
        <RoutingModePicker form={form} />
        <FeatureConfiguration form={form} />

        {lbKind === 'l7' ? (
          <L7RulesBuilder form={form} />
        ) : (
          <L4RuleBuilder form={form} />
        )}
      </div>
    </div>
  );
}

function StepPreview(props: {
  formValues: Partial<LoadBalancerCreationFormValues>;
  resources: ReturnType<typeof useLoadBalancerCreateResources>;
}) {
  const { formValues, resources } = props;
  const t = useDevetekTranslations();
  const selectedServer = getSelectedServer(resources, formValues.serverId);
  const selectedEngine = getSelectedInfrastructureModule(
    resources,
    formValues.engine,
  );
  const engine = getWebserverEngineMetadata(formValues.engine);
  const lbKind = formValues.lbKind ?? 'l7';
  const routes = getRoutePreviewItems(
    formValues,
    resources.applications.$status === 'success'
      ? resources.applications.list
      : [],
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionIntro
        icon={ShieldCheckIcon}
        title={t('page.loadBalancersCreate.preview.title')}
        description={t('page.loadBalancersCreate.preview.description')}
      />

      <div className="flex flex-col gap-4">
        <Card className="overflow-hidden rounded-lg shadow-none">
          <div className="grid divide-y text-sm">
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldDescription.title')}
              value={
                formValues.description || t('page.loadBalancers.noDescription')
              }
            />
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldDomain.title')}
              value={formValues.domain || '-'}
            />
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldServer.title')}
              value={
                selectedServer
                  ? getServerName(selectedServer)
                  : t('page.loadBalancers.noGateway')
              }
            />
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldEngine.title')}
              value={
                selectedEngine?.name ??
                (formValues.engine ? t(engine.i18n.brandName) : '-')
              }
            />
            <PreviewRow
              label={t('page.loadBalancers.lbKind')}
              value={lbKind.toUpperCase()}
            />
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldProtocol.title')}
              value={(formValues.features?.protocol ?? 'http').toUpperCase()}
            />
            <PreviewRow
              label={t('sidepanel.loadBalancerCreation.fieldSslEnabled.title')}
              value={
                formValues.features?.sslEnabled
                  ? t('page.loadBalancersCreate.preview.enabled')
                  : t('page.loadBalancersCreate.preview.disabled')
              }
            />
          </div>
        </Card>

        <Card className="rounded-lg p-4 shadow-none">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold">
                {t('page.loadBalancersCreate.preview.routesTitle')}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t('page.loadBalancersCreate.preview.routesDescription')}
              </p>
            </div>
            <Badge variant="outline">{routes.length}</Badge>
          </div>

          <div className="grid gap-2">
            {routes.map((route) => (
              <div
                key={route.key}
                className="grid gap-3 rounded-md border bg-background px-3 py-2 text-sm md:grid-cols-[160px_minmax(0,1fr)]"
              >
                <span className="font-mono font-semibold text-primary">
                  {route.match}
                </span>
                <span className="truncate text-muted-foreground">
                  {route.destination}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <div className="rounded-lg border bg-primary/5 p-4 text-sm text-muted-foreground">
          {t('page.loadBalancersCreate.preview.submitNote')}
        </div>
      </div>
    </div>
  );
}

function DomainField(props: {
  form: Form;
  domains: ReturnType<typeof useLoadBalancerCreateResources>['domains'];
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
        <div className="grid gap-2">
          <Input
            {...internalDomainSubdomain.field}
            placeholder={t('page.loadBalancersCreate.gateway.subdomain')}
          />
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

function EnginePicker(props: {
  form: Form;
  resources: ReturnType<typeof useLoadBalancerCreateResources>;
}) {
  const { form, resources } = props;
  const t = useDevetekTranslations();
  const [query, setQuery] = useState('');
  const [openServerModulesDetailModal] = useServerModulesDetailModal();
  const engine = useController({ control: form.control, name: 'engine' });
  const serverId = useWatch({ control: form.control, name: 'serverId' });
  const modules =
    resources.infrastructureModules.$status === 'success'
      ? resources.infrastructureModules
      : resources.infrastructureModules.$status === 'loading'
        ? resources.infrastructureModules.prevData
        : undefined;
  const reportedModules = useMemo(
    () => (modules?.list ?? []).filter(hasReportedGatewayModule),
    [modules],
  );
  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const list = modules?.list ?? [];

    if (!normalizedQuery) return list;

    return list.filter((module) =>
      [module.id, module.name, module.description]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [modules, query]);
  const availableModules = useMemo(
    () => filteredModules.filter((module) => !hasReportedGatewayModule(module)),
    [filteredModules],
  );

  const openModuleInstaller = (module: ServerModule) => {
    if (!serverId) return;

    openServerModulesDetailModal({
      moduleInfo: module,
      serverID: Number(serverId),
    });
  };

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
            <Layers3Icon className="size-5" />
          </span>
          <span className="min-w-0">
            <h3 className="text-sm font-bold">
              {t('sidepanel.loadBalancerCreation.fieldEngine.title')}
              <span className="text-destructive">*</span>
            </h3>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {t('page.loadBalancersCreate.gateway.engineHint')}
            </p>
          </span>
        </div>
      </div>

      <div className="grid gap-4 p-3">
        {!serverId && (
          <StateBlock>
            {t('page.loadBalancersCreate.gateway.selectServerFirst')}
          </StateBlock>
        )}

        {serverId &&
          resources.infrastructureModules.$status === 'loading' &&
          !modules && (
            <StateBlock>
              <Spinner />
              <span>
                {t('page.loadBalancersCreate.gateway.loadingEngines')}
              </span>
            </StateBlock>
          )}

        {serverId && resources.infrastructureModules.$status === 'failed' && (
          <StateBlock>
            <span>
              {t('page.loadBalancersCreate.gateway.engineLoadFailed')}
            </span>
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => resources.refreshModules()}
            >
              <RefreshCwIcon />
              {t('common.actions.refresh')}
            </Button>
          </StateBlock>
        )}

        {serverId && modules && (
          <>
            <section className="grid gap-3">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-sm font-bold">
                    {t(
                      'page.loadBalancersCreate.gateway.installedInfrastructureTitle',
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'page.loadBalancersCreate.gateway.installedInfrastructureDescription',
                    )}
                  </p>
                </div>
                <Button
                  size="sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  title={t('common.actions.refresh')}
                  aria-label={t('common.actions.refresh')}
                  onClick={() => resources.refreshModules()}
                >
                  <RefreshCwIcon />
                  {t('common.actions.refresh')}
                </Button>
              </div>

              <div
                className="grid gap-2"
                role="radiogroup"
                aria-label={t(
                  'page.loadBalancersCreate.gateway.installedInfrastructureTitle',
                )}
              >
                {reportedModules.length > 0 ? (
                  reportedModules.map((module) => {
                    const installed = hasInstalledModule(module);

                    return (
                      <InstalledEngineOption
                        key={module.id}
                        module={module}
                        selected={engine.field.value === module.id}
                        installed={installed}
                        detailStatus={resources.selectedEngineDetail.$status}
                        runtimeReady={Boolean(
                          resources.selectedEngineRuntimeItem,
                        )}
                        onSelect={() => {
                          if (installed) engine.field.onChange(module.id);
                        }}
                      />
                    );
                  })
                ) : (
                  <StateBlock>
                    {t(
                      'page.loadBalancersCreate.gateway.noInstalledInfrastructure',
                    )}
                  </StateBlock>
                )}
              </div>
            </section>

            <section className="grid gap-3 border-t pt-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <h4 className="text-sm font-bold">
                    {t(
                      'page.loadBalancersCreate.gateway.availableInfrastructureTitle',
                    )}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {t(
                      'page.loadBalancersCreate.gateway.availableInfrastructureDescription',
                    )}
                  </p>
                </div>

                <div className="relative w-full md:max-w-xs">
                  <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="pl-9"
                    value={query}
                    onChange={(event) => setQuery(event.currentTarget.value)}
                    placeholder={t(
                      'page.loadBalancersCreate.gateway.searchEngine',
                    )}
                    aria-label={t(
                      'page.loadBalancersCreate.gateway.searchEngine',
                    )}
                    disabled={!serverId}
                  />
                </div>
              </div>

              {modules.list.length < 1 ? (
                <StateBlock>
                  {t(
                    'page.loadBalancersCreate.gateway.noInfrastructureEngines',
                  )}
                </StateBlock>
              ) : availableModules.length < 1 ? (
                <StateBlock>
                  {query
                    ? t('page.loadBalancersCreate.gateway.noEnginesForSearch')
                    : t(
                        'page.loadBalancersCreate.gateway.noAvailableInfrastructure',
                      )}
                </StateBlock>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {availableModules.map((module) => (
                    <AvailableEngineModuleCard
                      key={module.id}
                      module={module}
                      onOpen={() => openModuleInstaller(module)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <div className="px-4 pb-4">
        {engine.field.value &&
        resources.selectedEngineDetail.$status === 'failed' ? (
          <div className="flex flex-wrap items-center gap-2">
            <ErrorInline
              t={t}
              message={t('page.loadBalancersCreate.gateway.engineDetailFailed')}
            />
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => resources.refreshSelectedEngineDetail()}
            >
              <RefreshCwIcon />
              {t('common.actions.refresh')}
            </Button>
          </div>
        ) : (
          <ErrorInline t={t} message={form.formState.errors.engine?.message} />
        )}
      </div>
    </Card>
  );
}

function InstalledEngineOption(props: {
  module: ServerModule;
  selected: boolean;
  installed: boolean;
  detailStatus: string;
  runtimeReady: boolean;
  onSelect: () => void;
}) {
  const { detailStatus, installed, module, onSelect, runtimeReady, selected } =
    props;
  const t = useDevetekTranslations();
  const installedLabels = moduleInstallationLabels(module);

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      aria-disabled={!installed}
      onClick={onSelect}
      className={cn(
        'grid gap-3 rounded-lg border bg-background p-4 text-left transition-colors md:grid-cols-[auto_minmax(0,1fr)_auto]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected && 'border-primary bg-primary/10',
        !installed && 'cursor-not-allowed opacity-75',
      )}
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-card">
        <img
          src={module.logoUrl}
          alt=""
          className="size-7 object-contain"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-base font-bold">{module.name}</span>
          <Badge variant="secondary">
            {t('page.loadBalancersCreate.gateway.infrastructureCategory')}
          </Badge>
          {installed ? (
            <Badge variant="outline" className="text-emerald-600">
              {t('page.loadBalancersCreate.gateway.installedBadge')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600">
              {t('page.loadBalancersCreate.gateway.installingBadge')}
            </Badge>
          )}
          {selected && detailStatus === 'loading' && (
            <Badge variant="outline">
              {t('page.loadBalancersCreate.gateway.loadingMetadata')}
            </Badge>
          )}
          {selected && runtimeReady && (
            <Badge variant="outline" className="text-emerald-600">
              {t('page.loadBalancersCreate.gateway.playbookReady')}
            </Badge>
          )}
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {module.description ||
            t('page.loadBalancersCreate.gateway.engineRuntime')}
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{module.installerName ?? module.id}</Badge>
          {installedLabels.map((label) => (
            <Badge key={label} variant="secondary">
              {label}
            </Badge>
          ))}
          {module.refName && (
            <Badge variant="secondary">{module.refName}</Badge>
          )}
          {module.resolvedCommit && (
            <Badge variant="secondary">
              {module.resolvedCommit.slice(0, 12)}
            </Badge>
          )}
        </span>
      </span>

      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full border',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground',
        )}
      >
        {selected && <CheckCircle2Icon className="size-5" />}
      </span>
    </button>
  );
}

function AvailableEngineModuleCard(props: {
  module: ServerModule;
  onOpen: () => void;
}) {
  const { module, onOpen } = props;
  const t = useDevetekTranslations();

  return (
    <div className="grid gap-3 rounded-lg border bg-background p-4 md:grid-cols-[auto_minmax(0,1fr)_auto]">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-card">
        <img
          src={module.logoUrl}
          alt=""
          className="size-7 object-contain"
          aria-hidden="true"
        />
      </span>

      <span className="min-w-0">
        <span className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="truncate text-base font-bold">{module.name}</span>
          <Badge variant="secondary">
            {t('page.loadBalancersCreate.gateway.infrastructureCategory')}
          </Badge>
        </span>
        <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
          {module.description ||
            t('page.loadBalancersCreate.gateway.engineRuntime')}
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{module.installerName ?? module.id}</Badge>
          {module.refName && (
            <Badge variant="secondary">{module.refName}</Badge>
          )}
        </span>
      </span>

      <Button
        className="self-center"
        size="sm"
        buttonStyle="outline"
        buttonColor="secondary"
        title={t('page.loadBalancersCreate.gateway.openInstallModal')}
        aria-label={t('page.loadBalancersCreate.gateway.openInstallModal')}
        onClick={onOpen}
      >
        {t('page.loadBalancersCreate.gateway.openInstallModal')}
      </Button>
    </div>
  );
}

function ServerPicker(props: {
  form: Form;
  resources: ReturnType<typeof useLoadBalancerCreateResources>;
}) {
  const { form, resources } = props;
  const t = useDevetekTranslations();
  const serverId = useController({ control: form.control, name: 'serverId' });
  const servers = resources.servers;
  const selectedServer = getSelectedServer(resources, serverId.field.value);
  const canGoPrev = servers.$status === 'success' && resources.serverPage > 1;
  const canGoNext =
    servers.$status === 'success' &&
    resources.serverPage < servers.pagination.total_page;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-sm font-bold">
            {t('sidepanel.loadBalancerCreation.fieldServer.title')}
            <span className="text-destructive">*</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('page.loadBalancersCreate.gateway.serverHint')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-64">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={resources.serverSearch}
              onChange={(event) =>
                resources.setServerSearch(event.currentTarget.value)
              }
              placeholder={t('page.loadBalancersCreate.gateway.searchServer')}
              aria-label={t('page.loadBalancersCreate.gateway.searchServer')}
            />
          </div>
          <Button
            size="icon"
            buttonStyle="outline"
            buttonColor="secondary"
            title={t('common.actions.refresh')}
            aria-label={t('common.actions.refresh')}
            onClick={() => resources.refreshServers()}
          >
            <RefreshCwIcon />
          </Button>
        </div>
      </div>

      <div className="grid gap-2 p-3">
        {servers.$status === 'loading' && (
          <StateBlock>
            <Spinner />
            <span>{t('page.loadBalancersCreate.loading')}</span>
          </StateBlock>
        )}

        {servers.$status === 'failed' && (
          <StateBlock>
            {t('sidepanel.loadBalancerCreation.fieldServer.onError')}
          </StateBlock>
        )}

        {servers.$status === 'success' &&
          servers.list.map((server) => (
            <ServerOption
              key={server.id}
              server={server}
              selected={serverId.field.value === server.id}
              onSelect={() => {
                if (serverId.field.value !== server.id) {
                  form.setValue('engine', '', { shouldValidate: true });
                }
                serverId.field.onChange(server.id);
              }}
            />
          ))}

        {servers.$status === 'success' && servers.list.length < 1 && (
          <StateBlock>
            {t('page.loadBalancersCreate.gateway.noServers')}
          </StateBlock>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
        <span>
          {selectedServer
            ? t('page.loadBalancersCreate.gateway.selectedServer', {
                server: getServerName(selectedServer),
              })
            : t('page.loadBalancersCreate.gateway.noSelectedServer')}
        </span>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!canGoPrev}
            onClick={() => resources.setServerPage(resources.serverPage - 1)}
          >
            <ArrowLeftIcon />
            {t('common.actions.previous')}
          </Button>
          <span>
            {servers.$status === 'success'
              ? t('page.loadBalancersCreate.gateway.pageOf', {
                  page: resources.serverPage,
                  total: Math.max(servers.pagination.total_page, 1),
                })
              : t('page.loadBalancersCreate.gateway.pageOf', {
                  page: resources.serverPage,
                  total: 1,
                })}
          </span>
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={!canGoNext}
            onClick={() => resources.setServerPage(resources.serverPage + 1)}
          >
            {t('common.actions.next')}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <ErrorInline t={t} message={form.formState.errors.serverId?.message} />
      </div>
    </Card>
  );
}

function RoutingModePicker(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const lbKind = useController({ control: form.control, name: 'lbKind' });

  const selectKind = (kind: 'l7' | 'l4') => {
    lbKind.field.onChange(kind);

    if (kind === 'l7' && !form.getValues('l7rules')?.length) {
      form.setValue('l7rules', DEFAULT_VALUES.l7rules);
    }

    const l4rule = form.getValues('l4rule');
    if (kind === 'l4' && (!l4rule || l4rule.upstreams.length < 1)) {
      form.setValue('l4rule', DEFAULT_VALUES.l4rule);
    }
  };

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.sectionLbKind')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.kindHint')}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChoiceButton
          icon={RouteIcon}
          selected={lbKind.field.value === 'l7'}
          title="L7"
          description={t('sidepanel.loadBalancerCreation.fieldLbKind.hintL7')}
          onClick={() => selectKind('l7')}
        />
        <ChoiceButton
          icon={NetworkIcon}
          selected={lbKind.field.value === 'l4'}
          title="L4"
          description={t('sidepanel.loadBalancerCreation.fieldLbKind.hintL4')}
          onClick={() => selectKind('l4')}
        />
      </div>
    </Card>
  );
}

function FeatureConfiguration(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const lbKind = useWatch({ control: form.control, name: 'lbKind' });
  const protocol = useController({
    control: form.control,
    name: 'features.protocol',
  });
  const sslEnabled = useController({
    control: form.control,
    name: 'features.sslEnabled',
  });

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.sectionFeatures')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.featuresHint')}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border bg-background p-3">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {t('sidepanel.loadBalancerCreation.fieldProtocol.title')}
          </p>
          {lbKind === 'l4' ? (
            <Combobox
              classNameButton="mt-2 w-full"
              placeholder={t(
                'sidepanel.loadBalancerCreation.fieldProtocol.placeholder',
              )}
              value={protocol.field.value}
              onChange={protocol.field.onChange}
              items={[
                { label: 'HTTP', value: 'http' },
                { label: 'TCP', value: 'tcp' },
                { label: 'UDP', value: 'udp' },
                { label: 'PostgreSQL', value: 'postgresql' },
                { label: 'MySQL', value: 'mysql' },
                { label: 'MongoDB', value: 'mongodb' },
                { label: 'Redis', value: 'redis' },
              ]}
            />
          ) : (
            <div className="mt-2 flex h-10 items-center rounded-md border bg-card px-3 text-sm font-semibold">
              HTTP / HTTPS
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border bg-background p-3">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              {t('sidepanel.loadBalancerCreation.fieldSslEnabled.title')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('page.loadBalancersCreate.routing.sslHint')}
            </p>
          </div>
          <Switch
            checked={sslEnabled.field.value}
            onCheckedChange={sslEnabled.field.onChange}
            aria-label={t(
              'sidepanel.loadBalancerCreation.fieldSslEnabled.title',
            )}
          />
        </div>
      </div>
    </Card>
  );
}

function L7RulesBuilder(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const rules = useFieldArray({ control: form.control, name: 'l7rules' });

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold">
            {t('sidepanel.loadBalancerCreation.upstreamRules.title')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('page.loadBalancersCreate.routing.l7Hint')}
          </p>
        </div>
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() =>
            rules.append({
              pathMatch: '/*',
              type: 'proxy-pass',
              upstreamsIfProxyPass: [{ address: 'localhost', port: 80 }],
              applicationIdIfProxyPassApp: '',
            })
          }
        >
          <PlusIcon />
          {t('sidepanel.loadBalancerCreation.upstreamRules.addRule')}
        </Button>
      </div>

      <div className="grid gap-3 p-4">
        {rules.fields.map((rule, index) => (
          <L7RuleCard
            key={rule.id}
            form={form}
            index={index}
            canRemove={rules.fields.length > 1}
            onRemove={() => rules.remove(index)}
          />
        ))}
      </div>
      <div className="px-4 pb-4">
        <ErrorInline t={t} message={form.formState.errors.l7rules?.message} />
      </div>
    </Card>
  );
}

function L7RuleCard(props: {
  form: Form;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { canRemove, form, index, onRemove } = props;
  const t = useDevetekTranslations();
  const pathMatch = useController({
    control: form.control,
    name: `l7rules.${index}.pathMatch`,
  });
  const type = useController({
    control: form.control,
    name: `l7rules.${index}.type`,
  });
  const ruleType = useWatch({
    control: form.control,
    name: `l7rules.${index}.type`,
  });
  const ruleErrors = form.formState.errors.l7rules?.[index];

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {t('sidepanel.loadBalancerCreation.upstreamRules.ruleLabel')} #
            {String(index + 1).padStart(2, '0')}
          </Badge>
          {/\/\*$/.test(pathMatch.field.value || '') && (
            <Badge>{t('page.loadBalancersCreate.routing.wildcard')}</Badge>
          )}
        </div>
        {canRemove && (
          <Button
            danger
            size="icon-sm"
            buttonStyle="ghost"
            title={t('sidepanel.loadBalancerCreation.upstreamRules.removeRule')}
            aria-label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.removeRule',
            )}
            onClick={onRemove}
          >
            <TrashIcon />
          </Button>
        )}
      </div>

      <div className="grid gap-3 p-3">
        <div className="grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
          <FormField
            label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldType.title',
            )}
          >
            <Combobox
              classNameButton="w-full"
              items={[
                {
                  value: 'proxy-pass',
                  label: 'Proxy Pass',
                },
                {
                  value: 'proxy-pass-app',
                  label: t('common.terms.application'),
                },
              ]}
              value={type.field.value}
              onChange={type.field.onChange}
            />
          </FormField>

          <FormField
            label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldPath.title',
            )}
            required
          >
            <Input
              className="font-mono"
              {...pathMatch.field}
              placeholder="/api/*"
            />
            <ErrorInline t={t} message={ruleErrors?.pathMatch?.message} />
          </FormField>
        </div>

        {ruleType === 'proxy-pass-app' ? (
          <ApplicationDestination form={form} ruleIndex={index} />
        ) : (
          <ProxyDestinations form={form} ruleIndex={index} />
        )}
      </div>
    </div>
  );
}

function ProxyDestinations(props: { form: Form; ruleIndex: number }) {
  const { form, ruleIndex } = props;
  const t = useDevetekTranslations();
  const upstreams = useFieldArray({
    control: form.control,
    name: `l7rules.${ruleIndex}.upstreamsIfProxyPass`,
  });
  const upstreamErrors =
    form.formState.errors.l7rules?.[ruleIndex]?.upstreamsIfProxyPass;

  return (
    <FormField
      label={t(
        'sidepanel.loadBalancerCreation.upstreamRules.fieldDestination.title',
      )}
      required
    >
      <div className="grid gap-2">
        {upstreams.fields.map((upstream, upstreamIndex) => {
          const entryErrors = upstreamErrors?.[upstreamIndex];

          return (
            <div key={upstream.id} className="grid gap-1">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_132px_auto] items-center gap-2">
                <Input
                  inputSize="sm"
                  className="font-mono"
                  {...form.register(
                    `l7rules.${ruleIndex}.upstreamsIfProxyPass.${upstreamIndex}.address` as const,
                  )}
                />
                <span className="font-mono">:</span>
                <Input
                  inputSize="sm"
                  type="number"
                  min={1}
                  max={65_535}
                  className="font-mono"
                  {...form.register(
                    `l7rules.${ruleIndex}.upstreamsIfProxyPass.${upstreamIndex}.port` as const,
                    { valueAsNumber: true },
                  )}
                />
                <Button
                  danger
                  size="icon-sm"
                  buttonStyle="ghost"
                  disabled={upstreams.fields.length <= 1}
                  title={t('common.actions.delete')}
                  aria-label={t('common.actions.delete')}
                  onClick={() => upstreams.remove(upstreamIndex)}
                >
                  <TrashIcon />
                </Button>
              </div>

              {(entryErrors?.address || entryErrors?.port) && (
                <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-2">
                  <ErrorInline t={t} message={entryErrors.address?.message} />
                  <ErrorInline t={t} message={entryErrors.port?.message} />
                </div>
              )}
            </div>
          );
        })}

        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => upstreams.append({ address: 'localhost', port: 80 })}
        >
          <PlusIcon />
          {t(
            'sidepanel.loadBalancerCreation.upstreamRules.fieldDestination.add',
          )}
        </Button>
      </div>
    </FormField>
  );
}

function ApplicationDestination(props: { form: Form; ruleIndex: number }) {
  const { form, ruleIndex } = props;
  const t = useDevetekTranslations();
  const [search, setSearch] = useState('');
  const [responseApplications] = ApiApplication.Find.useGet({
    page: 1,
    limit: 12,
    name: search,
  });
  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));
  const applicationId = useController({
    control: form.control,
    name: `l7rules.${ruleIndex}.applicationIdIfProxyPassApp`,
  });
  const ruleErrors = form.formState.errors.l7rules?.[ruleIndex];

  return (
    <FormField
      label={t('sidepanel.loadBalancerCreation.upstreamRules.fieldApp.title')}
      required
    >
      <div className="grid gap-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldApp.placeholder',
            )}
          />
        </div>

        {applications.$status === 'loading' && (
          <StateBlock>
            <Spinner />
            <span>{t('page.loadBalancersCreate.loading')}</span>
          </StateBlock>
        )}

        {applications.$status === 'failed' && (
          <StateBlock>
            {t('sidepanel.loadBalancerCreation.upstreamRules.fieldApp.onError')}
          </StateBlock>
        )}

        {applications.$status === 'success' && (
          <div className="grid max-h-60 gap-2 overflow-y-auto pr-1">
            {applications.list.map((application) => (
              <ApplicationOption
                key={application.id}
                application={application}
                selected={applicationId.field.value === application.id}
                onSelect={() => applicationId.field.onChange(application.id)}
              />
            ))}
          </div>
        )}

        <ErrorInline
          t={t}
          message={ruleErrors?.applicationIdIfProxyPassApp?.message}
        />
      </div>
    </FormField>
  );
}

function L4RuleBuilder(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const upstreams = useFieldArray({
    control: form.control,
    name: 'l4rule.upstreams',
  });
  const upstreamErrors = form.formState.errors.l4rule?.upstreams;

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.l4rule.title')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.l4Hint')}
        </p>
      </div>

      <div className="grid gap-2">
        {upstreams.fields.map((upstream, index) => {
          const entryErrors = upstreamErrors?.[index];

          return (
            <div key={upstream.id} className="grid gap-1">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_120px_auto] items-center gap-1">
                <Input
                  className="font-mono"
                  {...form.register(`l4rule.upstreams.${index}.address`, {
                    required: true,
                  })}
                />
                <span className="font-mono">:</span>
                <Input
                  type="number"
                  min={1}
                  max={65_535}
                  className="font-mono"
                  {...form.register(`l4rule.upstreams.${index}.port`, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  danger
                  size="icon-sm"
                  buttonStyle="ghost"
                  disabled={upstreams.fields.length <= 1}
                  title={t('common.actions.delete')}
                  aria-label={t('common.actions.delete')}
                  onClick={() => upstreams.remove(index)}
                >
                  <TrashIcon />
                </Button>
              </div>
              {(entryErrors?.address || entryErrors?.port) && (
                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                  <ErrorInline t={t} message={entryErrors.address?.message} />
                  <ErrorInline t={t} message={entryErrors.port?.message} />
                </div>
              )}
            </div>
          );
        })}

        <Button
          className="mt-2"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => upstreams.append({ address: 'localhost', port: 80 })}
        >
          <PlusIcon />
          {t('sidepanel.loadBalancerCreation.l4rule.fieldDestination.add')}
        </Button>
      </div>
    </Card>
  );
}

function WizardProgress(props: {
  activeStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}) {
  const { activeStep, onStepClick } = props;
  const t = useDevetekTranslations('page.loadBalancersCreate.progress');
  const activeIndex = getStepIndex(activeStep);
  const progressPercent =
    STEPS.length > 1 ? (activeIndex / (STEPS.length - 1)) * 100 : 100;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-bold">{t('title')}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('description')}
          </p>
        </div>
        <div className="w-full lg:w-72">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-3">
        {STEPS.map((step, index) => {
          const isActive = activeStep === step.key;
          const isDone = index < activeIndex;
          const isAccessible = index <= activeIndex;
          const Icon = isDone
            ? CheckCircle2Icon
            : isActive
              ? CircleDotIcon
              : step.icon;

          return (
            <button
              key={step.key}
              type="button"
              disabled={!isAccessible}
              onClick={() => onStepClick(step.key)}
              className={cn(
                'rounded-md border p-3 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent hover:border-border hover:bg-background',
                !isAccessible && 'cursor-not-allowed opacity-50',
              )}
            >
              <span className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md border bg-card',
                    isActive &&
                      'border-primary bg-primary text-primary-foreground',
                    isDone && 'border-emerald-500/40 text-emerald-500',
                  )}
                >
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold uppercase text-muted-foreground">
                    {t('stepLabel', { step: index + 1 })}
                  </span>
                  <span className="block text-sm font-bold">
                    {t(step.labelKey)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {t(step.descKey)}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function StepSurface(props: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { children, description, eyebrow, title } = props;

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="border-b bg-card px-5 py-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}

function CtaBar(props: {
  isSubmitting: boolean;
  isPreview: boolean;
  placement?: 'top' | 'bottom';
  onBack: () => void;
  onNext: () => void;
}) {
  const {
    isPreview,
    isSubmitting,
    onBack,
    onNext,
    placement = 'bottom',
  } = props;
  const t = useDevetekTranslations();
  const nextLabel = isPreview
    ? t('page.loadBalancersCreate.actions.create')
    : t('page.loadBalancersCreate.actions.continue');

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        placement === 'top' ? 'border-b pb-4' : 'border-t pt-4',
      )}
    >
      <Button
        buttonStyle="outline"
        buttonColor="secondary"
        disabled={isSubmitting}
        title={t('common.actions.back')}
        aria-label={t('common.actions.back')}
        onClick={onBack}
      >
        <ArrowLeftIcon />
        {t('common.actions.back')}
      </Button>

      <Button
        disabled={isSubmitting}
        title={nextLabel}
        aria-label={nextLabel}
        onClick={onNext}
      >
        {isSubmitting && <LoaderCircleIcon className="animate-spin" />}
        {nextLabel}
        {!isSubmitting && <ArrowRightIcon />}
      </Button>
    </div>
  );
}

function SectionIntro(props: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  const { description, icon: Icon, title } = props;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-5 sm:flex-row sm:items-start">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-6" />
      </span>
      <span className="min-w-0">
        <h3 className="text-2xl font-bold tracking-normal">{title}</h3>
        <p className="mt-2 max-w-5xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </span>
    </div>
  );
}

function FormField(props: {
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const { children, description, label, required } = props;

  return (
    <label className="grid gap-2">
      <span className="grid gap-1">
        <span className="text-sm font-bold">
          {label}
          {required && <span className="text-destructive">*</span>}
        </span>
        {description && (
          <span className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

function ChoiceButton(props: {
  icon: IconComponent;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const { description, icon: Icon, onClick, selected, title } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-lg border bg-background p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-card">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">{title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
        {selected && (
          <CheckCircle2Icon className="ml-auto size-5 text-primary" />
        )}
      </span>
    </button>
  );
}

function ServerOption(props: {
  server: ServerCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { onSelect, selected, server } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'grid gap-3 rounded-lg border bg-background p-4 text-left transition-colors lg:grid-cols-[auto_minmax(0,1fr)_auto]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-lg border bg-card">
        <ServerIcon className="size-5" />
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-center gap-2">
          <span className="truncate text-lg font-bold">
            {getServerName(server)}
          </span>
          <Badge variant="outline" className="text-emerald-600">
            {server.state.status}
          </Badge>
        </span>
        <span className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary">{server.host.address}</Badge>
          <Badge variant="secondary">SSH {server.ssh.port}</Badge>
          <Badge variant="secondary">{server.ssh.defaultUser}</Badge>
          <Badge variant="secondary">
            {server.system.name} {server.system.version}
          </Badge>
        </span>
      </span>
      <span
        className={cn(
          'flex size-9 items-center justify-center rounded-full border',
          selected
            ? 'border-primary bg-primary text-primary-foreground'
            : 'bg-card text-muted-foreground',
        )}
      >
        {selected && <CheckCircle2Icon className="size-5" />}
      </span>
    </button>
  );
}

function ApplicationOption(props: {
  application: ApplicationCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { application, onSelect, selected } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">
          {application.identity.name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {application.additionalInfo.repoUrl ?? application.id}
        </span>
      </span>
      {selected && <CheckCircle2Icon className="size-5 text-primary" />}
    </button>
  );
}

function StateBlock(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}

function PreviewRow(props: { label: string; value: ReactNode }) {
  return (
    <div className="grid gap-2 px-4 py-3 md:grid-cols-[220px_minmax(0,1fr)]">
      <span className="font-bold text-muted-foreground">{props.label}</span>
      <span className="min-w-0 break-words font-semibold">{props.value}</span>
    </div>
  );
}

function HeaderHelpAction(props: {
  icon: IconComponent;
  label: string;
  href: string;
}) {
  const { href, icon: Icon, label } = props;

  return (
    <Button buttonStyle="outline" buttonColor="secondary" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noreferrer"
      >
        <Icon />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </Button>
  );
}

function getStepIndex(step: WizardStep) {
  return Math.max(
    0,
    STEPS.findIndex((item) => item.key === step),
  );
}

function getServerName(server: ServerCard) {
  return server.host.name || server.host.address || server.id;
}

function getSelectedServer(
  resources: ReturnType<typeof useLoadBalancerCreateResources>,
  serverId?: string,
) {
  if (resources.servers.$status !== 'success') return undefined;

  return resources.servers.list.find((server) => server.id === serverId);
}

function getSelectedInfrastructureModule(
  resources: ReturnType<typeof useLoadBalancerCreateResources>,
  engine?: string,
) {
  if (!engine) return undefined;

  const modules =
    resources.infrastructureModules.$status === 'success'
      ? resources.infrastructureModules
      : resources.infrastructureModules.$status === 'loading'
        ? resources.infrastructureModules.prevData
        : undefined;

  return modules?.list.find((module) => module.id === engine);
}

function getWebserverEngineMetadata(engine?: string) {
  const normalized = normalizeLoadBalancerEngine(engine);
  const knownEngine = normalized as keyof typeof LOAD_BALANCER_WEBSERVER_ENGINE;

  if (knownEngine in LOAD_BALANCER_WEBSERVER_ENGINE) {
    return LOAD_BALANCER_WEBSERVER_ENGINE[knownEngine];
  }

  return LOAD_BALANCER_WEBSERVER_ENGINE.unknown;
}

function normalizeLoadBalancerEngine(engine?: string) {
  switch (String(engine ?? '').toLowerCase()) {
    case 'caddyserver':
    case 'dpanel-router':
      return 'caddy';
    default:
      return engine ?? 'unknown';
  }
}

function mergeCatalogModulesWithServerInventory(
  modules: ServerModule[],
  inventory: DTOs.ModuleInstallationV1[],
) {
  if (inventory.length < 1) return modules;

  return modules.map((module) => {
    const inventoryInstallations = inventory.filter((installation) =>
      moduleMatchesInventoryInstallation(module, installation),
    );

    if (inventoryInstallations.length < 1) return module;

    const installations = dedupeModuleInstallations([
      ...moduleInstallations(module),
      ...inventoryInstallations,
    ]);

    return {
      ...module,
      installation: installations[0] ?? module.installation,
      installations,
      installationStatus: installations[0]?.status ?? module.installationStatus,
    };
  });
}

function moduleMatchesInventoryInstallation(
  module: ServerModule,
  installation: DTOs.ModuleInstallationV1,
) {
  const moduleNames = [
    module.id,
    module.installerName,
    normalizeLoadBalancerEngine(module.id),
    normalizeLoadBalancerEngine(module.installerName),
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeModuleAlias);

  const installationNames = [
    installation.module_name,
    installation.name,
    installation.installation_key?.split('@')[0],
    installation.inventory_path?.split(/[/@:]/)[0],
  ]
    .filter((value): value is string => Boolean(value))
    .map(normalizeModuleAlias);

  return moduleNames.some((moduleName) =>
    installationNames.includes(moduleName),
  );
}

function normalizeModuleAlias(value?: string) {
  const normalized = String(value ?? '')
    .trim()
    .toLowerCase();

  if (['caddy', 'caddyserver', 'dpanel-router'].includes(normalized)) {
    return 'caddyserver';
  }

  if (['go', 'golang'].includes(normalized)) {
    return 'go';
  }

  return normalized;
}

function dedupeModuleInstallations(
  installations: DTOs.ModuleInstallationSummaryV1[],
) {
  const deduped = new Map<string, DTOs.ModuleInstallationSummaryV1>();

  for (const installation of installations) {
    deduped.set(moduleInstallationIdentity(installation), installation);
  }

  return Array.from(deduped.values());
}

function moduleInstallationIdentity(
  installation: DTOs.ModuleInstallationSummaryV1,
) {
  const id = (installation as { id?: string }).id;

  return (
    id ||
    installation.installation_key ||
    [
      installation.status,
      installation.module_ref,
      installation.module_commit,
      installation.variables_hash,
    ]
      .filter(Boolean)
      .join(':')
  );
}

function moduleInstallations(module: ServerModule) {
  return module.installations?.length
    ? module.installations
    : module.installation
      ? [module.installation]
      : [];
}

function hasInstalledModule(module: ServerModule) {
  return moduleInstallations(module).some(
    (installation) => installation.status === 'installed',
  );
}

function hasReportedGatewayModule(module: ServerModule) {
  return moduleInstallations(module).some((installation) =>
    ['installed', 'installing', 'progress'].includes(installation.status),
  );
}

function moduleInstallationLabels(module: ServerModule) {
  const labels = moduleInstallations(module)
    .map((installation) => moduleInstallationLabel(module, installation))
    .filter((label): label is string => Boolean(label));

  return Array.from(new Set(labels)).slice(0, 3);
}

function moduleInstallationLabel(
  module: ServerModule,
  installation: DTOs.ModuleInstallationSummaryV1,
) {
  const key = installation.installation_key;
  const version = key?.match(/@([^:]+)(?::|$)/)?.[1];
  if (version && version !== 'default') return version;

  if (key && key !== module.id && key !== module.installerName) return key;

  return '';
}

function runtimeItemFromInfrastructureModule(
  moduleInfo: ServerModule,
  detail: DTOs.ModuleCatalogDetailV1,
): LoadBalancerRuntimeItem | undefined {
  const action =
    detail.action_details.find((item) => item.name === 'install') ??
    detail.action_details[0];
  const roles = action?.roles?.length
    ? action.roles
    : (detail.source.roles ?? [detail.id]);

  if (!roles.length) return undefined;

  const variables = buildDefaultModuleVariables(detail.inputs);
  const name = moduleInfo.installerName || detail.id || moduleInfo.id;
  const version =
    getModuleVersion(name, variables) ||
    getModuleVersion(moduleInfo.id, variables);
  const installationKey = buildModuleInstallationKey(
    name,
    version,
    detail.install_strategy,
  );

  return {
    name,
    title: detail.name || moduleInfo.name,
    version,
    category: 'infrastructure',
    roles,
    installationKey,
    variables: buildLoadBalancerEngineVariables(name, variables),
    source: 'load-balancer.pipeline',
    moduleRef: detail.input_catalog.ref_name || moduleInfo.refName,
    moduleSourceCommit: detail.resolved_commit || moduleInfo.resolvedCommit,
  };
}

function buildDefaultModuleVariables(inputs: DTOs.ModuleInputV1[]) {
  return inputs.reduce<Record<string, unknown>>((acc, input) => {
    if (input.default == null) return acc;
    acc[input.name] = input.default;
    return acc;
  }, {});
}

function buildLoadBalancerEngineVariables(
  moduleName: string,
  variables: Record<string, unknown>,
) {
  const normalizedName = moduleName.trim().toLowerCase();

  if (
    ['caddy', 'caddyserver', 'dpanel-router'].includes(normalizedName) &&
    variables.router_action == null
  ) {
    return {
      ...variables,
      router_action: 'install',
    };
  }

  return variables;
}

function buildModuleInstallationKey(
  moduleName: string,
  version: string,
  installStrategy?: string,
) {
  const normalizedStrategy = installStrategy?.trim().toLowerCase();

  if (normalizedStrategy === 'versioned' && version) {
    return `${moduleName}@${version}:system`;
  }

  return moduleName;
}

function getModuleVersion(
  moduleId: string,
  variables: Record<string, unknown>,
) {
  const id = moduleId.toLowerCase();
  const get = (key: string) => {
    const value = variables[key];
    if (value == null) return '';
    if (Array.isArray(value)) return String(value[0] ?? '').trim();
    return String(value).trim();
  };

  const directVersion = get(`${id}_version`);
  if (directVersion) return directVersion;
  if (id === 'go' || id.includes('golang')) return get('golang_version');
  if (id === 'nodejs' || id.includes('node')) return get('nodejs_version');
  if (id === 'php' || id.includes('php')) return get('php_version');
  if (id === 'python') return get('python_version');

  for (const [key, value] of Object.entries(variables)) {
    if (!key.endsWith('_version') || value == null) continue;

    const version = Array.isArray(value)
      ? String(value[0] ?? '').trim()
      : String(value).trim();
    if (version) return version;
  }

  return '';
}

function getRoutePreviewItems(
  formValues: Partial<LoadBalancerCreationFormValues>,
  applications: ApplicationCard[],
) {
  if (formValues.lbKind === 'l4') {
    return (formValues.l4rule?.upstreams ?? []).map((upstream, index) => ({
      key: `l4-${index}`,
      match: '/',
      destination: `${upstream.address}:${upstream.port}`,
    }));
  }

  return (formValues.l7rules ?? []).map((rule, index) => {
    const destination =
      rule.type === 'proxy-pass-app'
        ? (applications.find(
            (application) =>
              application.id === rule.applicationIdIfProxyPassApp,
          )?.identity.name ??
          `Application #${rule.applicationIdIfProxyPassApp ?? '-'}`)
        : (rule.upstreamsIfProxyPass ?? [])
            .map((upstream) => `${upstream.address}:${upstream.port}`)
            .join(', ');

    return {
      key: `l7-${index}`,
      match: rule.pathMatch || '/',
      destination: destination || '-',
    };
  });
}

function toCreateLoadBalancerPayload(
  values: LoadBalancerCreationFormValues,
  runtimeItem?: LoadBalancerRuntimeItem,
) {
  let defaultUpstream = '';

  const rules = (() => {
    if (values.lbKind === 'l7' && values.l7rules) {
      return values.l7rules.map((rule) => {
        const isApplicationTarget = rule.type === 'proxy-pass-app';
        const route = normalizeLoadBalancerPathMatchForPayload(rule.pathMatch);
        const upstreams = isApplicationTarget
          ? undefined
          : rule.upstreamsIfProxyPass?.map((upstream) => ({
              address: upstream.address,
              port: String(upstream.port),
            }));

        if (route.pathMatch === '/' && upstreams?.[0]) {
          defaultUpstream = `${upstreams[0].address}:${upstreams[0].port}`;
        }

        return {
          wildcard: route.wildcard,
          pathMatch: route.pathMatch,
          type: 'proxy_pass',
          applicationId: isApplicationTarget
            ? rule.applicationIdIfProxyPassApp
            : undefined,
          upstreams,
        };
      });
    }

    if (values.lbKind === 'l4' && values.l4rule) {
      const first = values.l4rule.upstreams[0];
      if (first) defaultUpstream = `${first.address}:${first.port}`;

      return [
        {
          type: 'proxy_pass',
          pathMatch: '/',
          upstreams: values.l4rule.upstreams.map((upstream) => ({
            address: upstream.address,
            port: String(upstream.port),
          })),
        },
      ];
    }

    return undefined;
  })();

  return {
    domain: values.domain,
    name: values.description,
    engine: values.engine,
    serverId: values.serverId,
    internalDomainMetadata: values.internalDomainMetadata?.id
      ? values.internalDomainMetadata
      : undefined,
    lbKind: values.lbKind,
    protocol: values.features.protocol ?? 'http',
    sslEnabled: values.features.sslEnabled ?? true,
    defaultUpstream,
    rules,
    runtimeItems: runtimeItem ? [runtimeItem] : undefined,
  };
}
