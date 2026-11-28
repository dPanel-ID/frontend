import { AlertTriangleIcon, XCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { DTOs } from '@/shared/api';

/** Check codes the dictionaries describe; others show the API's text. */
export const KNOWN_PREFLIGHT_CHECKS = new Set([
  'php_version_unsupported',
  'php_extension_missing',
  'php_runtime_missing',
  'node_runtime_missing',
  'node_version_mismatch',
  'frankenphp_module_missing',
  'composer_lock_missing',
  's3_package_missing',
  'repository_unreadable',
]);

export function PreflightCheckRow(props: {
  check: DTOs.ApplicationPreflightCheckV1;
}) {
  const t = useDevetekTranslations('dialog.deployPreflight');
  const { check } = props;
  const isError = check.level === 'error';
  const params = Object.fromEntries(
    Object.entries(check.params ?? {}).map(([key, value]) => [
      key,
      String(value as string | null),
    ]),
  );
  const text = KNOWN_PREFLIGHT_CHECKS.has(check.code)
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

/** Pre-flight results, errors first, each described by its code. */
export function PreflightCheckList(props: {
  checks: DTOs.ApplicationPreflightCheckV1[];
  className?: string;
}) {
  if (!props.checks.length) return null;
  return (
    <ul className={props.className ?? 'grid gap-2'}>
      {props.checks.map((check, index) => (
        <PreflightCheckRow key={`${check.code}-${index}`} check={check} />
      ))}
    </ul>
  );
}
