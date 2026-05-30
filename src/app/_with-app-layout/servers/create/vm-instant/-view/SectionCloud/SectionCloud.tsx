import type { ReactNode } from 'react';
import { useState } from 'react';

import { CloudIcon, KeyRoundIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useCloudProjectCreateModal } from '@/features/cloud-project-create-modal';
import { useSSHKeyCreateModal } from '@/features/ssh-create-modal';

import { ApiCloud, ApiSecret } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { ComboboxWithSearchCb } from '@/shared/presentation/molecules/ComboboxWithSearchCb';

import { useForm } from '../../-model';
import { ErrorInline } from '../../-presentation/ErrorInline';
import { Sectioned } from '../../../-presentation/Sectioned';

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

  if (!value?.startsWith('http')) return undefined;
  return value;
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

  return (providers ?? []).filter((provider) =>
    Boolean(getProviderValue(provider)),
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
      <img alt="" className="size-8 rounded-md object-contain" src={iconUrl} />
    );
  }

  return (
    <span className="flex size-8 items-center justify-center rounded-md border bg-background text-xs font-semibold text-muted-foreground">
      {getProviderFallback(provider)}
    </span>
  );
}

const SubCloudProviderCbo = () => {
  const { form } = useForm();
  const [response, refreshProviders] = ApiCloud.Project.Providers.useGet({});
  const providers = normalizeProviderContracts(response);
  const { field } = useController({
    control: form.control,
    name: 'provider',
  });

  const handleSelect = (providerKey: string) => {
    field.onChange(providerKey);
    form.resetField('cloud.projectID');
    form.setValue('cloud.billingAccountID', undefined);
    form.setValue('regionSlug', '');
    form.setValue('spec.osTemplate', '');
    form.setValue('spec.osName', '');
    form.setValue('spec.osVersion', '');
    form.setValue('vpcBulk', { id: '', subnet: '' });
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
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
      {providers.map((provider) => {
        const providerValue = getProviderValue(provider);
        const isChecked = field.value === providerValue;

        return (
          <button
            key={providerValue}
            type="button"
            aria-pressed={isChecked}
            onClick={() => handleSelect(providerValue)}
            className={cn(
              'group flex min-h-24 flex-col justify-between rounded-lg border bg-background p-3 text-left transition-all',
              'hover:border-primary/45 hover:bg-primary/5',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35 focus-visible:ring-offset-2',
              isChecked && 'border-primary bg-primary/10',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <ProviderIcon provider={provider} />
              <span
                className={cn(
                  'mt-1 flex size-4 shrink-0 rounded-full border',
                  isChecked && 'border-4 border-primary',
                )}
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {getProviderLabel(provider)}
              </p>
              {provider.capabilities?.length ? (
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {provider.capabilities.slice(0, 2).join(', ')}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Backend contract
                </p>
              )}
            </div>
          </button>
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

  const providerContract =
    response.$status === 'success' ? response : response.prevData;
  const vmContract = getVmCreateContract(providerContract);

  if (!vmContract) {
    return (
      <InlineState
        title="VM creation is not available"
        description={`${getProviderLabel(providerContract)} did not return a resource=vm action=create contract.`}
        variant="danger"
      />
    );
  }

  return (
    <InlineState
      title="VM creation contract ready"
      description={`Payload path: ${vmContract.payload_path || 'vm'}; backend: ${vmContract.execution_backend || 'manager'}.`}
    />
  );
};

const SubCloudProjectCbo = () => {
  const { form, formErrors } = useForm();
  const [openCloudProjectCreateModal] = useCloudProjectCreateModal();
  const [projectSearch, setProjectSearch] = useState('');
  const [debouncedProjectSearch] = useDebounceValue(projectSearch);
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;

  const [response, refreshProjects] = ApiCloud.Project.Find.useGet({
    page: 1,
    pageSize: PAGE_SIZE,
    provider,
    searchQuery: debouncedProjectSearch.trim() || undefined,
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
  const items: Array<{ label: string; value: number }> = [];

  for (const cloudProject of responseData?.clouds ?? []) {
    if (!cloudProject.name || !cloudProject.id) continue;

    items.push({
      label: cloudProject.name,
      value: cloudProject.id,
    });
  }

  const handleOpenCreateProject = () => {
    openCloudProjectCreateModal({
      onSubmitSuccess: refreshProjects,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ComboboxWithSearchCb
          classNameButton="w-full min-w-56 flex-1 bg-background"
          searchValue={projectSearch}
          onSearchEnter={setProjectSearch}
          placeholder="Select a cloud project"
          onChange={(value) => {
            form.setValue('regionSlug', '');
            form.setValue('cloud.billingAccountID', undefined);
            form.setValue('spec.osTemplate', '');
            form.setValue('spec.osName', '');
            form.setValue('spec.osVersion', '');
            form.setValue('vpcBulk', { id: '', subnet: '' });
            control.field.onChange(value);
          }}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh cloud projects"
          title="Refresh cloud projects"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
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
          Add
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title={
            projectSearch
              ? 'No matching cloud projects'
              : 'No cloud projects found'
          }
          description={
            projectSearch
              ? 'Try another project name or clear the search.'
              : 'Create or connect a cloud project before provisioning an instant VM.'
          }
        />
      )}

      <ErrorInline message={formErrors.cloud?.projectID?.message} />
    </div>
  );
};

const SubCloudSshCbo = () => {
  const { form, formErrors } = useForm();
  const [openSSHKeyCreateModal] = useSSHKeyCreateModal();
  const [sshKeySearch, setSshKeySearch] = useState('');
  const [debouncedSshKeySearch] = useDebounceValue(sshKeySearch);

  const [response, refreshSshKeys] = ApiSecret.SshKey.Find.useGet({
    page: 1,
    pageSize: PAGE_SIZE,
    searchQuery: debouncedSshKeySearch.trim() || undefined,
  });

  const control = useController({
    control: form.control,
    name: 'cloud.sshKeyID',
  });

  if (
    response.$status === 'initial' ||
    (response.$status === 'loading' && response.prevData == null)
  ) {
    return (
      <div className="flex min-h-24 items-center justify-center rounded-lg border bg-background">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed') {
    return (
      <InlineState
        title="Could not load SSH keys"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshSshKeys()}
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
  const items: Array<{ label: string; value: number }> = [];

  for (const secret of responseData?.secrets ?? []) {
    if (!secret.name || !secret.id) continue;

    items.push({
      label: secret.name,
      value: secret.id,
    });
  }

  const handleOpenCreateKey = () => {
    openSSHKeyCreateModal({
      onSubmitSuccess: refreshSshKeys,
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <ComboboxWithSearchCb
          classNameButton="w-full min-w-56 flex-1 bg-background"
          searchValue={sshKeySearch}
          onSearchEnter={setSshKeySearch}
          placeholder="Select a SSH Key"
          onChange={control.field.onChange}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh SSH keys"
          title="Refresh SSH keys"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshSshKeys()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          onClick={handleOpenCreateKey}
        >
          <KeyRoundIcon className="size-4" />
          Add
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title={sshKeySearch ? 'No matching SSH keys' : 'No SSH keys found'}
          description={
            sshKeySearch
              ? 'Try another SSH key name or clear the search.'
              : 'Create an SSH key before provisioning an instant VM.'
          }
        />
      )}

      <ErrorInline message={formErrors.cloud?.sshKeyID?.message} />
    </div>
  );
};

export default function SectionCloud() {
  return (
    <Sectioned
      withinCard
      sectionIcon={CloudIcon}
      sectionTitle="Cloud Information"
      sectionDescription="Choose a backend-supported provider contract, cloud project, and SSH key."
    >
      <div className="space-y-2">
        <h6 className="text-sm font-semibold">Provider</h6>
        <SubCloudProviderCbo />
        <SubCloudProviderContractStatus />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">Project</h6>
          <SubCloudProjectCbo />
        </div>

        <div className="space-y-2">
          <h6 className="text-sm font-semibold">SSH Key</h6>
          <SubCloudSshCbo />
        </div>
      </div>
    </Sectioned>
  );
}
