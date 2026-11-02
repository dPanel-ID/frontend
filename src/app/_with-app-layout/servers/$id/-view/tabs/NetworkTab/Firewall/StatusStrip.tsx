import type { ReactNode } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { Switch } from '@/shared/presentation/atoms/Switch';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { applyStatusTone, formatFirewallTime } from '../../../../-lib/firewall';
import type { FirewallPolicyView } from '../../../../-lib/firewall';

/** Execution statuses with their own label; anything else is shown as sent. */
const APPLY_STATUSES = [
  'succeeded',
  'failed',
  'running',
  'queued',
  'pending',
  'cancelled',
];

interface StatusStripProps {
  policy: FirewallPolicyView;
  awaitingApply: boolean;
  isSavingDocker: boolean;
  onToggleDocker: (enabled: boolean) => void;
}

/** What the server runs against what dPanel stores, at a glance. */
export default function StatusStrip(props: StatusStripProps) {
  const { awaitingApply, isSavingDocker, onToggleDocker, policy } = props;
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const policyWord = (value: string) =>
    ['allow', 'deny', 'reject'].includes(value)
      ? t(`policyValue.${value}`)
      : value;

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      <Fact label={t('status.firewall')}>
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill
            tone={policy.enabled ? 'success' : 'neutral'}
            label={policy.enabled ? t('status.on') : t('status.off')}
          />
          {policy.drift && (
            <StatusPill
              tone="warning"
              label={t('status.drift')}
              title={t('status.driftHint')}
            />
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('status.defaultsValue', {
            incoming: policyWord(policy.defaultIncoming),
            outgoing: policyWord(policy.defaultOutgoing),
            routed: policyWord(policy.defaultRouted),
          })}
        </p>
      </Fact>

      <Fact label={t('status.docker')}>
        <label className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold">
            {policy.dockerFiltering
              ? t('status.dockerOn')
              : t('status.dockerOff')}
          </span>
          <Switch
            checked={policy.dockerFiltering}
            disabled={isSavingDocker || awaitingApply}
            onCheckedChange={onToggleDocker}
            aria-label={t('status.dockerToggle')}
            title={t('status.dockerToggle')}
          />
        </label>
        <p className="mt-1 text-xs text-muted-foreground">
          {t('status.dockerHint')}
        </p>
      </Fact>

      <Fact label={t('status.version')}>
        <p className="font-mono text-xs text-primary">
          {policy.neverApplied
            ? t('status.neverApplied', { version: policy.version })
            : t('status.versionValue', {
                version: policy.version,
                applied: policy.appliedVersion,
              })}
        </p>
        {policy.pendingChanges && (
          <StatusPill
            className="mt-1.5"
            tone="warning"
            label={t('status.pending')}
          />
        )}
        {policy.appliedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            {t('status.appliedAt', {
              time: formatFirewallTime(policy.appliedAt),
            })}
          </p>
        )}
      </Fact>

      <Fact label={t('status.lastApply')}>
        {awaitingApply ? (
          <StatusPill tone="info" pulse label={t('status.applying')} />
        ) : policy.lastApplyStatus ? (
          <StatusPill
            tone={applyStatusTone(policy.lastApplyStatus)}
            label={
              APPLY_STATUSES.includes(policy.lastApplyStatus)
                ? t(`applyStatus.${policy.lastApplyStatus}`)
                : policy.lastApplyStatus
            }
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('status.lastApplyNone')}
          </p>
        )}
        {policy.lastExecutionId && (
          <p
            className="mt-1 truncate font-mono text-[11px] text-muted-foreground"
            title={policy.lastExecutionId}
          >
            {policy.lastExecutionId}
          </p>
        )}
      </Fact>
    </div>
  );
}

function Fact(props: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0 rounded-lg border bg-card/40 px-3 py-2">
      <p className="mb-1 text-xs font-semibold text-primary/50">
        {props.label}
      </p>
      {props.children}
    </div>
  );
}
