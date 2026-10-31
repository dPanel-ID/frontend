import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { Link, createFileRoute } from '@tanstack/react-router';
import { zodValidator } from '@tanstack/zod-adapter';
import {
  ArrowLeftIcon,
  CloudIcon,
  CloudLightningIcon,
  FileTextIcon,
  HardDriveIcon,
  MapPinIcon,
  RocketIcon,
  UserRoundIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { ReviewPanel } from '@/shared/presentation/organisms/ReviewPanel';
import type { ReviewPanelRow } from '@/shared/presentation/organisms/ReviewPanel';
import { StepCard } from '@/shared/presentation/organisms/StepCard';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import { FormProvider, useForm } from './-model';
import { formSchema } from './-model/form';
import {
  getFixedLoginUser,
  isAlibabaCloudProvider,
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
  isZonalProvider,
  usesManagedNetwork,
} from './-model/provider';
import useLaunch from './-usecase/use-launch';
import { SectionCloud } from './-view/SectionCloud';
import { SectionLogin } from './-view/SectionLogin';
import { SectionRegionVPC } from './-view/SectionRegionVPC';
import { SectionSpecs } from './-view/SectionSpecs';

export const Route = createFileRoute(
  '/_with-app-layout/servers/create/vm-instant/',
)({
  head: () => ({
    meta: [{ title: 'Launch a cloud server | dnocs' }],
  }),
  component: LaunchCloudServerPage,
  // ?provider=aws preselects a provider, for example from /servers/create.
  validateSearch: zodValidator(
    z.object({ provider: z.string().max(64).optional().catch(undefined) }),
  ),
});

function LaunchCloudServerPage() {
  return (
    <>
      <title>Launch a cloud server | dnocs</title>

      <FlowHero
        accent="sky"
        icon={CloudLightningIcon}
        badge="Recommended"
        title="Launch a cloud server"
        description="Pick a provider, a location and a size. dPanel creates the VM in your cloud account and sets it up for you."
        duration="Ready in about 10–20 minutes"
        headnote={
          <Breadcrumb
            items={[
              { text: 'Dashboard', url: '/dashboard' },
              { text: 'Servers', url: '/servers' },
              { text: 'Create Server', url: '/servers/create' },
            ]}
          />
        }
        aside={
          <a
            href={LINK__DOCUMENTATION}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background"
          >
            <FileTextIcon className="size-4" />
            Docs
          </a>
        }
      />

      <FormProvider>
        <PresetProvider />
        <LaunchFlow />
      </FormProvider>
    </>
  );
}

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

type StepKey = 'cloud' | 'location' | 'spec' | 'access';

/** The review rows each step owns; a step is done when all of them are. */
const STEP_ROWS: Record<StepKey, string[]> = {
  cloud: ['provider', 'project', 'sshKey'],
  location: ['location', 'network'],
  spec: ['name', 'size', 'image'],
  access: ['login'],
};

function LaunchFlow() {
  const { form, labels } = useForm();
  const values = useWatch({ control: form.control });
  const { isSubmitting, launch, reset } = useLaunch();

  const provider = values.provider ?? '';
  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);
  const usesAlibabaCloud = isAlibabaCloudProvider(provider);
  const usesZone = isZonalProvider(provider);
  const managedNetwork = usesManagedNetwork(provider);
  const fixedLoginUser = getFixedLoginUser(provider);
  const needsAccessStep = !fixedLoginUser;
  const picksInstanceType =
    usesZone || isAwsProvider(provider) || isDigitalOceanProvider(provider);

  // One validation pass drives every "done" state, so the panel can never
  // disagree with what the form will accept.
  const { issuePaths, valid } = useMemo(() => {
    const result = formSchema.safeParse(values);
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

  const steps: Array<{
    key: StepKey;
    icon: LucideIcon;
    title: string;
    description: string;
    content: ReactNode;
  }> = [
    {
      key: 'cloud',
      icon: CloudIcon,
      title: 'Provider and project',
      description:
        'Where the server runs, which cloud project pays for it, and the SSH key dPanel uses to reach it.',
      content: <SectionCloud />,
    },
    ...(usesBiznetGio
      ? []
      : [
          {
            key: 'location' as const,
            icon: MapPinIcon,
            title: 'Location',
            description: managedNetwork
              ? 'The region to launch in. dPanel puts the server on dpanel-network, created on first use.'
              : 'The region to launch in. The network is chosen for you.',
            content: <SectionRegionVPC />,
          },
        ]),
    {
      key: 'spec',
      icon: HardDriveIcon,
      title: 'Size and image',
      description: 'Name the server, then choose its size and Ubuntu release.',
      content: <SectionSpecs />,
    },
    ...(needsAccessStep
      ? [
          {
            key: 'access' as const,
            icon: UserRoundIcon,
            title: 'Access',
            description: 'The first login dPanel uses to set up the server.',
            content: <SectionLogin />,
          },
        ]
      : []),
  ];

  const providerLabel = getCloudProviderLabel(provider) || provider;
  const sizeValue = usesBiznetGio
    ? labels.product
    : usesAlibabaCloud && values.spec?.machineType
      ? `${values.spec.machineType} · ${values.spec.diskSizeGB} GB disk`
      : picksInstanceType
        ? values.spec?.machineType
        : values.spec?.cpuCore &&
            values.spec.ramSizeGB &&
            values.spec.diskSizeGB
          ? `${values.spec.cpuCore} vCPU · ${values.spec.ramSizeGB} GB RAM · ${values.spec.diskSizeGB} GB disk`
          : undefined;
  const sizeFields = usesBiznetGio
    ? ['spec.productID', 'spec.billingCycle']
    : usesGcp || usesAlibabaCloud
      ? ['spec.machineType', 'spec.diskSizeGB']
      : picksInstanceType
        ? ['spec.machineType']
        : ['spec.cpuCore', 'spec.ramSizeGB', 'spec.diskSizeGB'];
  const imageValue =
    values.spec?.osName && values.spec.osVersion
      ? `${capitalize(values.spec.osName)} ${values.spec.osVersion}`
      : values.spec?.osTemplate || undefined;
  const loginValue = fixedLoginUser ?? values.login?.username;

  const rows: ReviewPanelRow[] = buildRows();
  const stepDone = (step: StepKey) =>
    rows
      .filter((row) => STEP_ROWS[step].includes(row.key))
      .every((row) => row.done);

  function buildRows(): ReviewPanelRow[] {
    return [
      {
        key: 'provider',
        label: 'Provider',
        value: provider ? (
          <span className="inline-flex items-center gap-1.5">
            <CloudProviderLogo
              className="size-5 rounded p-0.5"
              provider={provider}
            />
            {providerLabel}
          </span>
        ) : undefined,
        done: Boolean(provider) && clean('provider'),
      },
      {
        key: 'project',
        label: 'Cloud project',
        value: labels.project,
        done: Boolean(values.cloud?.projectID) && clean('cloud.projectID'),
      },
      {
        key: 'sshKey',
        label: 'SSH key',
        value: labels.sshKey,
        done: Boolean(values.cloud?.sshKeyID) && clean('cloud.sshKeyID'),
      },
      ...(usesBiznetGio
        ? []
        : [
            {
              key: 'location',
              label: 'Location',
              value: usesZone ? values.cloud?.zoneSlug : values.regionSlug,
              done:
                Boolean(
                  usesZone ? values.cloud?.zoneSlug : values.regionSlug,
                ) && clean('regionSlug', 'cloud.zoneSlug'),
            },
            {
              key: 'network',
              label: 'Network',
              value: managedNetwork
                ? 'dpanel-network'
                : values.vpcBulk?.subnet ||
                  values.vpcBulk?.id ||
                  (isDigitalOceanProvider(provider) && values.regionSlug
                    ? 'Default VPC'
                    : undefined),
              done: managedNetwork
                ? Boolean(provider)
                : Boolean(values.regionSlug) && clean('vpcBulk'),
            },
          ]),
      {
        key: 'name',
        label: 'Server name',
        value: values.spec?.vmName,
        done: Boolean(values.spec?.vmName) && clean('spec.vmName'),
      },
      {
        key: 'size',
        label: 'Size',
        value: sizeValue,
        done: Boolean(sizeValue) && clean(...sizeFields),
      },
      {
        key: 'image',
        label: 'Image',
        value: imageValue,
        done: Boolean(values.spec?.osTemplate) && clean('spec.osTemplate'),
      },
      {
        key: 'login',
        label: 'Login user',
        value: loginValue,
        done: needsAccessStep
          ? Boolean(provider) && clean('login')
          : Boolean(provider),
      },
    ];
  }

  const activeStep = steps.find((step) => !stepDone(step.key))?.key;

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/servers/create"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        All ways to add a server
      </Link>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          {steps.map((step, index) => (
            <StepCard
              key={step.key}
              number={index + 1}
              done={stepDone(step.key)}
              active={activeStep === step.key}
              icon={step.icon}
              title={step.title}
              description={step.description}
            >
              {step.content}
            </StepCard>
          ))}
        </div>

        <ReviewPanel
          leading={
            provider ? (
              <CloudProviderLogo className="size-12 p-2" provider={provider} />
            ) : undefined
          }
          eyebrow="Review"
          title={provider ? 'Almost ready' : 'Pick a provider to start'}
          readyTitle="Ready to launch"
          rows={rows}
          action={
            <button
              type="button"
              className={flowCtaClassName('sky', 'w-full py-2.5')}
              disabled={!valid || isSubmitting}
              onClick={launch}
            >
              {isSubmitting ? (
                <Spinner className="size-4" />
              ) : (
                <RocketIcon className="size-4" />
              )}
              Launch server
            </button>
          }
          secondaryAction={
            <Button
              className="w-full"
              buttonStyle="ghost"
              buttonColor="secondary"
              onClick={reset}
            >
              Clear form
            </Button>
          }
          footnote="dPanel creates the VM in your cloud account, then installs its agent. The provider bills the VM while it runs. Ready in about 10 to 20 minutes."
        />
      </div>
    </div>
  );
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
