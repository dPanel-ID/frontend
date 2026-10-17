import { CheckIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { SERVER_STATE_METADATA } from '@/entities/server/ui/constants/state-metadata';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  CloudProviderLogo,
  getCloudProviderLabel,
} from '@/shared/presentation/molecules/CloudProviderLogo';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

interface Props {
  checked?: boolean;
  disabled?: boolean;
  /** Why the card cannot be picked, shown instead of the status. */
  disabledReason?: string;
  machineName: string;
  machinePublicIP: string;
  provider?: string;
  region?: string;
  status?: string;
  onClickSelect?: () => void;
  selected?: boolean;
  selectionRole?: 'checkbox' | 'radio';
}

/** A pickable server: logo, name, address, state; the same look as the list. */
export default function MachineCard(props: Props) {
  const {
    checked,
    disabled,
    disabledReason,
    machineName,
    machinePublicIP,
    onClickSelect,
    provider,
    region,
    selected,
    selectionRole,
    status,
  } = props;
  const t = useDevetekTranslations();
  const providerLabel = getCloudProviderLabel(provider);
  const stateMetadata =
    status && status in SERVER_STATE_METADATA
      ? SERVER_STATE_METADATA[status as keyof typeof SERVER_STATE_METADATA]
      : undefined;
  const location = providerLabel
    ? [providerLabel, region].filter(Boolean).join(' · ')
    : t('common.terms.ownServer');

  return (
    <button
      type="button"
      role={selectionRole}
      aria-checked={checked}
      disabled={disabled}
      onClick={onClickSelect}
      className={cn(
        'relative flex w-full items-center gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        disabled
          ? 'cursor-not-allowed opacity-50'
          : 'hover:-translate-y-0.5 hover:border-sky-400/50 hover:bg-sky-500/5 hover:shadow-lg hover:shadow-black/5',
        selected &&
          'border-sky-400/70 bg-sky-500/10 shadow-sm shadow-sky-500/10 ring-1 ring-sky-400/40',
      )}
    >
      {providerLabel ? (
        <CloudProviderLogo provider={provider} className="size-9" />
      ) : (
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300">
          <ServerIcon className="size-4" />
        </span>
      )}

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold">
          {machineName}
        </span>
        <span className="block truncate text-xs text-muted-foreground">
          {[machinePublicIP, location].filter(Boolean).join(' · ')}
        </span>
      </span>

      {disabledReason ? (
        <span className="shrink-0 rounded-full border border-dashed px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
          {disabledReason}
        </span>
      ) : stateMetadata ? (
        <StatusPill
          tone={stateMetadata.tone}
          pulse={stateMetadata.pulse}
          label={t(stateMetadata.i18n.statusLabel)}
        />
      ) : null}

      <span
        aria-hidden
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border text-transparent transition-colors',
          selected && 'border-emerald-500 bg-emerald-500 text-white',
        )}
      >
        <CheckIcon className="size-3" />
      </span>
    </button>
  );
}
