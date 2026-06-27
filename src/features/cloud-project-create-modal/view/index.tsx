import {
  CheckCircle2Icon,
  CircleDashedIcon,
  CloudIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
} from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { ApiCloud } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';

import { CpcPropsContext } from '../config/context';
import { CpcFormContext, useCpcFormContext } from '../model/forms/context';
import {
  findProviderContract,
  getCredentialFields,
  getProviderContracts,
  getProviderKind,
  getProviderLabel,
  getProviderValue,
} from '../model/provider-contract';

import { FormBase } from './FormBase';
import { FormGCP } from './FormGCP';
import { FormGenericCredential } from './FormGenericCredential';
import { FormIDCloudHost } from './FormIDCloudHost';
import { FormProxmox } from './FormProxmox';
import type { CloudProjectCreateModalProps as Props } from './types';

const CloudProviderForm = (props: {
  provider?: DTOs.CloudProviderContractV1;
}) => {
  const { provider } = props;
  const { formBase } = useCpcFormContext();

  const cloudProvider = useWatch({
    control: formBase.control,
    name: 'cloudProvider',
  });
  const providerKind = getProviderKind(cloudProvider, provider);

  if (!cloudProvider || !provider) {
    return (
      <section className="rounded-lg border bg-card p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
            <KeyRoundIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Credentials</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Select a provider first. Credential fields will appear from the
              provider contract.
            </p>
          </div>
        </div>
      </section>
    );
  }

  switch (providerKind) {
    case 'aws':
      return <FormGenericCredential provider={provider} />;

    case 'idcloudhost':
      return <FormIDCloudHost provider={provider} />;

    case 'gcp':
      return <FormGCP provider={provider} />;

    case 'proxmox':
      return <FormProxmox provider={provider} />;

    default:
      return <FormGenericCredential provider={provider} />;
  }
};

export default function CloudProjectCreateModal(props: Props) {
  return (
    <ModalLayoutGeneral maxWidth="960px">
      <ModalLayoutGeneral.Title
        canClickClose
        title="Connect Cloud Account"
        description="Create a reusable cloud connection for instant server provisioning."
      />

      <ModalLayoutGeneral.Content className="pt-0">
        <CpcPropsContext value={props}>
          <CpcFormContext>
            <CloudProjectCreateContent />
          </CpcFormContext>
        </CpcPropsContext>
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}

function CloudProjectCreateContent() {
  const { formBase } = useCpcFormContext();
  const [providersResponse, refreshProviders] =
    ApiCloud.Project.Providers.useGet();
  const providers = getProviderContracts(providersResponse);
  const selectedProviderValue = useWatch({
    control: formBase.control,
    name: 'cloudProvider',
  });
  const connectionName = useWatch({
    control: formBase.control,
    name: 'metaTitle',
  });
  const selectedProvider = findProviderContract(
    providers,
    selectedProviderValue,
  );
  const providerError =
    providersResponse.$status === 'failed'
      ? providersResponse.error
      : undefined;

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div className="min-w-0 space-y-4">
        <FormBase
          error={providerError}
          isLoadingProviders={providersResponse.$status === 'loading'}
          onRetryProviders={refreshProviders}
          providers={providers}
        />
        <CloudProviderForm provider={selectedProvider} />
      </div>

      <ConnectionSummary
        connectionName={connectionName}
        provider={selectedProvider}
      />
    </div>
  );
}

function ConnectionSummary(props: {
  connectionName?: string;
  provider?: DTOs.CloudProviderContractV1;
}) {
  const { connectionName, provider } = props;
  const credentialFields = getCredentialFields(provider);
  const requiredCredentialCount = credentialFields.filter(
    (field) => field.required,
  ).length;

  return (
    <aside className="space-y-3">
      <section className="rounded-lg border bg-card">
        <div className="border-b p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
              <CloudIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Review</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Nothing sensitive is shown here.
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2 p-4">
          <SummaryRow
            complete={Boolean(connectionName?.trim())}
            label="Connection"
            value={connectionName?.trim() || 'Not named yet'}
          />
          <SummaryRow
            complete={Boolean(provider)}
            label="Provider"
            value={provider ? getProviderLabel(provider) : 'Not selected yet'}
          />
          <SummaryRow
            complete={Boolean(provider)}
            label="Provider ID"
            value={provider ? getProviderValue(provider) : 'Pending'}
          />
          <SummaryRow
            complete={Boolean(provider)}
            label="Credentials"
            value={
              provider
                ? requiredCredentialCount > 0
                  ? `${requiredCredentialCount} required`
                  : 'No required secret'
                : 'Pending'
            }
          />
        </div>
      </section>

      {provider && (
        <section className="rounded-lg border bg-card p-4">
          <div className="flex items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
              <LockKeyholeIcon className="size-4" />
            </span>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold">Contract</h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {provider.notes?.[0] ||
                  provider.category ||
                  'Backend provider contract'}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <SummaryPill>
                  {getProviderKind(undefined, provider)}
                </SummaryPill>
                {(provider.iac_backends ?? []).slice(0, 2).map((backend) => (
                  <SummaryPill key={backend}>{backend}</SummaryPill>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </aside>
  );
}

function SummaryRow(props: {
  complete: boolean;
  label: string;
  value: string;
}) {
  const { complete, label, value } = props;
  const Icon = complete ? CheckCircle2Icon : CircleDashedIcon;

  return (
    <div className="rounded-md border bg-background p-3">
      <div className="flex items-start gap-2">
        <Icon
          className={cn(
            'mt-0.5 size-4 shrink-0',
            complete ? 'text-emerald-400' : 'text-muted-foreground',
          )}
        />
        <span className="min-w-0">
          <span className="block text-[0.68rem] font-semibold uppercase text-muted-foreground">
            {label}
          </span>
          <span className="mt-1 block break-words text-sm font-medium">
            {value}
          </span>
        </span>
      </div>
    </div>
  );
}

function SummaryPill(props: { children: string }) {
  return (
    <span className="rounded-md border bg-background px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
      {props.children}
    </span>
  );
}
