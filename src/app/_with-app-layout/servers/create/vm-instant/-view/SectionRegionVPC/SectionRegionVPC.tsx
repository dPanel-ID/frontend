import { useEffect, useMemo } from 'react';
import type { ReactNode } from 'react';

import { RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type { BillingAccountItem } from '@/shared/api/cloud.project.billing-accounts.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { useForm } from '../../-model';
import {
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from '../../-model/provider';
import { ErrorInline } from '../../-presentation/ErrorInline';

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
  }) as string | undefined;

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
            form.setValue('cloud.zoneSlug', '');
            form.setValue('spec.machineType', '');
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

const SubZoneCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const regionSlug = useWatch({
    control: form.control,
    name: 'regionSlug',
  });

  const [response, refreshZones] = ApiCloud.Project.Zones.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    region: regionSlug ?? '',
    options: { skip: !cloudProjectID || !regionSlug },
  });

  const control = useController({
    control: form.control,
    name: 'cloud.zoneSlug',
  });

  if (!cloudProjectID || !regionSlug || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a region first"
        description="Zones are loaded from the selected cloud project and region."
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
        title="Could not load zones"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshZones()}
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

  for (const zone of responseData?.items ?? []) {
    if (!zone.name || !zone.id) continue;

    items.push({
      label: (
        <span>
          <span>{zone.name}</span>&nbsp;
          <span className="opacity-50">({zone.id})</span>
        </span>
      ),
      value: zone.id,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Select a Zone"
          onChange={(value) => {
            form.setValue('spec.machineType', '');
            form.setValue('vpcBulk', { id: '', subnet: '' });
            control.field.onChange(value);
          }}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh zones"
          title="Refresh zones"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshZones()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No zones found"
          description="The selected region did not return any deployable zones."
        />
      )}

      <ErrorInline message={formErrors.cloud?.zoneSlug?.message} />
    </div>
  );
};

/** The network dPanel creates on first use and reuses for every VM. */
export const MANAGED_NETWORK_NAME = 'dpanel-network';

/**
 * AWS and GCP VMs always join dpanel-network: the provider role creates it in
 * the region on first use, so there is nothing to pick, even for a brand new
 * cloud project.
 */
const SubManagedNetwork = (props: { scopeLabel: string }) => {
  const { form } = useForm();

  useEffect(() => {
    form.setValue('vpcBulk', { id: '', subnet: '' });
  }, [form]);

  return (
    <div className="rounded-lg border bg-background p-3">
      <p className="text-sm font-medium">{MANAGED_NETWORK_NAME}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Created automatically in the selected {props.scopeLabel} on first use
        and reused for every VM. Only SSH, HTTP and HTTPS are open.
      </p>
    </div>
  );
};

/**
 * DigitalOcean and IDCloudHost always return a network for a region, so the
 * network is chosen automatically: dpanel-network when it exists, otherwise
 * the provider default (DigitalOcean) or the first network (IDCloudHost).
 */
const SubAutoNetwork = () => {
  const { form, formErrors } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const regionSlug = useWatch({
    control: form.control,
    name: 'regionSlug',
  });
  const usesDigitalOcean = isDigitalOceanProvider(provider);

  const [response, refreshVpcs] = ApiCloud.Vpcs.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    regionSlug: regionSlug ?? '',
    options: { skip: !cloudProjectID || !regionSlug },
  });

  const control = useController({
    control: form.control,
    name: 'vpcBulk',
  });

  const networks = useMemo(() => {
    const data = response.$status === 'success' ? response : undefined;
    return (data?.items ?? []).filter((vpc) => Boolean(vpc.id));
  }, [response]);

  const chosen = useMemo(() => {
    const managed = networks.find((vpc) => vpc.name === MANAGED_NETWORK_NAME);
    if (managed) return managed;
    // DigitalOcean places a droplet in the region's default VPC when no VPC
    // is sent, creating it if needed.
    if (usesDigitalOcean) return undefined;
    return networks[0];
  }, [networks, usesDigitalOcean]);

  const { onChange } = control.field;
  useEffect(() => {
    if (response.$status !== 'success') return;
    onChange({
      id: chosen?.id ?? '',
      subnet: chosen?.subnet ?? chosen?.name ?? chosen?.network ?? '',
    });
  }, [chosen, onChange, response.$status]);

  if (!cloudProjectID || !regionSlug || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a region first"
        description="The network is chosen automatically for the selected region."
      />
    );
  }

  if (response.$status === 'loading') {
    return (
      <div className="flex min-h-12 items-center justify-center rounded-lg border bg-background">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed') {
    return (
      <InlineState
        title="Could not load networks"
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

  if (!chosen && !usesDigitalOcean) {
    return (
      <div className="space-y-2">
        <InlineState
          title="No network found"
          description="The selected region has no network for VM creation. Create one in the provider console, then refresh."
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
        <ErrorInline message={formErrors.vpcBulk?.message} />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="rounded-lg border bg-background p-3">
        <p className="text-sm font-medium">
          {chosen ? chosen.name || chosen.id : 'Default VPC'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {chosen
            ? `Chosen automatically${chosen.subnet ? ` · ${chosen.subnet}` : ''}.`
            : "Uses the region's default VPC, which the provider creates if needed."}
        </p>
      </div>
      <ErrorInline message={formErrors.vpcBulk?.message} />
    </div>
  );
};

const SubNetwork = () => {
  const { form } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;

  if (isGcpProvider(provider))
    return <SubManagedNetwork scopeLabel="zone's region" />;
  if (isAwsProvider(provider)) return <SubManagedNetwork scopeLabel="region" />;
  return <SubAutoNetwork />;
};

function getUsableBillingAccounts(accounts: BillingAccountItem[]) {
  return accounts.filter(
    (account) =>
      normalizeBillingAccountID(account.id) != null &&
      account.is_active !== false &&
      account.can_pay !== false,
  );
}

function normalizeBillingAccountID(accountID: BillingAccountItem['id']) {
  if (typeof accountID === 'number') {
    return Number.isFinite(accountID) ? accountID : undefined;
  }

  if (typeof accountID === 'string') {
    const numericID = Number(accountID.trim());

    return Number.isFinite(numericID) ? numericID : undefined;
  }

  return undefined;
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
  }) as string | undefined;
  const billingAccountID = useWatch({
    control: form.control,
    name: 'cloud.billingAccountID',
  }) as BillingAccountItem['id'] | undefined;
  const selectedBillingAccountID = normalizeBillingAccountID(billingAccountID);

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
      if (selectedBillingAccountID != null) {
        form.setValue('cloud.billingAccountID', undefined);
      }
      return;
    }

    if (!responseData) return;

    const preferredAccount = getPreferredBillingAccount(accounts);

    const preferredAccountID = normalizeBillingAccountID(preferredAccount?.id);

    if (preferredAccountID == null) {
      if (selectedBillingAccountID != null) {
        form.setValue('cloud.billingAccountID', undefined);
      }
      return;
    }

    const selectedAccountStillExists = accounts.some(
      (account) =>
        normalizeBillingAccountID(account.id) === selectedBillingAccountID,
    );

    if (!selectedAccountStillExists) {
      form.setValue('cloud.billingAccountID', preferredAccountID, {
        shouldValidate: true,
      });
    }
  }, [
    accountIDs,
    accounts,
    billingAccountID,
    cloudProjectID,
    form,
    responseData,
    selectedBillingAccountID,
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
    const accountID = normalizeBillingAccountID(account.id);
    if (accountID == null) continue;

    const label = account.name || account.title || `Billing #${accountID}`;

    items.push({
      label: (
        <span>
          <span>{label}</span>
          {account.is_default && (
            <span className="text-muted-foreground">&nbsp;(default)</span>
          )}
        </span>
      ),
      value: accountID,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Auto-select billing account"
          onChange={(value) => {
            form.setValue('cloud.billingAccountID', value, {
              shouldValidate: true,
            });
          }}
          value={selectedBillingAccountID}
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
  const usesGcp = isGcpProvider(provider);
  const usesDigitalOcean = isDigitalOceanProvider(provider);
  const usesAws = isAwsProvider(provider);

  if (isBiznetGioProvider(provider)) return null;

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <h6 className="text-sm font-semibold lg:pt-2.5">Region</h6>
          <SubRegionCbo />
        </div>

        {usesGcp ? (
          <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
            <h6 className="text-sm font-semibold lg:pt-2.5">Zone</h6>
            <SubZoneCbo />
          </div>
        ) : !usesDigitalOcean && !usesAws ? (
          <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
            <h6 className="text-sm font-semibold lg:pt-2.5">Billing Account</h6>
            <SubBillingAccountCbo />
          </div>
        ) : null}

        <div className="grid gap-2 lg:grid-cols-[12rem_minmax(0,1fr)] lg:items-start">
          <h6 className="text-sm font-semibold lg:pt-2.5">Network</h6>
          <SubNetwork />
        </div>
      </div>
    </div>
  );
}
