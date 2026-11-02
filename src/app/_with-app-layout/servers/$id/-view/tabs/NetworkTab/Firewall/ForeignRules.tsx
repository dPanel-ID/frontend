import { DownloadIcon, InfoIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import type { Response } from '@/shared/libs/api-client/rules/types';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { DataPanelRetry } from '@/shared/presentation/organisms/DataPanel';

import type { FirewallPlanView } from '../../../../-lib/firewall';

interface ForeignRulesProps {
  plan: Response<FirewallPlanView>;
  isAdopting: boolean;
  onAdopt: () => void;
  onRetry: () => void;
}

/**
 * Rules someone added on the server by hand. dPanel keeps them on apply and
 * offers to adopt them, which the API does for every importable rule at once.
 */
export default function ForeignRules(props: ForeignRulesProps) {
  const { isAdopting, onAdopt, onRetry, plan } = props;
  const t = useDevetekTranslations(
    'page.serverDetail.network.firewall.foreign',
  );

  return (
    <section className="border-t p-4" aria-labelledby="firewall-foreign-title">
      <h3 id="firewall-foreign-title" className="text-sm font-bold">
        {t('title')}
      </h3>
      <p className="mt-0.5 text-xs text-muted-foreground">{t('description')}</p>

      <div className="mt-3">
        {plan.$status === 'initial' || plan.$status === 'loading' ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Spinner />
            {t('loading')}
          </p>
        ) : plan.$status === 'failed' ? (
          <div className="flex flex-col items-start gap-2 rounded-xl border border-red-400/30 bg-red-500/5 p-3">
            <p className="text-sm font-semibold text-red-700 dark:text-red-300">
              {t('failed')}
            </p>
            <p className="text-xs text-muted-foreground">
              {getApiErrorDetail(plan.error)}
            </p>
            <DataPanelRetry onClick={onRetry} />
          </div>
        ) : !plan.live.available ? (
          <p className="flex items-start gap-2 rounded-xl border bg-background/60 p-3 text-sm text-muted-foreground">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            {t('unavailable', { reason: plan.live.reason || t('noReason') })}
          </p>
        ) : plan.foreign.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('empty')}</p>
        ) : (
          <ul className="divide-y rounded-xl border">
            {plan.foreign.map((rule, index) => (
              <li
                key={`${rule.text}-${index}`}
                className="flex flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <code className="min-w-0 break-all font-mono text-xs text-primary">
                  {rule.text}
                </code>
                <Button
                  buttonStyle="outline"
                  buttonColor="secondary"
                  size="sm"
                  className="shrink-0 self-start sm:self-auto"
                  disabled={isAdopting}
                  aria-label={t('adoptAria', { rule: rule.text })}
                  title={t('adoptHint')}
                  onClick={onAdopt}
                >
                  <DownloadIcon />
                  {t('adopt')}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
