import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { GlobeIcon, RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type { BillingAccountItem } from '@/shared/api/cloud.project.billing-accounts.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { useForm } from '../../-model';
import { isBiznetGioProvider } from '../../-model/provider';
import { ErrorInline } from '../../-presentation/ErrorInline';
import { Sectioned } from '../../../-presentation/Sectioned';

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

const SubRegionCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as number | undefined;

  const [response, refreshRegions] = ApiCloud.Regions.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    options: { skip: !cloudProjectID },
  });

  const control = useController({
    control: form.control,
    name: 'regionSlug',
  });

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a cloud project first"
        description="Regions are loaded from the selected cloud project."
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
        title="Could not load regions"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshRegions()}
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
  const items: Array<{ label: ReactNode; value: string }> = [];

  for (const region of responseData?.items ?? []) {
    if (!region.name || !region.id) continue;

    items.push({
      label: (
        <span>
          <span>{region.name}</span>&nbsp;
          <span className="opacity-50">({region.id})</span>
        </span>
      ),
      value: region.id,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Select a Region"
          onChange={(value) => {
            form.setValue('vpcBulk', { id: '', subnet: '' });
            control.field.onChange(value);
          }}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh regions"
          title="Refresh regions"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshRegions()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No regions found"
          description="The selected cloud project did not return any deployable regions."
        />
      )}

      <ErrorInline message={formErrors.regionSlug?.message} />
    </div>
  );
};

const SubVPCCbo = () => {
  const { form, formErrors } = useForm();

  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as number | undefined;
  const regionSlug = useWatch({
    control: form.control,
    name: 'regionSlug',
  });

  const [response, refreshVpcs] = ApiCloud.Vpcs.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    regionSlug: regionSlug ?? '',
    options: { skip: !cloudProjectID || !regionSlug },
  });

  const control = useController({
    control: form.control,
    name: 'vpcBulk',
    rules: {
      required: 'Please select a VPC!',
    },
  });

  if (!cloudProjectID || !regionSlug || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a region first"
        description="VPC options are scoped to the selected project and region."
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
        title="Could not load VPCs"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshVpcs()}
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
  const items: Array<{ label: ReactNode; value: string }> = [];

  for (const vpc of responseData?.items ?? []) {
    if (!vpc.name || !vpc.subnet || !vpc.id) continue;

    items.push({
      label: (
        <span>
          <span>{vpc.name}</span>&nbsp;
          <span className="opacity-50">({vpc.subnet})</span>
        </span>
      ),
      value: `${vpc.subnet} ${vpc.id}`,
    });
  }

  const cboValue = control.field.value
    ? `${control.field.value.subnet} ${control.field.value.id}`
    : undefined;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Select a VPC"
          onChange={(value) => {
            const [subnet, id] = value.split(' ');
            control.field.onChange({ subnet, id });
          }}
          value={cboValue}
          items={items}
        />
        <Button
          aria-label="Refresh VPCs"
          title="Refresh VPCs"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshVpcs()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No VPCs found"
          description="The selected region did not return any VPC networks."
        />
      )}

      <ErrorInline message={formErrors.vpcBulk?.message} />
    </div>
  );
};

function getUsableBillingAccounts(accounts: BillingAccountItem[]) {
  return accounts.filter(
    (account) =>
      account.id != null &&
      account.is_active !== false &&
      account.can_pay !== false,
  );
}

function getPreferredBillingAccount(accounts: BillingAccountItem[]) {
  return (
    accounts.find((account) => account.is_default) ?? accounts[0] ?? undefined
  );
}

const SubBillingAccountCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as number | undefined;
  const billingAccountID = useWatch({
    control: form.control,
    name: 'cloud.billingAccountID',
  });

  const [response, refreshBillingAccounts] =
    ApiCloud.Project.BillingAccounts.$Id.useGet({
      cloudProjectId: String(cloudProjectID),
      options: { skip: !cloudProjectID },
    });

  const responseData =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const accounts = useMemo(
    () => getUsableBillingAccounts(responseData?.items ?? []),
    [responseData?.items],
  );
  const accountIDs = accounts.map((account) => account.id).join(',');

  useEffect(() => {
    if (!cloudProjectID) {
      if (billingAccountID != null) {
        form.setValue('cloud.billingAccountID', undefined);
      }
      return;
    }

    if (!responseData) return;

    const preferredAccount = getPreferredBillingAccount(accounts);

    if (!preferredAccount?.id) {
      if (billingAccountID != null) {
        form.setValue('cloud.billingAccountID', undefined);
      }
      return;
    }

    const selectedAccountStillExists = accounts.some(
      (account) => account.id === billingAccountID,
    );

    if (!selectedAccountStillExists) {
      form.setValue('cloud.billingAccountID', preferredAccount.id);
    }
  }, [
    accountIDs,
    accounts,
    billingAccountID,
    cloudProjectID,
    form,
    responseData,
  ]);

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a cloud project first"
        description="Billing accounts are loaded from the selected cloud project."
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
        title="Could not load billing accounts"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshBillingAccounts()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  const items: Array<{ label: ReactNode; value: number }> = [];

  for (const account of accounts) {
    if (!account.id) continue;

    const label = account.name || account.title || `Billing #${account.id}`;

    items.push({
      label: (
        <span>
          <span>{label}</span>
          {account.is_default && (
            <span className="text-muted-foreground">&nbsp;(default)</span>
          )}
        </span>
      ),
      value: account.id,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Auto-select billing account"
          onChange={(value) => {
            form.setValue('cloud.billingAccountID', value);
          }}
          value={billingAccountID}
          items={items}
        />
        <Button
          aria-label="Refresh billing accounts"
          title="Refresh billing accounts"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshBillingAccounts()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No usable billing accounts found"
          description="The backend will still try to resolve a default account during VM creation."
        />
      )}

      <ErrorInline message={formErrors.cloud?.billingAccountID?.message} />
    </div>
  );
};

export default function SectionRegionVPC() {
  const { form } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;

  if (isBiznetGioProvider(provider)) return null;

  return (
    <Sectioned
      withinCard
      sectionIcon={GlobeIcon}
      sectionTitle="Region Information"
      sectionDescription="Choose where the VM should run using live region and network data from the selected project."
    >
      <div className="space-y-4">
        <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <h6 className="text-sm font-semibold lg:pt-2.5">Region</h6>
          <SubRegionCbo />
        </div>

        <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <h6 className="text-sm font-semibold lg:pt-2.5">
            Billing Account
          </h6>
          <SubBillingAccountCbo />
        </div>

        <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <h6 className="text-sm font-semibold lg:pt-2.5">VPC</h6>
          <SubVPCCbo />
        </div>
      </div>
    </Sectioned>
  );
}
