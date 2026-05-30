import type { ReactNode } from 'react';

import { HardDriveIcon, RefreshCwIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type { OsTemplateItem } from '@/shared/api/cloud.project.ostemplates.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { OPTS_CPU_CORE, OPTS_DISK_GB, OPTS_RAM_GB } from '../../-config';
import { useForm } from '../../-model';
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

const SubOsTemplateCbo = () => {
  const { form, formErrors } = useForm();
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as number | undefined;

  const [response, refreshTemplates] = ApiCloud.Project.Ostemplates.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    options: { skip: !cloudProjectID },
  });

  const control = useController({
    control: form.control,
    name: 'spec.osTemplate',
  });

  if (!cloudProjectID || response.$status === 'initial') {
    return (
      <InlineState
        title="Select a cloud project first"
        description="OS templates are returned by the selected cloud project."
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
      <ErrorInline message={formErrors.spec?.osName?.message} />
      <ErrorInline message={formErrors.spec?.osVersion?.message} />
    </div>
  );
};

export default function SectionSpecs() {
  const { form, formErrors } = useForm();

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
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-2">
          <h6 className="text-sm font-semibold">VM Name</h6>
          <Input
            className="w-full bg-background"
            placeholder="dpanel-idcloudhost-01"
            {...form.register('spec.vmName')}
          />
          <ErrorInline message={formErrors.spec?.vmName?.message} />
        </div>

        <div className="space-y-2">
          <h6 className="text-sm font-semibold">OS Template</h6>
          <SubOsTemplateCbo />
        </div>
      </div>

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
    </Sectioned>
  );
}
