import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { HardDriveIcon, RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type { OsTemplateItem } from '@/shared/api/cloud.project.ostemplates.$id';
import type { ProductItem } from '@/shared/api/cloud.project.products.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Combobox } from '@/shared/presentation/molecules/Combobox';
import { ComboboxWithSearchCb } from '@/shared/presentation/molecules/ComboboxWithSearchCb';

import { OPTS_CPU_CORE, OPTS_DISK_GB, OPTS_RAM_GB } from '../../-config';
import { useForm } from '../../-model';
import {
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
} from '../../-model/provider';
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

function formatRam(ramMb?: number) {
  if (!ramMb) return undefined;

  if (ramMb >= 1024) {
    return `${Math.round((ramMb / 1024) * 10) / 10} GB RAM`;
  }

  return `${ramMb} MB RAM`;
}

function getProductSizeLabel(product?: ProductItem) {
  const specs = [
    product?.vcpu ? `${product.vcpu} CPU` : undefined,
    formatRam(product?.ram_mb),
    product?.disk_gb ? `${product.disk_gb} GB disk` : undefined,
  ].filter(Boolean);

  return specs.join(' / ');
}

function getProductLabel(product: ProductItem) {
  const sizeLabel = getProductSizeLabel(product);
  const productName = product.name || product.value || `Product #${product.id}`;

  if (!sizeLabel) return productName;

  return `${productName} (${sizeLabel})`;
}

function getProductCycleItems(product?: ProductItem) {
  const cycles = product?.billing_cycles ?? [];

  if (cycles.length > 0) {
    return cycles
      .filter((cycle) => cycle.cycle)
      .map((cycle) => ({
        label: cycle.price
          ? `${cycle.label || cycle.cycle} - ${cycle.price}`
          : cycle.label || cycle.cycle || 'Cycle',
        value: cycle.cycle || '',
      }));
  }

  if (!product?.default_cycle) return [];

  return [
    {
      label: product.default_cycle,
      value: product.default_cycle,
    },
  ];
}

function getPreferredCycle(product?: ProductItem) {
  return product?.default_cycle || product?.billing_cycles?.[0]?.cycle || '';
}

function buildGcpMachineTypeFilter(search: string) {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) return undefined;
  if (trimmedSearch.includes('=')) return trimmedSearch;

  return `name=${trimmedSearch}*`;
}

const SubBiznetProductFields = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const productID = useWatch({
    control: form.control,
    name: 'spec.productID',
  });
  const billingCycle = useWatch({
    control: form.control,
    name: 'spec.billingCycle',
  });

  const [response, refreshProducts] = ApiCloud.Project.Products.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    options: { skip: !cloudProjectID },
  });

  const productControl = useController({
    control: form.control,
    name: 'spec.productID',
  });
  const cycleControl = useController({
    control: form.control,
    name: 'spec.billingCycle',
  });

  const responseData =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const products = useMemo(() => responseData?.items ?? [], [responseData]);
  const productIDs = products.map((product) => product.id).join(',');
  const selectedProduct = products.find((product) => product.id === productID);
  const cycleItems = useMemo(
    () => getProductCycleItems(selectedProduct),
    [selectedProduct],
  );

  useEffect(() => {
    if (!cloudProjectID) {
      form.setValue('spec.productID', undefined);
      form.setValue('spec.billingCycle', '');
      return;
    }

    if (!responseData) return;

    if (!selectedProduct) {
      if (productID != null) {
        form.setValue('spec.productID', undefined);
        form.setValue('spec.billingCycle', '');
      }
      return;
    }

    if (selectedProduct.vcpu) {
      form.setValue('spec.cpuCore', selectedProduct.vcpu);
    }

    if (selectedProduct.ram_mb) {
      form.setValue('spec.ramSizeGB', selectedProduct.ram_mb / 1024);
    }

    if (selectedProduct.disk_gb) {
      form.setValue('spec.diskSizeGB', selectedProduct.disk_gb);
    }

    const selectedCycleStillExists = cycleItems.some(
      (cycle) => cycle.value === billingCycle,
    );

    if (!selectedCycleStillExists) {
      form.setValue('spec.billingCycle', getPreferredCycle(selectedProduct));
    }
  }, [
    billingCycle,
    cloudProjectID,
    cycleItems,
    form,
    productID,
    productIDs,
    responseData,
    selectedProduct,
  ]);

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a cloud project first"
        description="Biznet Gio products are returned by the selected cloud project."
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
        title="Could not load products"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProducts()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  const productItems = products
    .filter((product) => product.id != null)
    .map((product) => ({
      label: getProductLabel(product),
      value: product.id as number,
    }));

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">Product</h6>
          <div className="flex items-center gap-2">
            <Combobox
              classNameButton="w-full flex-1 bg-background"
              placeholder="Select a NEO Lite product"
              onChange={(value) => {
                const product = products.find((item) => item.id === value);

                form.setValue('spec.osTemplate', '');
                form.setValue('spec.osName', '');
                form.setValue('spec.osVersion', '');
                form.setValue('spec.billingCycle', getPreferredCycle(product));
                if (product?.vcpu) form.setValue('spec.cpuCore', product.vcpu);
                if (product?.ram_mb) {
                  form.setValue('spec.ramSizeGB', product.ram_mb / 1024);
                }
                if (product?.disk_gb) {
                  form.setValue('spec.diskSizeGB', product.disk_gb);
                }
                productControl.field.onChange(value);
              }}
              value={productControl.field.value}
              items={productItems}
            />
            <Button
              aria-label="Refresh products"
              title="Refresh products"
              buttonStyle="outline"
              buttonColor="secondary"
              size="icon"
              onClick={() => refreshProducts()}
            >
              <RefreshCwIcon className="size-4" />
            </Button>
          </div>
          {productItems.length === 0 && (
            <InlineState
              title="No products found"
              description="The selected Biznet Gio cloud project did not return deployable NEO Lite products."
            />
          )}
          <ErrorInline message={formErrors.spec?.productID?.message} />
        </div>

        <div className="space-y-2">
          <h6 className="text-sm font-semibold">Billing Cycle</h6>
          <Combobox
            classNameButton="w-full bg-background"
            placeholder="Select a billing cycle"
            onChange={cycleControl.field.onChange}
            value={cycleControl.field.value}
            items={cycleItems}
          />
          <ErrorInline message={formErrors.spec?.billingCycle?.message} />
        </div>
      </div>

      {selectedProduct && (
        <div className="grid gap-2 rounded-lg border bg-background p-3 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">CPU</p>
            <p className="mt-1 font-semibold">
              {selectedProduct.vcpu ?? '-'} cores
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">RAM</p>
            <p className="mt-1 font-semibold">
              {formatRam(selectedProduct.ram_mb) ?? '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Disk</p>
            <p className="mt-1 font-semibold">
              {selectedProduct.disk_gb ? `${selectedProduct.disk_gb} GB` : '-'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const SubGcpMachineTypeCbo = () => {
  const { form, formErrors } = useForm();
  const [machineTypeSearch, setMachineTypeSearch] = useState('');
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const zoneSlug = useWatch({
    control: form.control,
    name: 'cloud.zoneSlug',
  });
  const machineType = useWatch({
    control: form.control,
    name: 'spec.machineType',
  });
  const effectiveMachineTypeSearch =
    cloudProjectID && zoneSlug ? machineTypeSearch : '';

  const [response, refreshProducts] = ApiCloud.Project.Products.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    filter: buildGcpMachineTypeFilter(effectiveMachineTypeSearch),
    zone: zoneSlug ?? '',
    options: { skip: !cloudProjectID || !zoneSlug },
  });

  const control = useController({
    control: form.control,
    name: 'spec.machineType',
  });

  const responseData =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const products = useMemo(() => responseData?.items ?? [], [responseData]);
  const machineTypes = products
    .map((product) => product.value || product.name || '')
    .filter(Boolean)
    .join(',');
  const selectedProduct = products.find(
    (product) => (product.value || product.name) === machineType,
  );

  useEffect(() => {
    if (!cloudProjectID || !zoneSlug) {
      form.setValue('spec.machineType', '');
      return;
    }

    if (!responseData || !machineType) return;

    if (!selectedProduct) {
      if (!effectiveMachineTypeSearch) form.setValue('spec.machineType', '');
      return;
    }

    if (selectedProduct.vcpu) {
      form.setValue('spec.cpuCore', selectedProduct.vcpu);
    }

    if (selectedProduct.ram_mb) {
      form.setValue('spec.ramSizeGB', selectedProduct.ram_mb / 1024);
    }

    if (selectedProduct.disk_gb) {
      form.setValue('spec.diskSizeGB', selectedProduct.disk_gb);
    }
  }, [
    cloudProjectID,
    form,
    effectiveMachineTypeSearch,
    machineType,
    machineTypes,
    responseData,
    selectedProduct,
    zoneSlug,
  ]);

  if (!cloudProjectID || !zoneSlug || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a zone first"
        description="GCP machine types are loaded from the selected cloud project and zone."
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
        title="Could not load machine types"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProducts()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  const productItems = products
    .map((product) => {
      const value = product.value || product.name || '';
      if (!value) return undefined;

      return {
        label: getProductLabel(product),
        value,
      };
    })
    .filter(Boolean) as Array<{ label: string; value: string }>;

  if (
    machineType &&
    !productItems.some((product) => product.value === machineType)
  ) {
    productItems.unshift({
      label: machineType,
      value: machineType,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <ComboboxWithSearchCb
          classNameButton="w-full flex-1 bg-background"
          placeholder="Search and select a machine type"
          onChange={(value) => {
            const product = products.find(
              (item) => (item.value || item.name) === value,
            );

            if (product?.vcpu) form.setValue('spec.cpuCore', product.vcpu);
            if (product?.ram_mb) {
              form.setValue('spec.ramSizeGB', product.ram_mb / 1024);
            }
            if (product?.disk_gb) {
              form.setValue('spec.diskSizeGB', product.disk_gb);
            }

            control.field.onChange(value);
          }}
          onSearchEnter={setMachineTypeSearch}
          searchValue={effectiveMachineTypeSearch}
          value={control.field.value}
          items={productItems}
        />
        <Button
          aria-label="Refresh machine types"
          title="Refresh machine types"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshProducts()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {productItems.length === 0 && (
        <InlineState
          title="No machine types found"
          description={
            effectiveMachineTypeSearch
              ? 'No machine types matched the current search. Try another family such as e2, n2, or c3.'
              : 'The selected GCP zone did not return any deployable machine types.'
          }
        />
      )}

      <ErrorInline message={formErrors.spec?.machineType?.message} />
    </div>
  );
};

const SubDigitalOceanSizeCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const regionSlug = useWatch({ control: form.control, name: 'regionSlug' });

  const [response, refreshProducts] = ApiCloud.Project.Products.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    zone: regionSlug ?? '',
    options: { skip: !cloudProjectID || !regionSlug },
  });

  const control = useController({
    control: form.control,
    name: 'spec.machineType',
  });

  if (!cloudProjectID || !regionSlug || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a region first"
        description="DigitalOcean droplet sizes are filtered by the selected project and region."
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
        title="Could not load droplet sizes"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshProducts()}
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
  const items = (responseData?.items ?? [])
    .map((product) => {
      const value = product.value || product.name || '';
      if (!value) return undefined;
      return {
        value,
        label: getProductLabel(product),
      };
    })
    .filter(Boolean) as Array<{ label: string; value: string }>;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Select a droplet size"
          onChange={control.field.onChange}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh droplet sizes"
          title="Refresh droplet sizes"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshProducts()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No droplet sizes found"
          description="The selected region did not return available DigitalOcean sizes."
        />
      )}

      <ErrorInline message={formErrors.spec?.machineType?.message} />
    </div>
  );
};

const SubOsTemplateCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;
  const productID = useWatch({
    control: form.control,
    name: 'spec.productID',
  });
  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);

  const [response, refreshTemplates] = ApiCloud.Project.Ostemplates.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    productId: usesBiznetGio ? productID : undefined,
    options: { skip: !cloudProjectID || (usesBiznetGio && !productID) },
  });

  const control = useController({
    control: form.control,
    name: 'spec.osTemplate',
  });

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title={
          usesBiznetGio
            ? 'Select a product first'
            : 'Select a cloud project first'
        }
        description={
          usesBiznetGio
            ? 'Biznet Gio OS templates are scoped to the selected NEO Lite product.'
            : 'OS templates are returned by the selected cloud project.'
        }
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
        title="Could not load OS templates"
        description={getApiErrorDetail(response.error)}
        variant="danger"
        action={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            size="sm"
            onClick={() => refreshTemplates()}
          >
            <RefreshCwIcon className="size-4" />
            Refresh
          </Button>
        }
      />
    );
  }

  const items: Array<{ label: string; value: string }> = [];

  const responseData =
    response.$status === 'success' ? response : response.prevData;
  const templateList = Array.isArray(responseData)
    ? (responseData as unknown as OsTemplateItem[])
    : [];

  for (const template of templateList) {
    if (!template.id) continue;

    items.push({
      label: template.name || template.id,
      value: template.id,
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Combobox
          classNameButton="w-full flex-1 bg-background"
          placeholder="Select an OS Template"
          onChange={(value) => {
            const selectedTemplate = templateList.find(
              (template) => template.id === value,
            );

            form.setValue('spec.osName', selectedTemplate?.os_name ?? '', {
              shouldValidate: true,
            });
            form.setValue(
              'spec.osVersion',
              selectedTemplate?.os_version ?? '',
              {
                shouldValidate: true,
              },
            );
            control.field.onChange(value);
          }}
          value={control.field.value}
          items={items}
        />
        <Button
          aria-label="Refresh OS templates"
          title="Refresh OS templates"
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshTemplates()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState
          title="No OS templates found"
          description="The selected cloud project did not return any available images."
        />
      )}

      <ErrorInline message={formErrors.spec?.osTemplate?.message} />
      {!usesBiznetGio && !usesGcp && (
        <>
          <ErrorInline message={formErrors.spec?.osName?.message} />
          <ErrorInline message={formErrors.spec?.osVersion?.message} />
        </>
      )}
    </div>
  );
};

export default function SectionSpecs() {
  const { form, formErrors } = useForm();
  const provider = useWatch({ control: form.control, name: 'provider' }) as
    | string
    | undefined;
  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);
  const usesDigitalOcean = isDigitalOceanProvider(provider);

  const ctrlSpecCPUCore = useController({
    control: form.control,
    name: 'spec.cpuCore',
  });

  const ctrlSpecRAMSizeGB = useController({
    control: form.control,
    name: 'spec.ramSizeGB',
  });

  const ctrlSpecDiskSizeGB = useController({
    control: form.control,
    name: 'spec.diskSizeGB',
  });

  return (
    <Sectioned
      withinCard
      sectionIcon={HardDriveIcon}
      sectionTitle="Specification"
      sectionDescription="Choose the image and sizing for the provisioning request."
    >
      <div className="space-y-2">
        <h6 className="text-sm font-semibold">VM Name</h6>
        <Input
          className="w-full bg-background"
          placeholder={
            usesBiznetGio
              ? 'dpanel-bg01'
              : usesGcp
                ? 'dpanel-gcp-01'
                : usesDigitalOcean
                  ? 'dpanel-do-01'
                : 'dpanel-idcloudhost-01'
          }
          {...form.register('spec.vmName')}
        />
        <ErrorInline message={formErrors.spec?.vmName?.message} />
      </div>

      {usesBiznetGio && (
        <>
          <div className="mt-5">
            <SubBiznetProductFields />
          </div>

          <div className="mt-5 space-y-2">
            <h6 className="text-sm font-semibold">OS Template</h6>
            <SubOsTemplateCbo />
          </div>
        </>
      )}

      {!usesBiznetGio && (
        <>
          {usesGcp && (
            <div className="mt-5 space-y-2">
              <h6 className="text-sm font-semibold">Machine Type</h6>
              <SubGcpMachineTypeCbo />
            </div>
          )}

          {usesDigitalOcean && (
            <div className="mt-5 space-y-2">
              <h6 className="text-sm font-semibold">Droplet Size</h6>
              <SubDigitalOceanSizeCbo />
            </div>
          )}

          <div className="mt-5 space-y-2">
            <h6 className="text-sm font-semibold">
              {usesDigitalOcean ? 'Image' : 'OS Template'}
            </h6>
            <SubOsTemplateCbo />
          </div>

          {usesGcp ? (
            <div className="mt-5 space-y-2">
              <h6 className="text-sm font-semibold">Disk</h6>
              <Combobox
                classNameButton="w-full bg-background"
                placeholder="Select disk"
                onChange={ctrlSpecDiskSizeGB.field.onChange}
                value={ctrlSpecDiskSizeGB.field.value}
                items={OPTS_DISK_GB}
              />
              <ErrorInline message={formErrors.spec?.diskSizeGB?.message} />
            </div>
          ) : !usesDigitalOcean ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <h6 className="text-sm font-semibold">CPU Cores</h6>
                <Combobox
                  classNameButton="w-full bg-background"
                  placeholder="Select cores"
                  onChange={ctrlSpecCPUCore.field.onChange}
                  value={ctrlSpecCPUCore.field.value}
                  items={OPTS_CPU_CORE}
                />
                <ErrorInline message={formErrors.spec?.cpuCore?.message} />
              </div>

              <div className="space-y-2">
                <h6 className="text-sm font-semibold">RAM</h6>
                <Combobox
                  classNameButton="w-full bg-background"
                  placeholder="Select RAM"
                  onChange={ctrlSpecRAMSizeGB.field.onChange}
                  value={ctrlSpecRAMSizeGB.field.value}
                  items={OPTS_RAM_GB}
                />
                <ErrorInline message={formErrors.spec?.ramSizeGB?.message} />
              </div>

              <div className="space-y-2">
                <h6 className="text-sm font-semibold">Disk</h6>
                <Combobox
                  classNameButton="w-full bg-background"
                  placeholder="Select disk"
                  onChange={ctrlSpecDiskSizeGB.field.onChange}
                  value={ctrlSpecDiskSizeGB.field.value}
                  items={OPTS_DISK_GB}
                />
                <ErrorInline message={formErrors.spec?.diskSizeGB?.message} />
              </div>
            </div>
          ) : null}
        </>
      )}
    </Sectioned>
  );
}
