import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  ShieldCheckIcon,
  XCircleIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import type { PreflightState } from '../../-lib/laravel-preset';

const KNOWN_CHECKS = new Set([
  'php_version_unsupported',
  'php_extension_missing',
  'php_runtime_missing',
  'node_runtime_missing',
  'node_version_mismatch',
  'frankenphp_module_missing',
  'composer_lock_missing',
  'repository_unreadable',
]);

export interface PreflightPanelProps {
  preflight: PreflightState;
  override: boolean;
  onOverrideChange: (override: boolean) => void;
  onRetry: () => void;
  disabled?: boolean;
}

function CheckRow(props: { check: DTOs.ApplicationPreflightCheckV1 }) {
  const t = useDevetekTranslations('page.applicationsCreate.preset.preflight');
  const { check } = props;
  const isError = check.level === 'error';
  const params = Object.fromEntries(
    Object.entries(check.params ?? {}).map(([key, value]) => [
      key,
      String(value as string | null),
    ]),
  );
  const text = KNOWN_CHECKS.has(check.code)
    ? t(`checks.${check.code}`, params)
    : check.message || check.code;
  const Icon = isError ? XCircleIcon : AlertTriangleIcon;

  return (
    <li className="flex items-start gap-2 text-sm">
      <Icon
        aria-hidden="true"
        className={
          isError
            ? 'mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400'
            : 'mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-300'
        }
      />
      <span className="min-w-0">
        <span className="sr-only">
          {isError ? t('levelError') : t('levelWarning')}:{' '}
        </span>
        {text}
      </span>
    </li>
  );
}

/**
 * The pre-flight result on the review step: what would break the build
 * (errors) or may need care (warnings). An error holds the deploy button
 * until the user explicitly chooses to deploy anyway.
 */
export function PreflightPanel(props: PreflightPanelProps) {
  const { disabled, onOverrideChange, onRetry, override, preflight } = props;
  const t = useDevetekTranslations('page.applicationsCreate.preset.preflight');
  const errors = preflight.checks.filter((check) => check.level === 'error');

  return (
    <section
      aria-labelledby="preflight-title"
      aria-live="polite"
      className="rounded-xl border bg-background p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4
          id="preflight-title"
          className="flex items-center gap-2 text-sm font-bold"
        >
          <ShieldCheckIcon className="size-4" />
          {t('title')}
        </h4>
        {preflight.status === 'loading' || preflight.status === 'idle' ? (
          <StatusPill tone="info" pulse label={t('running')} />
        ) : preflight.status === 'failed' ? (
          <StatusPill tone="neutral" label={t('unavailable')} />
        ) : errors.length ? (
          <StatusPill
            tone="danger"
            label={t('errorCount', { count: errors.length })}
          />
        ) : preflight.checks.length ? (
          <StatusPill
            tone="warning"
            label={t('warningCount', { count: preflight.checks.length })}
          />
        ) : (
          <StatusPill tone="success" icon={CheckCircle2Icon} label={t('ok')} />
        )}
      </div>
      <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
        {t('desc')}
      </p>

      {(preflight.status === 'loading' || preflight.status === 'idle') && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <Spinner className="size-4" />
          {t('runningDesc')}
        </div>
      )}

      {preflight.status === 'failed' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span>{t('failedDesc')}</span>
          <Button type="button" size="xs" variant="outline" onClick={onRetry}>
            {t('retry')}
          </Button>
        </div>
      )}

      {preflight.status === 'done' && preflight.checks.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {preflight.checks.map((check, index) => (
            <CheckRow key={`${check.code}-${index}`} check={check} />
          ))}
        </ul>
      )}

      {preflight.status === 'done' && preflight.blocking && (
        <div className="mt-3 flex items-start gap-3 rounded-lg border border-red-400/30 bg-red-500/5 p-3">
          <Checkbox
            id="preflight-override"
            checked={override}
            disabled={disabled}
            onCheckedChange={(checked) => onOverrideChange(checked === true)}
            aria-describedby="preflight-override-desc"
          />
          <span className="grid gap-1">
            <label
              htmlFor="preflight-override"
              className="cursor-pointer text-sm font-semibold"
            >
              {t('overrideTitle')}
            </label>
            <span
              id="preflight-override-desc"
              className="text-xs leading-relaxed text-muted-foreground"
            >
              {t('overrideDesc')}
            </span>
          </span>
        </div>
      )}
    </section>
  );
}

export default PreflightPanel;
