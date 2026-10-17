import { useEffect } from 'react';

import { createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import {
  CheckCircle2Icon,
  CircleIcon,
  CloudIcon,
  KeyRoundIcon,
  NetworkIcon,
  ServerIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';

import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

import { FormProvider, useForm } from './-model';
import {
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from './-model/provider';
import { SectionCloud } from './-view/SectionCloud';
import { SectionLogin } from './-view/SectionLogin';
import { SectionRegionVPC } from './-view/SectionRegionVPC';
import { SectionSpecs } from './-view/SectionSpecs';
import { SectionSubmit } from './-view/SectionSubmit';

export const Route = createFileRoute(
  '/_with-app-layout/servers/create/vm-instant/',
)({
  component: CreateNewServerVmInstantPage,
  // ?provider=aws preselects a provider, for example from /servers/create.
  validateSearch: zodValidator(
    z.object({ provider: z.string().max(64).optional().catch(undefined) }),
  ),
});

/** Applies ?provider= once, without overriding a choice already made. */
function PresetProvider() {
  const { provider } = Route.useSearch();
  const { form } = useForm();

  useEffect(() => {
    if (provider && !form.getValues('provider')) {
      form.setValue('provider', provider);
    }
  }, [provider, form]);

  return null;
}

const BREADCRUMB = (
  <Breadcrumb
    items={[
      {
        text: 'Resources',
      },
      {
        text: 'Servers',
        url: '/servers',
      },
      {
        text: 'Create Server',
        url: '/servers/create',
      },
    ]}
  />
);

function SummaryRow(props: {
  icon: LucideIcon;
  label: string;
  ready?: boolean;
  value?: number | string;
}) {
  const { icon: Icon, label, ready, value } = props;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-md bg-background/60 p-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {ready ? (
            <CheckCircle2Icon className="size-3.5 shrink-0 text-primary" />
          ) : (
            <CircleIcon className="size-3.5 shrink-0 text-muted-foreground/60" />
          )}
          <p className="truncate text-[11px] font-medium uppercase tracking-normal text-muted-foreground">
            {label}
          </p>
        </div>
        <p
          className={cn(
            'mt-1 truncate text-sm font-medium',
            !value && 'text-muted-foreground',
          )}
        >
          {value || 'Not selected'}
        </p>
      </div>
    </div>
  );
}

function ProvisioningSummary() {
  const { form } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' });
  const projectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  });
  const sshKeyID = useWatch({ control: form.control, name: 'cloud.sshKeyID' });
  const billingAccountID = useWatch({
    control: form.control,
    name: 'cloud.billingAccountID',
  });
  const billingCycle = useWatch({
    control: form.control,
    name: 'spec.billingCycle',
  });
  const regionSlug = useWatch({ control: form.control, name: 'regionSlug' });
  const zoneSlug = useWatch({
    control: form.control,
    name: 'cloud.zoneSlug',
  });
  const vpcBulk = useWatch({ control: form.control, name: 'vpcBulk' });
  const osTemplate = useWatch({
    control: form.control,
    name: 'spec.osTemplate',
  });
  const productID = useWatch({ control: form.control, name: 'spec.productID' });
  const machineType = useWatch({
    control: form.control,
    name: 'spec.machineType',
  });
  const vmName = useWatch({ control: form.control, name: 'spec.vmName' });
  const cpuCore = useWatch({ control: form.control, name: 'spec.cpuCore' });
  const ramSizeGB = useWatch({ control: form.control, name: 'spec.ramSizeGB' });
  const diskSizeGB = useWatch({
    control: form.control,
    name: 'spec.diskSizeGB',
  });
  const username = useWatch({ control: form.control, name: 'login.username' });

  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);
  const usesDigitalOcean = isDigitalOceanProvider(provider);
  const usesAws = isAwsProvider(provider);
  const specSummary =
    usesGcp && diskSizeGB
      ? `${diskSizeGB} GB boot disk`
      : usesDigitalOcean && machineType
        ? machineType
        : cpuCore && ramSizeGB && diskSizeGB
          ? `${cpuCore} CPU / ${ramSizeGB} GB RAM / ${diskSizeGB} GB disk`
          : undefined;
  const readyFields = usesBiznetGio
    ? [
        provider,
        projectID,
        sshKeyID,
        vmName,
        productID,
        billingCycle,
        osTemplate,
        specSummary,
        username,
      ]
    : usesGcp
      ? [
          provider,
          projectID,
          sshKeyID,
          vmName,
          regionSlug,
          zoneSlug,
          machineType,
          osTemplate,
          diskSizeGB,
          username,
        ]
      : usesDigitalOcean || usesAws
        ? [
            provider,
            projectID,
            sshKeyID,
            vmName,
            regionSlug,
            machineType,
            osTemplate,
            username,
          ]
        : [
            provider,
            projectID,
            sshKeyID,
            vmName,
            regionSlug,
            billingAccountID || 'auto',
            vpcBulk.id,
            osTemplate,
            specSummary,
            username,
          ];
  const readyCount = readyFields.filter(Boolean).length;
  const totalFields = readyFields.length;

  return (
    <aside className="rounded-lg border bg-card xl:sticky xl:top-20 xl:h-max">
      <div className="border-b p-4">
        <div className="flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-lg border bg-background text-primary">
            <ServerIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Provisioning Review</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {readyCount}/{totalFields} fields ready
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1">
        <SummaryRow
          icon={CloudIcon}
          label="Provider"
          value={provider}
          ready={Boolean(provider)}
        />
        <SummaryRow
          icon={CloudIcon}
          label="Cloud Project"
          value={projectID ? `Project #${projectID}` : undefined}
          ready={Boolean(projectID)}
        />
        <SummaryRow
          icon={KeyRoundIcon}
          label="SSH Key"
          value={sshKeyID ? `SSH key #${sshKeyID}` : undefined}
          ready={Boolean(sshKeyID)}
        />
        <SummaryRow
          icon={ServerIcon}
          label="VM Name"
          value={vmName}
          ready={Boolean(vmName)}
        />
        {!usesBiznetGio && (
          <SummaryRow
            icon={NetworkIcon}
            label="Region"
            value={regionSlug}
            ready={Boolean(regionSlug)}
          />
        )}
        {usesBiznetGio ? (
          <>
            <SummaryRow
              icon={ServerIcon}
              label="Product"
              value={productID ? `Product #${productID}` : undefined}
              ready={Boolean(productID)}
            />
            <SummaryRow
              icon={CloudIcon}
              label="Billing Cycle"
              value={billingCycle}
              ready={Boolean(billingCycle)}
            />
          </>
        ) : usesGcp ? (
          <>
            <SummaryRow
              icon={NetworkIcon}
              label="Zone"
              value={zoneSlug}
              ready={Boolean(zoneSlug)}
            />
            <SummaryRow
              icon={ServerIcon}
              label="Machine Type"
              value={machineType}
              ready={Boolean(machineType)}
            />
            <SummaryRow
              icon={NetworkIcon}
              label="Network"
              value="dpanel-network"
              ready
            />
          </>
        ) : usesDigitalOcean ? (
          <>
            <SummaryRow
              icon={ServerIcon}
              label="Droplet Size"
              value={machineType}
              ready={Boolean(machineType)}
            />
            <SummaryRow
              icon={NetworkIcon}
              label="Network"
              value={vpcBulk.subnet || vpcBulk.id || 'Default VPC'}
              ready
            />
          </>
        ) : usesAws ? (
          <>
            <SummaryRow
              icon={ServerIcon}
              label="Instance Type"
              value={machineType}
              ready={Boolean(machineType)}
            />
            <SummaryRow
              icon={NetworkIcon}
              label="Network"
              value="dpanel-network"
              ready
            />
          </>
        ) : (
          <>
            <SummaryRow
              icon={CloudIcon}
              label="Billing"
              value={billingAccountID ? `Billing #${billingAccountID}` : 'Auto'}
              ready
            />
            <SummaryRow
              icon={NetworkIcon}
              label="Network"
              value={vpcBulk.subnet || vpcBulk.id}
              ready={Boolean(vpcBulk.id)}
            />
          </>
        )}
        <SummaryRow
          icon={ServerIcon}
          label="Image"
          value={osTemplate}
          ready={Boolean(osTemplate)}
        />
        <SummaryRow
          icon={ServerIcon}
          label="Size"
          value={specSummary}
          ready={Boolean(specSummary)}
        />
        <SummaryRow
          icon={KeyRoundIcon}
          label={usesBiznetGio ? 'Console User' : 'Default User'}
          value={
            usesGcp ? 'ubuntu' : usesAws ? 'ubuntu (AMI default)' : username
          }
          ready={usesGcp || usesAws || Boolean(username)}
        />
      </div>
    </aside>
  );
}

function CreateNewServerVmInstantPage() {
  return (
    <>
      <PageHeader
        headnote={BREADCRUMB}
        title="Launch a cloud server"
        description="Pick a provider, region and size. dPanel creates the VM in your cloud account and sets it up for you."
      />

      <FormProvider>
        <PresetProvider />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="flex min-w-0 flex-col gap-4">
            <SectionCloud />
            <SectionRegionVPC />
            <SectionSpecs />
            <SectionLogin />
            <SectionSubmit />
          </div>

          <ProvisioningSummary />
        </div>
      </FormProvider>
    </>
  );
}
