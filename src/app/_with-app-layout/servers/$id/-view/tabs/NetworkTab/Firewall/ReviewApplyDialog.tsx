import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  CheckCircle2Icon,
  InfoIcon,
  LoaderCircleIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { DataPanelRetry } from '@/shared/presentation/organisms/DataPanel';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import {
  applyTurnsFirewallOn,
  toFirewallPlanView,
} from '../../../../-lib/firewall';
import type { FirewallPlanView } from '../../../../-lib/firewall';
import useFirewallApply from '../../../../-usecase/firewall-apply';

import { useRuleLabel } from './RulesTable';

interface ReviewApplyDialogProps {
  open: boolean;
  serverId: string;
  serverName: string;
  onOpenChange: (open: boolean) => void;
  /** Called with the queued execution ID; the page then follows it. */
  onQueued: (executionId: string) => void;
}

/**
 * Loads the plan, says exactly what the apply changes, and asks for an
 * explicit confirmation when it turns the firewall on.
 */
export default function ReviewApplyDialog(props: ReviewApplyDialogProps) {
  const { onOpenChange, open } = props;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100svh-2rem)] max-w-2xl gap-0 overflow-hidden p-0">
        {/* Mounted only while open, so every opening reads a fresh plan. */}
        {open && <ReviewApplyContent {...props} />}
      </DialogContent>
    </Dialog>
  );
}

function ReviewApplyContent(props: ReviewApplyDialogProps) {
  const { onOpenChange, onQueued, serverId, serverName } = props;
  const t = useDevetekTranslations('page.serverDetail.network.firewall.apply');
  const tCommon = useDevetekTranslations('common.actions');
  const [confirmed, setConfirmed] = useState(false);
  const { apply, isApplying } = useFirewallApply();

  const [response, refresh] = ApiServer.Firewall.$Id.Plan.useGet({ serverId });
  const plan = useAdapter(response, (raw) => toFirewallPlanView(raw));

  const ready = plan.$status === 'success' ? plan : undefined;
  const policy = ready?.firewall.policy;
  const turnsOn = policy ? applyTurnsFirewallOn(policy, ready) : false;
  const canApply =
    !!ready &&
    !!policy &&
    ready.sshOpen &&
    !policy.applyInProgress &&
    (!turnsOn || confirmed) &&
    !isApplying;

  const handleApply = async () => {
    if (!ready || !policy) return;
    const executionId = await apply({ serverId, policy });
    if (executionId == null) return;
    onQueued(executionId);
    onOpenChange(false);
  };

  return (
    <div className="flex max-h-[calc(100svh-2rem)] min-h-0 flex-col">
      <DialogHeader className="border-b p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
            <ShieldCheckIcon className="size-5" />
          </span>
          <div className="min-w-0 text-left">
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription className="mt-1">
              {t('description', { server: serverName })}
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        {plan.$status === 'initial' || plan.$status === 'loading' ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center text-sm text-muted-foreground">
            <Spinner />
            {t('loading')}
          </div>
        ) : plan.$status === 'failed' ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-3 text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-300">
              {t('failed')}
            </p>
            <p className="max-w-md text-sm text-muted-foreground">
              {getApiErrorDetail(plan.error)}
            </p>
            <DataPanelRetry onClick={refresh} />
          </div>
        ) : (
          <PlanSummary plan={plan} turnsOn={turnsOn} />
        )}
      </div>

      {ready && turnsOn && (
        <label className="flex items-start gap-3 border-t bg-amber-500/5 px-5 py-3 text-sm">
          <Checkbox
            className="mt-0.5"
            checked={confirmed}
            onCheckedChange={(checked) => setConfirmed(checked === true)}
          />
          <span>{t('confirmOn')}</span>
        </label>
      )}

      <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          disabled={isApplying}
          onClick={() => onOpenChange(false)}
        >
          {tCommon('cancel')}
        </Button>
        <button
          type="button"
          className={flowCtaClassName('sky')}
          disabled={!canApply}
          onClick={handleApply}
        >
          {isApplying ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : (
            <ShieldCheckIcon className="size-4" />
          )}
          {turnsOn ? t('confirmTurnOn') : t('confirm')}
        </button>
      </DialogFooter>
    </div>
  );
}

function PlanSummary(props: { plan: FirewallPlanView; turnsOn: boolean }) {
  const { plan, turnsOn } = props;
  const t = useDevetekTranslations('page.serverDetail.network.firewall.apply');
  const ruleLabel = useRuleLabel();
  const policy = plan.firewall.policy;

  const changes: string[] = [];
  if (turnsOn) changes.push(t('turnOn'));
  if (plan.enabledChange === 'disable') changes.push(t('turnOff'));
  for (const change of plan.defaultChanges) {
    changes.push(
      t('defaultChange', {
        direction: change.direction || '-',
        live: change.live || '-',
        desired: change.desired || '-',
      }),
    );
  }
  if (plan.dockerChange === 'hook') changes.push(t('dockerHook'));
  if (plan.dockerChange === 'unhook') changes.push(t('dockerUnhook'));

  return (
    <div className="grid gap-4">
      {policy.applyInProgress && (
        <Notice tone="warning" icon={InfoIcon}>
          {t('inProgress')}
        </Notice>
      )}
      {!plan.live.available && (
        <Notice tone="info" icon={InfoIcon}>
          {t('unavailable', { reason: plan.live.reason || t('noReason') })}
        </Notice>
      )}
      {plan.inSync && !turnsOn && (
        <Notice tone="success" icon={CheckCircle2Icon}>
          {t('inSync')}
        </Notice>
      )}

      {changes.length > 0 && (
        <Group title={t('changes')}>
          <ul className="grid gap-1.5 text-sm">
            {changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </Group>
      )}

      <Group title={t('add', { count: plan.toAdd.length })}>
        <RuleList
          empty={t('none')}
          items={plan.toAdd.map((rule) => ruleLabel(rule))}
          tone="add"
        />
      </Group>
      <Group title={t('remove', { count: plan.toRemove.length })}>
        <RuleList
          empty={t('none')}
          items={plan.toRemove.map((rule) => rule.text)}
          tone="remove"
          mono
        />
      </Group>
      <Group title={t('kept', { count: plan.foreign.length })}>
        <RuleList
          empty={t('none')}
          items={plan.foreign.map((rule) => rule.text)}
          tone="keep"
          mono
        />
      </Group>

      {plan.sshOpen ? (
        <Notice tone="success" icon={ShieldCheckIcon}>
          {t('sshOpen')}
        </Notice>
      ) : (
        <Notice tone="danger" icon={ShieldAlertIcon}>
          {t('sshClosed')}
        </Notice>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('rollback')}
      </p>
    </div>
  );
}

function Group(props: { title: string; children: ReactNode }) {
  return (
    <section>
      <h4 className="mb-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {props.title}
      </h4>
      {props.children}
    </section>
  );
}

function RuleList(props: {
  items: string[];
  empty: string;
  tone: 'add' | 'remove' | 'keep';
  mono?: boolean;
}) {
  const { empty, items, mono = false, tone } = props;
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }

  const marker = { add: '+', remove: '−', keep: '=' }[tone];

  return (
    <ul className="divide-y rounded-xl border">
      {items.map((item, index) => (
        <li
          key={`${item}-${index}`}
          className="flex items-start gap-2 px-3 py-2 text-sm"
        >
          <span
            aria-hidden
            className={cn(
              'w-3 shrink-0 font-mono font-bold',
              tone === 'add' && 'text-emerald-600 dark:text-emerald-300',
              tone === 'remove' && 'text-red-600 dark:text-red-300',
              tone === 'keep' && 'text-muted-foreground',
            )}
          >
            {marker}
          </span>
          <span
            className={cn('min-w-0 break-all', mono && 'font-mono text-xs')}
          >
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

const NOTICE_TONES = {
  info: 'border-sky-400/30 bg-sky-500/5 text-sky-800 dark:text-sky-200',
  success:
    'border-emerald-500/30 bg-emerald-500/5 text-emerald-800 dark:text-emerald-200',
  warning:
    'border-amber-400/30 bg-amber-500/5 text-amber-800 dark:text-amber-200',
  danger: 'border-red-400/30 bg-red-500/5 text-red-800 dark:text-red-200',
} as const;

function Notice(props: {
  tone: keyof typeof NOTICE_TONES;
  icon: typeof InfoIcon;
  children: ReactNode;
}) {
  const { children, icon: Icon, tone } = props;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-xl border p-3 text-sm',
        NOTICE_TONES[tone],
      )}
    >
      <Icon className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
