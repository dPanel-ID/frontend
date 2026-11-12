import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { dataTable } from '@/shared/presentation/organisms/DataPanel';
import type {
  ClusterPreflightDto,
  ClusterPreflightPathDto,
} from '@/shared/rules/cluster';

/** A path that stops the install: failed and required. */
export function isBlockedPath(path: ClusterPreflightPathDto) {
  return !path.ok && path.required;
}

/**
 * The last connectivity check between the cluster's nodes: one row per node
 * pair and port. Blocked paths are listed first; the passing ones on demand.
 */
export function ClusterPreflight(props: { preflight: ClusterPreflightDto }) {
  const t = useDevetekTranslations('page.serverGroups.cluster.preflight');
  const [showAll, setShowAll] = useState(false);
  const { preflight } = props;

  if (preflight.paths.length === 0) return null;

  const blocked = preflight.paths.filter(isBlockedPath);
  const rows = showAll
    ? [...blocked, ...preflight.paths.filter((path) => !isBlockedPath(path))]
    : blocked;

  return (
    <section className="border-b">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 pt-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-primary">{t('title')}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {blocked.length === 0
              ? t('passed', { count: preflight.paths.length })
              : t('blocked', {
                  blocked: blocked.length,
                  count: preflight.paths.length,
                })}
            {preflight.checked_at &&
              ` · ${t('checkedAt', { time: formatTime(preflight.checked_at) })}`}
          </p>
        </div>
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => setShowAll((value) => !value)}
        >
          {showAll ? t('showBlocked') : t('showAll')}
        </Button>
      </div>
      {rows.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={dataTable.head}>{t('from')}</TableHead>
                <TableHead className={dataTable.head}>{t('to')}</TableHead>
                <TableHead className={cn(dataTable.head, 'w-48')}>
                  {t('port')}
                </TableHead>
                <TableHead className={cn(dataTable.head, 'w-28')}>
                  {t('result')}
                </TableHead>
                <TableHead className={dataTable.head}>{t('cause')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((path) => (
                <TableRow
                  key={`${path.from}-${path.to}-${path.port}-${path.protocol}`}
                >
                  <TableCell className={dataTable.cell}>
                    {path.from_name || path.from}
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    <span className="block">{path.to_name || path.to}</span>
                    {path.address && (
                      <code className="text-xs text-muted-foreground">
                        {path.address}
                      </code>
                    )}
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    <code className="text-xs">
                      {path.port}/{path.protocol}
                    </code>
                    {path.title && (
                      <span className="block text-xs text-muted-foreground">
                        {path.title}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className={dataTable.cell}>
                    <StatusPill
                      tone={pathTone(path)}
                      label={path.result || '-'}
                    />
                  </TableCell>
                  <TableCell
                    className={cn(
                      dataTable.cell,
                      'text-xs text-muted-foreground',
                    )}
                  >
                    {[path.detail, path.cause].filter(Boolean).join(' - ') ||
                      '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {rows.length === 0 && <div className="pb-4" />}
    </section>
  );
}

function pathTone(path: ClusterPreflightPathDto) {
  if (path.ok) return 'success' as const;
  if (!path.required) return 'neutral' as const;
  return 'danger' as const;
}

function formatTime(value: string) {
  // The report's time is UTC without a zone suffix.
  const date = new Date(
    /[zZ]|[+-]\d\d:?\d\d$/.test(value) ? value : `${value}Z`,
  );
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
