import { createFileRoute } from '@tanstack/react-router';
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

import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';

import { FormProvider, useForm } from './-model';
import { SectionCloud } from './-view/SectionCloud';
import { SectionLogin } from './-view/SectionLogin';
import { SectionRegionVPC } from './-view/SectionRegionVPC';
import { SectionSpecs } from './-view/SectionSpecs';
import { SectionSubmit } from './-view/SectionSubmit';

export const Route = createFileRoute(
  '/_with-app-layout/servers/create/vm-instant/',
)({
  component: CreateNewServerVmInstantPage,
});

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
        text: 'Create new server',
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
  const regionSlug = useWatch({ control: form.control, name: 'regionSlug' });
  const vpcBulk = useWatch({ control: form.control, name: 'vpcBulk' });
  const osTemplate = useWatch({
    control: form.control,
    name: 'spec.osTemplate',
  });
  const vmName = useWatch({ control: form.control, name: 'spec.vmName' });
  const cpuCore = useWatch({ control: form.control, name: 'spec.cpuCore' });
  const ramSizeGB = useWatch({ control: form.control, name: 'spec.ramSizeGB' });
  const diskSizeGB = useWatch({
    control: form.control,
    name: 'spec.diskSizeGB',
  });
  const username = useWatch({ control: form.control, name: 'login.username' });

  const specSummary =
    cpuCore && ramSizeGB && diskSizeGB
      ? `${cpuCore} CPU / ${ramSizeGB} GB RAM / ${diskSizeGB} GB disk`
      : undefined;
  const readyCount = [
    provider,
    projectID,
    sshKeyID,
    vmName,
    regionSlug,
    billingAccountID || 'auto',
    vpcBulk.id && vpcBulk.subnet,
    osTemplate,
    specSummary,
    username,
  ].filter(Boolean).length;

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
              {readyCount}/10 fields ready
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
        <SummaryRow
          icon={NetworkIcon}
          label="Region"
          value={regionSlug}
          ready={Boolean(regionSlug)}
        />
        <SummaryRow
          icon={CloudIcon}
          label="Billing"
          value={billingAccountID ? `Billing #${billingAccountID}` : 'Auto'}
          ready
        />
        <SummaryRow
          icon={NetworkIcon}
          label="VPC"
          value={vpcBulk.subnet || vpcBulk.id}
          ready={Boolean(vpcBulk.id && vpcBulk.subnet)}
        />
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
          label="Default User"
          value={username}
          ready={Boolean(username)}
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
        title="Create Instant VM"
        description="Provision a cloud server from live backend provider contracts."
      />

      <FormProvider>
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
