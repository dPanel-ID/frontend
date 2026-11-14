import { useEffect } from 'react';
import type { ReactNode } from 'react';

import { PlusIcon, RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { useCloudProjectCreateModal } from '@/features/cloud-project-create-modal';

import { ApiCloud } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { ChoiceTile } from '@/shared/presentation/molecules/ChoiceTile';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';

import { useForm } from '../../-model';
import { readJoinContract } from '../../-model/join';
import { ErrorInline } from '../../-presentation/ErrorInline';

const PAGE_SIZE = 5;

function getProviderValue(provider: DTOs.CloudProviderContractV1) {
  return provider.id || provider.aliases?.[0] || provider.name || '';
}

function getProviderLabel(provider?: DTOs.CloudProviderContractV1) {
  return provider?.name || provider?.id || provider?.aliases?.[0] || 'Provider';
}

function getProviderFallback(provider?: DTOs.CloudProviderContractV1) {
  return (
    provider?.icon?.fallback ||
    provider?.name?.slice(0, 2) ||
    provider?.id?.slice(0, 2) ||
    'CP'
  ).toUpperCase();
}

function getProviderIconUrl(provider?: DTOs.CloudProviderContractV1) {
  const value = provider?.icon?.url || provider?.icon?.value;

  if (value?.startsWith('http')) return value;

  return undefined;
}

function normalizeProviderContracts(response: {
  $status: string;
  providers?: DTOs.CloudProviderContractV1[];
  prevData?: DTOs.CloudProviderContractListV1;
}) {
  const providers =
    response.$status === 'success'
      ? response.providers
      : response.$status === 'loading'
        ? response.prevData?.providers
        : [];

  return (providers ?? []).filter(
    (provider) =>
      provider.enabled !== false && Boolean(getProviderValue(provider)),
  );
}

function InlineState(props: {
  action?: ReactNode;
  description?: string;
  title: string;
  variant?: 'default' | 'danger';
}) {
  const { action, description, title, variant = 'default' } = props;

  return (
    <div
      className={cn(
        'rounded-lg border bg-background p-4 text-sm',
        variant === 'danger' && 'border-destructive/30 bg-destructive/10',
      )}
    >
      <div
        className={cn(
          'font-medium text-foreground',
          variant === 'danger' && 'text-destructive',
        )}
      >
        {title}
      </div>
      {description && (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

function ProviderIcon(props: { provider: DTOs.CloudProviderContractV1 }) {
  const { provider } = props;
  const iconUrl = getProviderIconUrl(provider);

  if (iconUrl) {
    return (
      <img alt="" className="size-9 rounded-lg object-contain" src={iconUrl} />
    );
  }

  return (
    <CloudProviderLogo
      className="size-9"
      provider={getProviderValue(provider)}
      fallbackLabel={getProviderFallback(provider)}
    />
  );
}

const SubCloudProviderCbo = () => {
  const { form, setLabel } = useForm();
  const [response, refreshProviders] = ApiCloud.Project.Providers.useGet({});
  const providers = normalizeProviderContracts(response);
  const { field } = useController({
    control: form.control,
    name: 'provider',
  });

  const handleSelect = (providerKey: string) => {
    field.onChange(providerKey);
    form.resetField('cloud.projectID');
    // The project belongs to the previous provider, so the review panel
    // must not keep showing its name.
    setLabel('project', '');
    form.setValue('cloud.billingAccountID', undefined);
    form.setValue('cloud.zoneSlug', '');
    form.setValue('regionSlug', '');
    form.setValue('spec.billingCycle', '');
    form.setValue('spec.machineType', '');
    form.setValue('spec.osTemplate', '');
    form.setValue('spec.osName', '');
    form.setValue('spec.osVersion', '');
    form.setValue('spec.productID', undefined);
    form.setValue('vpcBulk', { id: '', subnet: '' });
    // The join choices belong to the previous provider's contract; they are
    // read again once the new contract loads.
    form.setValue('contract', { agentJoin: false, publicIPChoice: false });
    form.setValue('joinMethod', 'agent');
    form.setValue('spec.reservePublicIP', true);
  };

  if (response.$status === 'loading' && response.prevData == null) {
    return (
      <div className="flex min-h-28 items-center justify-center rounded-lg border bg-background">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed') {
    return (
      <InlineState
        title="Provider contract unavailable"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProviders()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  if (providers.length === 0) {
    return (
      <InlineState
        title="No providers are available"
        description="The backend did not return any cloud providers for instant VM creation."
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProviders()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Provider"
      className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
    >
      {providers.map((provider) => {
        const providerValue = getProviderValue(provider);

        return (
          <ChoiceTile
            key={providerValue}
            selected={field.value === providerValue}
            onSelect={() => handleSelect(providerValue)}
            leading={<ProviderIcon provider={provider} />}
            title={
              getCloudProviderLabel(providerValue) || getProviderLabel(provider)
            }
          />
        );
      })}
    </div>
  );
};

function getVmCreateContract(provider?: DTOs.CloudProviderContractV1) {
  return provider?.resource_contracts?.find(
    (contract) => contract.resource === 'vm' && contract.action === 'create',
  );
}

const SubCloudProviderContractStatus = () => {
  const { form } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;

  const [response, refreshContract] =
    ApiCloud.Project.Providers.$Provider.useGet({
      provider: provider ?? '',
      options: { skip: !provider },
    });

  const providerContract =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const vmContract = getVmCreateContract(providerContract);
  const loaded = response.$status === 'success' && Boolean(vmContract);
  const { agentJoin, defaultJoinMethod, publicIPChoice } = readJoinContract(
    vmContract?.fields,
  );

  // Copies the contract's join and public IP choices into the form once it
  // loads, so validation, the payload and the connect step agree on them.
  useEffect(() => {
    if (!loaded) return;
    form.setValue('contract', { agentJoin, publicIPChoice });
    form.setValue('joinMethod', defaultJoinMethod);
    if (!publicIPChoice) form.setValue('spec.reservePublicIP', true);
  }, [agentJoin, defaultJoinMethod, form, loaded, provider, publicIPChoice]);

  if (!provider || response.$status === 'initial') return null;

  if (response.$status === 'loading' && response.prevData == null) {
    return (
      <InlineState
        title="Loading VM creation contract"
        description="Checking the selected provider detail contract before project selection."
      />
    );
  }

  if (response.$status === 'failed') {
    return (
      <InlineState
        title="Could not load VM creation contract"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshContract()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  if (!vmContract) {
    return (
      <InlineState
        title="VM creation is not available"
        description={`${getProviderLabel(providerContract)} did not return a resource=vm action=create contract.`}
        variant="danger"
      />
    );
  }

  // Ready is the normal case; only problems are worth a notice.
  return null;
};

const SubCloudProjectCbo = () => {
  const t = useDevetekTranslations('page.servers.create.vmInstant.cloud');
  const { form, formErrors, setLabel } = useForm();
  const [openCloudProjectCreateModal] = useCloudProjectCreateModal();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;

  const [response, refreshProjects] = ApiCloud.Project.Find.useGet({
    page: 1,
    pageSize: PAGE_SIZE,
    provider,

    options: { skip: !provider },
  });

  const control = useController({
    control: form.control,
    name: 'cloud.projectID',
  });

  if (!provider || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a provider first"
        description="Cloud projects are filtered by the provider contract returned by the backend."
      />
    );
  }

  if (response.$status === 'loading' && response.prevData == null) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-lg border bg-background">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed') {
    return (
      <InlineState
        title="Could not load cloud projects"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProjects()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  const responseData =
    response.$status === 'success' ? response : response.prevData;
  const items: Array<{ label: string; value: string }> = [];

  for (const cloudProject of responseData?.clouds ?? []) {
    if (!cloudProject.name || !cloudProject.id) continue;

    items.push({
      label: cloudProject.name,
      value: String(cloudProject.id),
    });
  }

  const handleOpenCreateProject = () => {
    openCloudProjectCreateModal({
      onSubmitSuccess: refreshProjects,
    });
  };

  const selectProject = (value: string) => {
    form.setValue('regionSlug', '');
    form.setValue('cloud.billingAccountID', undefined);
    form.setValue('cloud.zoneSlug', '');
    form.setValue('spec.billingCycle', '');
    form.setValue('spec.machineType', '');
    form.setValue('spec.osTemplate', '');
    form.setValue('spec.osName', '');
    form.setValue('spec.osVersion', '');
    form.setValue('spec.productID', undefined);
    form.setValue('vpcBulk', { id: '', subnet: '' });
    setLabel(
      'project',
      items.find((item) => item.value === value)?.label ?? '',
    );
    control.field.onChange(value);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {/* Cloud projects belong to a workspace, so a project added in
              another one does not show here. */}
          {items.length === 0 ? t('projectsEmpty') : t('projectsHint')}
        </p>
        <div className="flex items-center gap-2">
          <Button
            aria-label="Refresh cloud projects"
            title="Refresh cloud projects"
            buttonStyle="outline"
            buttonColor="secondary"
            size="icon-sm"
            onClick={() => refreshProjects()}
          >
            <RefreshCwIcon className="size-4" />
          </Button>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={handleOpenCreateProject}
          >
            <PlusIcon className="size-4" />
            Add project
          </Button>
        </div>
      </div>
      <div
        role="radiogroup"
        aria-label="Cloud project"
        className="grid gap-2 sm:grid-cols-2"
      >
        {items.map((item) => (
          <ChoiceTile
            key={item.value}
            selected={control.field.value === item.value}
            onSelect={() => selectProject(item.value)}
            leading={
              <CloudProviderLogo className="size-9" provider={provider} />
            }
            title={item.label}
            subtitle={`Project #${item.value}`}
          />
        ))}
        {items.length === 0 && (
          <button
            type="button"
            onClick={handleOpenCreateProject}
            className="flex min-h-16 items-center justify-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground transition-colors hover:border-sky-400/50 hover:bg-sky-500/5 sm:col-span-2"
          >
            <PlusIcon className="size-4" />
            Connect a cloud project to continue
          </button>
        )}
      </div>
      <ErrorInline message={formErrors.cloud?.projectID?.message} />
    </div>
  );
};

export default function SectionCloud() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h6 className="text-sm font-semibold">Provider</h6>
        <SubCloudProviderCbo />
        <SubCloudProviderContractStatus />
      </div>

      <div className="mt-5 space-y-2">
        <h6 className="text-sm font-semibold">Cloud project</h6>
        <SubCloudProjectCbo />
      </div>
    </div>
  );
}
