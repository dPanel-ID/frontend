import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type { OsTemplateItem } from '@/shared/api/cloud.project.ostemplates.$id';
import type { ProductItem } from '@/shared/api/cloud.project.products.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { ChoiceTile } from '@/shared/presentation/molecules/ChoiceTile';
import { Combobox } from '@/shared/presentation/molecules/Combobox';
import { ComboboxWithSearchCb } from '@/shared/presentation/molecules/ComboboxWithSearchCb';

import { OPTS_CPU_CORE, OPTS_DISK_GB, OPTS_RAM_GB } from '../../-config';
import { useForm } from '../../-model';
import {
  isAlibabaCloudProvider,
  isAwsProvider,
  isBiznetGioProvider,
  isDigitalOceanProvider,
  isGcpProvider,
  isTencentProvider,
} from '../../-model/provider';
import { ErrorInline } from '../../-presentation/ErrorInline';

import SizeSliders from './SizeSliders';

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

function buildMachineTypeFilter(search: string) {
  const trimmedSearch = search.trim();

  if (!trimmedSearch) return undefined;
  if (trimmedSearch.includes('=')) return trimmedSearch;

  return `name=${trimmedSearch}*`;
}

/** Alibaba Cloud and Tencent Cloud match the search text inside the type. */
function buildPlainFilter(search: string) {
  return search.trim() || undefined;
}

const SubBiznetProductFields = () => {
  const { form, setLabel, formErrors } = useForm();
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
                setLabel('product', product ? getProductLabel(product) : '');
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

const SubDigitalOceanSizeCbo = (props: {
  emptyDescription: string;
  emptyTitle: string;
  fieldMessage?: string;
  fieldName: 'spec.machineType';
  /** Turns the search text into the provider's filter query. */
  buildFilter?: (search: string) => string | undefined;
  itemPlaceholder: string;
  loadingDescription: string;
  loadingTitle: string;
  refreshAriaLabel: string;
  /** Where sizes are listed: per region (default) or per zone. */
  scope?: 'region' | 'zone';
  searchable?: boolean;
  searchPlaceholder?: string;
  titleOnError: string;
}) => {
  const {
    buildFilter = buildMachineTypeFilter,
    emptyDescription,
    emptyTitle,
    fieldMessage,
    fieldName,
    itemPlaceholder,
    loadingDescription,
    loadingTitle,
    refreshAriaLabel,
    scope = 'region',
    searchable,
    searchPlaceholder,
    titleOnError,
  } = props;
  const { form } = useForm();
  const [searchValue, setSearchValue] = useState('');
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const location = useWatch({
    control: form.control,
    name: scope === 'zone' ? 'cloud.zoneSlug' : 'regionSlug',
  });
  const effectiveSearch = cloudProjectID && location ? searchValue : '';

  const [response, refreshProducts] = ApiCloud.Project.Products.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    filter: searchable ? buildFilter(effectiveSearch) : undefined,
    zone: location ?? '',
    options: { skip: !cloudProjectID || !location },
  });

  const control = useController({
    control: form.control,
    name: fieldName,
  });

  if (!cloudProjectID || !location || response.$status === 'initial') {
    return (
      <InlineState title={loadingTitle} description={loadingDescription} />
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
        title={titleOnError}
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
        {searchable ? (
          <ComboboxWithSearchCb
            classNameButton="w-full flex-1 bg-background"
            placeholder={itemPlaceholder}
            onChange={control.field.onChange}
            onSearchEnter={setSearchValue}
            searchPlaceholder={searchPlaceholder ?? 'Search'}
            searchValue={effectiveSearch}
            value={control.field.value}
            items={items}
          />
        ) : (
          <Combobox
            classNameButton="w-full flex-1 bg-background"
            placeholder={itemPlaceholder}
            onChange={control.field.onChange}
            value={control.field.value}
            items={items}
          />
        )}
        <Button
          aria-label={refreshAriaLabel}
          title={refreshAriaLabel}
          buttonStyle="outline"
          buttonColor="secondary"
          size="icon"
          onClick={() => refreshProducts()}
        >
          <RefreshCwIcon className="size-4" />
        </Button>
      </div>

      {items.length === 0 && (
        <InlineState title={emptyTitle} description={emptyDescription} />
      )}

      <ErrorInline message={fieldMessage} />
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
  const regionSlug = useWatch({ control: form.control, name: 'regionSlug' });
  const usesBiznetGio = isBiznetGioProvider(provider);
  const usesGcp = isGcpProvider(provider);
  const usesAws = isAwsProvider(provider);
  // These providers publish a separate image ID in every region.
  const usesRegionalImages =
    usesAws || isAlibabaCloudProvider(provider) || isTencentProvider(provider);
  // Every provider except Biznet Gio offers only the supported Ubuntu LTS
  // releases (24.04 and 26.04.1), resolved to the provider's current image.
  const usesUbuntuCatalog = !usesBiznetGio;

  const [response, refreshTemplates] = ApiCloud.Project.Ostemplates.$Id.useGet({
    catalog: usesUbuntuCatalog ? 'ubuntu-lts' : undefined,
    cloudProjectId: String(cloudProjectID),
    productId: usesBiznetGio ? productID : undefined,
    zone: usesRegionalImages ? (regionSlug ?? '') : undefined,
    options: {
      skip:
        !cloudProjectID ||
        (usesBiznetGio && !productID) ||
        (usesRegionalImages && !regionSlug),
    },
  });

  const control = useController({
    control: form.control,
    name: 'spec.osTemplate',
  });

  const catalogTemplates =
    usesUbuntuCatalog &&
    response.$status === 'success' &&
    Array.isArray(response)
      ? (response as unknown as OsTemplateItem[])
      : undefined;
  const firstCatalogTemplate = catalogTemplates?.[0];
  const selectedTemplateID = control.field.value;
  useEffect(() => {
    // Preselect Ubuntu 24.04 LTS, or keep the user's choice while it is
    // still offered.
    if (!catalogTemplates || !firstCatalogTemplate?.id) return;
    if (catalogTemplates.some((template) => template.id === selectedTemplateID))
      return;
    form.setValue('spec.osTemplate', firstCatalogTemplate.id, {
      shouldValidate: true,
    });
    form.setValue('spec.osName', firstCatalogTemplate.os_name ?? '', {
      shouldValidate: true,
    });
    form.setValue('spec.osVersion', firstCatalogTemplate.os_version ?? '', {
      shouldValidate: true,
    });
  }, [catalogTemplates, firstCatalogTemplate, selectedTemplateID, form]);

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title={
          usesBiznetGio
            ? 'Select a product first'
            : usesRegionalImages
              ? 'Select a region first'
              : 'Select a cloud project first'
        }
        description={
          usesBiznetGio
            ? 'Biznet Gio OS templates are scoped to the selected NEO Lite product.'
            : usesAws
              ? 'AWS AMI options are scoped to the selected cloud project and region.'
              : usesRegionalImages
                ? 'Ubuntu images are scoped to the selected cloud project and region.'
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

  const selectTemplate = (value: string) => {
    const selectedTemplate = templateList.find(
      (template) => template.id === value,
    );

    form.setValue('spec.osName', selectedTemplate?.os_name ?? '', {
      shouldValidate: true,
    });
    form.setValue('spec.osVersion', selectedTemplate?.os_version ?? '', {
      shouldValidate: true,
    });
    control.field.onChange(value);
  };

  return (
    <div className="space-y-2">
      {usesUbuntuCatalog ? (
        <div
          role="radiogroup"
          aria-label="Ubuntu release"
          className="grid gap-2 sm:grid-cols-2"
        >
          {templateList.map((template, index) => {
            if (!template.id) return null;
            const version = template.os_version ?? '';

            return (
              <ChoiceTile
                key={template.id}
                selected={control.field.value === template.id}
                onSelect={() => selectTemplate(template.id)}
                badge={index === 0 ? 'Recommended' : 'Newest'}
                leading={
                  <span className="flex size-10 items-center justify-center rounded-lg border bg-[#E95420] text-sm font-bold text-white">
                    {version.split('.')[0] || 'U'}
                  </span>
                }
                title={template.name || template.id}
                subtitle="Long-term support, 64-bit"
              />
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Combobox
            classNameButton="w-full flex-1 bg-background"
            placeholder="Select an OS Template"
            onChange={selectTemplate}
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
      )}

      {items.length === 0 && (
        <InlineState
          title={
            usesUbuntuCatalog
              ? 'No supported Ubuntu image found'
              : 'No OS templates found'
          }
          description={
            usesUbuntuCatalog
              ? 'The provider did not return Ubuntu 24.04 LTS or 26.04.1 LTS for the selected project and region.'
              : 'The selected cloud project did not return any available images.'
          }
        />
      )}

      <ErrorInline message={formErrors.spec?.osTemplate?.message} />
      {!usesBiznetGio && !usesGcp && !usesRegionalImages && (
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
  const usesAws = isAwsProvider(provider);
  const usesAlibabaCloud = isAlibabaCloudProvider(provider);
  const usesTencent = isTencentProvider(provider);
  // Providers whose form picks a named instance type instead of CPU, RAM
  // and disk sizes.
  const picksInstanceType =
    usesGcp || usesAws || usesDigitalOcean || usesAlibabaCloud || usesTencent;

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

  const regionSlug = useWatch({ control: form.control, name: 'regionSlug' });
  const zoneSlug = useWatch({ control: form.control, name: 'cloud.zoneSlug' });
  // GCP, Alibaba Cloud and Tencent list instance types per zone, AWS and
  // DigitalOcean per region; IDCloudHost takes CPU and memory directly.
  const sizeLocation =
    usesGcp || usesAlibabaCloud || usesTencent
      ? zoneSlug || undefined
      : usesAws || usesDigitalOcean
        ? regionSlug || undefined
        : undefined;

  const instanceTypePicker = usesGcp ? (
    <SubGcpMachineTypeCbo />
  ) : usesAws ? (
    <SubDigitalOceanSizeCbo
      emptyDescription="The selected region did not return available AWS instance types."
      emptyTitle="No instance types found"
      fieldMessage={formErrors.spec?.machineType?.message}
      fieldName="spec.machineType"
      itemPlaceholder="Select an instance type"
      loadingDescription="AWS instance types are filtered by the selected project and region."
      loadingTitle="Select a region first"
      refreshAriaLabel="Refresh instance types"
      searchable
      searchPlaceholder="Search instance types (for example t3, c6i, m7g)"
      titleOnError="Could not load instance types"
    />
  ) : usesAlibabaCloud || usesTencent ? (
    <SubDigitalOceanSizeCbo
      buildFilter={buildPlainFilter}
      emptyDescription="The selected zone has no pay-as-you-go instance types in stock."
      emptyTitle="No instance types found"
      fieldMessage={formErrors.spec?.machineType?.message}
      fieldName="spec.machineType"
      itemPlaceholder="Select an instance type"
      loadingDescription="Instance types are listed per zone, smallest first, with only the ones in stock."
      loadingTitle="Select a zone first"
      refreshAriaLabel="Refresh instance types"
      scope="zone"
      searchable
      searchPlaceholder={
        usesAlibabaCloud
          ? 'Search instance types (for example ecs.e, ecs.u1, ecs.g7)'
          : 'Search instance types (for example SA5, S5, M5)'
      }
      titleOnError="Could not load instance types"
    />
  ) : usesDigitalOcean ? (
    <SubDigitalOceanSizeCbo
      emptyDescription="The selected region did not return available DigitalOcean sizes."
      emptyTitle="No droplet sizes found"
      fieldMessage={formErrors.spec?.machineType?.message}
      fieldName="spec.machineType"
      itemPlaceholder="Select a droplet size"
      loadingDescription="DigitalOcean droplet sizes are filtered by the selected project and region."
      loadingTitle="Select a region first"
      refreshAriaLabel="Refresh droplet sizes"
      titleOnError="Could not load droplet sizes"
    />
  ) : undefined;

  const customSizeFields = (
    <div className="grid gap-4 sm:grid-cols-3">
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
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <h6 className="text-sm font-semibold">Server name</h6>
        <Input
          className="w-full bg-background"
          placeholder={
            usesBiznetGio
              ? 'dpanel-bg01'
              : usesGcp
                ? 'dpanel-gcp-01'
                : usesDigitalOcean
                  ? 'dpanel-do-01'
                  : usesAws
                    ? 'dpanel-aws-01'
                    : usesAlibabaCloud
                      ? 'dpanel-ali-01'
                      : usesTencent
                        ? 'dpanel-tc-01'
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
            <h6 className="text-sm font-semibold">Ubuntu release</h6>
            <SubOsTemplateCbo />
          </div>
        </>
      )}

      {!usesBiznetGio && (
        <>
          <div className="mt-5 space-y-2">
            <h6 className="text-sm font-semibold">Ubuntu release</h6>
            <SubOsTemplateCbo />
          </div>

          <div className="mt-5 space-y-2">
            <h6 className="text-sm font-semibold">Size</h6>
            <SizeSliders
              location={sizeLocation}
              needsLocation={picksInstanceType}
              waitingTitle={
                usesGcp || usesAlibabaCloud || usesTencent
                  ? 'Select a zone first'
                  : picksInstanceType
                    ? 'Select a region first'
                    : 'Select a cloud project first'
              }
              advanced={instanceTypePicker}
              fallback={instanceTypePicker ?? customSizeFields}
            />
          </div>
        </>
      )}
    </div>
  );
}
