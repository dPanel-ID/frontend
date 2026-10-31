import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';

import { RefreshCwIcon, SparklesIcon, TrendingUpIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { ApiCloud } from '@/shared/api';
import type {
  SizeChoice,
  Dto as SizesDto,
} from '@/shared/api/cloud.project.sizes.$id';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useForm } from '../../-model';
import {
  cpuAvailable,
  findSize,
  formatGB,
  memoryAvailable,
  sizeTypeSpecs,
  snapSize,
} from '../../-model/size';
import { ErrorInline } from '../../-presentation/ErrorInline';

/** A stepped slider over a fixed list of values, with labelled ticks. */
function StepSlider(props: {
  label: string;
  unit: string;
  values: number[];
  value: number;
  isAvailable: (value: number) => boolean;
  onChange: (value: number) => void;
}) {
  const { isAvailable, label, onChange, unit, value, values } = props;
  const index = Math.max(0, values.indexOf(value));

  return (
    <div className="grid grid-cols-[4.5rem_1fr_5.5rem] items-center gap-x-4 gap-y-1">
      <span className="text-sm font-semibold">{label}</span>
      <input
        aria-label={label}
        type="range"
        min={0}
        max={values.length - 1}
        step={1}
        value={index}
        onChange={(event) => {
          const next = values[Number(event.target.value)];
          if (next !== undefined) onChange(next);
        }}
        className="w-full cursor-pointer accent-primary"
      />
      <span className="text-right text-lg font-semibold tabular-nums">
        {formatGB(value)} <span className="text-sm font-medium">{unit}</span>
      </span>
      <span />
      <div className="flex justify-between px-0.5 text-[11px] text-muted-foreground">
        {values.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={cn(
              'min-w-4 tabular-nums transition-colors hover:text-foreground',
              item === value && 'font-semibold text-primary',
              !isAvailable(item) && 'line-through opacity-50',
            )}
          >
            {item}
          </button>
        ))}
      </div>
      <span />
    </div>
  );
}

function ResultCard(props: {
  profile: SizesDto;
  size?: SizeChoice;
  diskGB: number;
}) {
  const { diskGB, profile, size } = props;
  const item = profile.items?.find((entry) => entry.value === size?.value);

  if (!size) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
        This provider can&apos;t serve that CPU and memory pair. Pick another
        size.
      </div>
    );
  }

  const disk = profile.disk?.configurable
    ? `${diskGB} GB disk`
    : item?.disk_gb
      ? `${item.disk_gb} GB disk (comes with the plan)`
      : 'Provider default disk';
  const specs = item
    ? `${sizeTypeSpecs(item)} · ${disk}`
    : `${size.vcpu} vCPU · ${size.memory_gb} GB RAM · ${disk}`;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-background p-4">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {profile.mode === 'fixed' ? 'Cheapest match' : 'You get'}
        </p>
        {size.value && (
          <p className="mt-0.5 font-mono text-base font-semibold">
            {size.value}
          </p>
        )}
        <p
          className={cn(
            'text-sm',
            size.value ? 'text-muted-foreground' : 'text-base font-semibold',
          )}
        >
          {specs}
        </p>
        {item?.note && (
          <p className="mt-1 text-xs text-muted-foreground">{item.note}</p>
        )}
      </div>
      <div className="flex flex-col items-end gap-1">
        {size.rounded_up ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-700 dark:text-amber-400">
            <TrendingUpIcon className="size-3" />
            Rounded up from {size.vcpu} vCPU / {size.memory_gb} GB
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
            <SparklesIcon className="size-3" />
            {profile.mode === 'fixed' ? 'Exact match' : 'Custom size'}
          </span>
        )}
        {item?.price_monthly ? (
          <span className="text-xs text-muted-foreground">
            about ${formatGB(item.price_monthly)}/month
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * The standard size form: CPU, memory and disk sliders for every provider.
 * Fixed providers resolve the pair to their cheapest instance type, shown in
 * the result card. Renders `fallback` when the provider keeps its own
 * product picker, and `advanced` when the user picks an instance type.
 */
export default function SizeSliders(props: {
  advanced?: ReactNode;
  fallback?: ReactNode;
  /** Region or zone the provider lists its instance types for. */
  location?: string;
  needsLocation: boolean;
  waitingTitle: string;
}) {
  const { advanced, fallback, location, needsLocation, waitingTitle } = props;
  const { form, formErrors } = useForm();
  const [pickType, setPickType] = useState(false);
  const cloudProjectID = useWatch({
    control: form.control,
    name: 'cloud.projectID',
  }) as string | undefined;
  const cpu = useWatch({ control: form.control, name: 'spec.cpuCore' });
  const memoryGB = useWatch({ control: form.control, name: 'spec.ramSizeGB' });
  const diskGB = useWatch({ control: form.control, name: 'spec.diskSizeGB' });
  const [response, refresh] = ApiCloud.Project.Sizes.$Id.useGet({
    cloudProjectId: String(cloudProjectID),
    zone: location,
    options: { skip: !cloudProjectID || (needsLocation && !location) },
  });

  const profile =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const sizes = useMemo(() => profile?.sizes ?? [], [profile]);
  const size = findSize(sizes, cpu, memoryGB);
  const item = profile?.items?.find((entry) => entry.value === size?.value);

  // Land on a pair the provider serves, and keep the disk in its range.
  useEffect(() => {
    if (!profile || profile.mode === 'catalog' || sizes.length === 0) return;
    if (!findSize(sizes, cpu, memoryGB)) {
      const snapped = snapSize(sizes, cpu, memoryGB, 'cpu');
      if (snapped) {
        form.setValue('spec.cpuCore', snapped.vcpu);
        form.setValue('spec.ramSizeGB', snapped.memory_gb);
      }
    }
    const disk = profile.disk;
    if (disk?.configurable && disk.min_gb && disk.max_gb) {
      const clamped = Math.min(Math.max(diskGB, disk.min_gb), disk.max_gb);
      if (clamped !== diskGB) form.setValue('spec.diskSizeGB', clamped);
    }
  }, [cpu, diskGB, form, memoryGB, profile, sizes]);

  // The resolved type is what the create request sends.
  useEffect(() => {
    if (!profile || profile.mode === 'catalog' || pickType) return;
    form.setValue('spec.machineType', size?.value ?? '', {
      shouldValidate: !!size,
    });
    if (!profile.disk?.configurable && item?.disk_gb) {
      form.setValue('spec.diskSizeGB', item.disk_gb);
    }
  }, [form, item, pickType, profile, size]);

  if (!cloudProjectID || (needsLocation && !location)) {
    return (
      <div className="rounded-lg border bg-background p-4 text-sm">
        <p className="font-medium">{waitingTitle}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Sizes are matched against what the provider offers there.
        </p>
      </div>
    );
  }

  if (response.$status === 'loading' && !response.prevData) {
    return (
      <div className="flex min-h-40 items-center justify-center rounded-lg border bg-background">
        <Spinner />
      </div>
    );
  }

  if (response.$status === 'failed') {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm">
        <p className="font-medium text-destructive">Could not load sizes</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {getApiErrorDetail(response.error)}
        </p>
        <Button
          className="mt-3"
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          onClick={() => refresh()}
        >
          <RefreshCwIcon className="size-4" />
          Refresh
        </Button>
      </div>
    );
  }

  if (!profile || profile.mode === 'catalog') return <>{fallback}</>;

  const disk = profile.disk;
  const diskValues =
    disk?.configurable && disk.min_gb && disk.max_gb
      ? { min: disk.min_gb, max: disk.max_gb, step: disk.step_gb || 10 }
      : undefined;

  const moveTo = (
    nextCPU: number,
    nextMemoryGB: number,
    moved: 'cpu' | 'memory',
  ) => {
    const snapped = snapSize(sizes, nextCPU, nextMemoryGB, moved);
    form.setValue('spec.cpuCore', snapped?.vcpu ?? nextCPU);
    form.setValue('spec.ramSizeGB', snapped?.memory_gb ?? nextMemoryGB);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-5 rounded-lg border bg-background p-4 sm:p-5">
        <StepSlider
          label="CPU"
          unit="core"
          values={profile.cpu_options ?? []}
          value={cpu}
          isAvailable={(value) => cpuAvailable(sizes, value)}
          onChange={(value) => moveTo(value, memoryGB, 'cpu')}
        />
        <StepSlider
          label="RAM"
          unit="GB"
          values={profile.memory_gb_options ?? []}
          value={memoryGB}
          isAvailable={(value) => memoryAvailable(sizes, cpu, value)}
          onChange={(value) => moveTo(cpu, value, 'memory')}
        />
        {diskValues ? (
          <div className="grid grid-cols-[4.5rem_1fr_5.5rem] items-center gap-x-4 gap-y-1">
            <span className="text-sm font-semibold">Storage</span>
            <input
              aria-label="Storage"
              type="range"
              min={diskValues.min}
              max={diskValues.max}
              step={diskValues.step}
              value={diskGB}
              onChange={(event) =>
                form.setValue('spec.diskSizeGB', Number(event.target.value), {
                  shouldValidate: true,
                })
              }
              className="w-full cursor-pointer accent-primary"
            />
            <span className="text-right text-lg font-semibold tabular-nums">
              {diskGB} <span className="text-sm font-medium">GB</span>
            </span>
            <span />
            <div className="flex justify-between px-0.5 text-[11px] text-muted-foreground">
              <span>{diskValues.min} GB</span>
              <span>{diskValues.max} GB</span>
            </div>
            <span />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {item?.disk_gb
              ? 'Storage comes with the plan on this provider.'
              : 'Storage uses the provider default on this provider.'}
          </p>
        )}
        {pickType ? (
          <p className="text-xs text-muted-foreground">
            The instance type you pick below is used instead of the sliders.
          </p>
        ) : (
          <ResultCard profile={profile} size={size} diskGB={diskGB} />
        )}
      </div>

      <ErrorInline message={formErrors.spec?.machineType?.message} />
      <ErrorInline message={formErrors.spec?.diskSizeGB?.message} />

      {advanced && profile.mode === 'fixed' && (
        <div className="space-y-2">
          <button
            type="button"
            className="text-xs font-medium text-primary hover:underline"
            onClick={() => setPickType((value) => !value)}
          >
            {pickType
              ? 'Use the size sliders instead'
              : 'Choose the instance type yourself'}
          </button>
          {pickType && advanced}
        </div>
      )}
    </div>
  );
}
