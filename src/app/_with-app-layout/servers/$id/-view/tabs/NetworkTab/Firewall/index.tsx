import { useState } from 'react';
import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import {
  InfoIcon,
  PlusIcon,
  PowerOffIcon,
  RefreshCwIcon,
  ShieldCheckIcon,
  ShieldIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useServerFirewallRuleSidepanel } from '@/features/server-firewall-rule-sidepanel';

import { ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelRetry,
  DataPanelState,
} from '@/shared/presentation/organisms/DataPanel';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { toFirewallPlanView } from '../../../../-lib/firewall';
import type { ServerFirewallState } from '../../../../-model/server-firewall';
import useFirewallAdopt from '../../../../-usecase/firewall-adopt';
import useFirewallDisable from '../../../../-usecase/firewall-disable';
import useFirewallDockerFiltering from '../../../../-usecase/firewall-docker-filtering';
import useFirewallRuleDelete from '../../../../-usecase/firewall-rule-delete';

import ForeignRules from './ForeignRules';
import ReviewApplyDialog from './ReviewApplyDialog';
import RulesTable, { useRuleLabel } from './RulesTable';
import StatusStrip from './StatusStrip';

interface FirewallPanelProps {
  serverId: string;
  serverName: string;
  /** The Network tab's view switcher, kept in the same place on every view. */
  tiles: ReactNode;
  state: ServerFirewallState;
}

/** The host firewall: stored rules, what the server runs, and the apply flow. */
export default function FirewallPanel(props: FirewallPanelProps) {
  const { serverId, serverName, state, tiles } = props;
  const { awaitingApply, current, firewall, refresh, trackExecution } = state;
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const [planResponse, refreshPlan] = ApiServer.Firewall.$Id.Plan.useGet({
    serverId,
  });
  const plan = useAdapter(planResponse, (raw) => toFirewallPlanView(raw));

  const [openRuleSidepanel] = useServerFirewallRuleSidepanel();
  const { deleteRule, deletingRuleId } = useFirewallRuleDelete();
  const { adopt, isAdopting } = useFirewallAdopt();
  const { disable, isDisabling } = useFirewallDisable();
  const { isSaving: isSavingDocker, setDockerFiltering } =
    useFirewallDockerFiltering();
  const ruleLabel = useRuleLabel();

  const view = firewall.$status === 'success' ? firewall : undefined;
  const policy = view?.policy;
  const isLoading = firewall.$status === 'loading';
  const isBusy = awaitingApply || !!policy?.applyInProgress;

  const refreshAll = () => {
    refresh();
    refreshPlan();
  };

  const handleQueued = (executionId: string | null | undefined) => {
    trackExecution(executionId);
    refreshPlan();
  };

  const handleAddRule = () => {
    if (!policy) return;
    openRuleSidepanel({
      serverId,
      serverName,
      dockerFiltering: policy.dockerFiltering,
      onSuccess: refreshAll,
    });
  };

  const handleDisable = () => {
    if (!policy) return;
    disable({
      serverId,
      version: policy.version,
      onQueued: handleQueued,
      onFailed: refresh,
    });
  };

  return (
    <>
      <DataPanel
        icon={ShieldIcon}
        title={t('title')}
        description={t('description')}
        actions={
          <>
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              disabled={isLoading}
              onClick={refreshAll}
            >
              <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
              {tCommon('refresh')}
            </Button>
            {policy?.enabled && (
              <Button
                buttonStyle="outline"
                danger
                size="sm"
                disabled={isBusy || isDisabling}
                onClick={handleDisable}
              >
                <PowerOffIcon />
                {t('actions.disable')}
              </Button>
            )}
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              disabled={!policy}
              onClick={handleAddRule}
            >
              <PlusIcon />
              {t('actions.addRule')}
            </Button>
            <button
              type="button"
              className={flowCtaClassName('sky', 'h-8 px-3 text-xs')}
              disabled={!policy || isBusy}
              onClick={() => setIsReviewOpen(true)}
            >
              <ShieldCheckIcon className="size-4" />
              {t('actions.reviewApply')}
            </button>
          </>
        }
        tiles={tiles}
        footer={
          view ? (
            <DataPanelMeta>
              {tCommon('rows', { count: view.rules.length })}
            </DataPanelMeta>
          ) : undefined
        }
      >
        {firewall.$status === 'failed' ? (
          <DataPanelState
            state="failed"
            title={tCommon('loadFailed')}
            description={getApiErrorDetail(firewall.error)}
            action={<DataPanelRetry onClick={refresh} />}
          />
        ) : !current ? (
          <DataPanelState state="loading" title={tCommon('loading')} />
        ) : (
          <FirewallBody
            view={current}
            awaitingApply={awaitingApply}
            isSavingDocker={isSavingDocker}
            deletingRuleId={deletingRuleId}
            onToggleDocker={(enabled) => {
              if (!policy) return;
              void setDockerFiltering({
                serverId,
                version: policy.version,
                enabled,
                onSettled: refreshAll,
              });
            }}
            onDeleteRule={(rule) =>
              deleteRule({
                serverId,
                ruleId: rule.id,
                ruleLabel: ruleLabel(rule),
                onSuccess: refreshAll,
              })
            }
            foreign={
              <ForeignRules
                plan={plan}
                isAdopting={isAdopting}
                onRetry={refreshPlan}
                onAdopt={() => adopt({ serverId, onSuccess: refreshAll })}
              />
            }
          />
        )}
      </DataPanel>

      <ReviewApplyDialog
        open={isReviewOpen}
        serverId={serverId}
        serverName={serverName}
        onOpenChange={setIsReviewOpen}
        onQueued={handleQueued}
      />
    </>
  );
}

function FirewallBody(props: {
  view: NonNullable<ServerFirewallState['current']>;
  awaitingApply: boolean;
  isSavingDocker: boolean;
  deletingRuleId: string | null;
  onToggleDocker: (enabled: boolean) => void;
  onDeleteRule: Parameters<typeof RulesTable>[0]['onDelete'];
  foreign: ReactNode;
}) {
  const {
    awaitingApply,
    deletingRuleId,
    foreign,
    isSavingDocker,
    onDeleteRule,
    onToggleDocker,
    view,
  } = props;
  const t = useDevetekTranslations('page.serverDetail.network.firewall');

  return (
    <>
      <div className="grid gap-3 p-4">
        {view.policy.neverApplied && <Guide />}

        {!view.moduleInstalled && (
          <Callout tone="sky" title={t('module.title')}>
            {t('module.message')}
          </Callout>
        )}

        {awaitingApply && (
          <Callout tone="sky" title={t('inProgress.title')} pulse>
            {t('inProgress.message')}
          </Callout>
        )}

        {view.policy.drift && !awaitingApply && (
          <Callout tone="amber" title={t('status.drift')}>
            {t('status.driftHint')}
          </Callout>
        )}

        <StatusStrip
          policy={view.policy}
          awaitingApply={awaitingApply}
          isSavingDocker={isSavingDocker}
          onToggleDocker={onToggleDocker}
        />
      </div>

      <section className="border-t" aria-labelledby="firewall-rules-title">
        <div className="px-4 pb-2 pt-4">
          <h3 id="firewall-rules-title" className="text-sm font-bold">
            {t('rulesTitle')}
          </h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {t('rulesDescription')}
          </p>
        </div>
        {view.rules.length === 0 ? (
          <DataPanelState state="empty" title={t('rulesEmpty')} />
        ) : (
          <RulesTable
            rules={view.rules}
            deletingRuleId={deletingRuleId}
            onDelete={onDeleteRule}
          />
        )}
      </section>

      {foreign}
    </>
  );
}

/** The concept in three steps, shown until the first apply. */
function Guide() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall.guide');

  return (
    <div className="relative overflow-hidden rounded-xl border bg-background/60 p-4">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />
      <div className="relative">
        <p className="text-sm font-bold">{t('title')}</p>
        <ol className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
          {(['step1', 'step2', 'step3'] as const).map((step, index) => (
            <li key={step} className="flex items-start gap-2">
              <span
                aria-hidden
                className={cn(
                  'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-bold',
                  FLOW_ACCENTS.sky.icon,
                )}
              >
                {index + 1}
              </span>
              <span className="leading-relaxed text-muted-foreground">
                {t(step)}
              </span>
            </li>
          ))}
        </ol>
        <Link
          to="/docs/$section/$page"
          params={{ section: 'servers', page: 'firewall' }}
          className={cn(
            'mt-3 inline-flex text-xs font-semibold underline-offset-2 hover:underline',
            FLOW_ACCENTS.sky.text,
          )}
        >
          {t('docs')}
        </Link>
      </div>
    </div>
  );
}

function Callout(props: {
  tone: 'sky' | 'amber';
  title: string;
  pulse?: boolean;
  children: ReactNode;
}) {
  const { children, pulse = false, title, tone } = props;

  return (
    <div
      role={tone === 'amber' ? 'status' : undefined}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border p-3',
        tone === 'sky' && 'border-sky-400/30 bg-sky-500/5',
        tone === 'amber' && 'border-amber-400/30 bg-amber-500/5',
      )}
    >
      <InfoIcon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          tone === 'sky' && 'text-sky-600 dark:text-sky-300',
          tone === 'amber' && 'text-amber-600 dark:text-amber-300',
          pulse && 'animate-pulse',
        )}
      />
      <div className="min-w-0">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          {children}
        </p>
      </div>
    </div>
  );
}
