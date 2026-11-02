import { LockIcon, Trash2Icon } from 'lucide-react';

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

import { ruleActionTone } from '../../../../-lib/firewall';
import type { FirewallRuleItem } from '../../../../-lib/firewall';

const ORIGIN_CLASSES: Record<FirewallRuleItem['origin'], string> = {
  system: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  legacy:
    'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  module:
    'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  user: 'border-border bg-background/60 text-primary/80',
  other: 'border-border bg-background/60 text-muted-foreground',
};

interface RulesTableProps {
  rules: FirewallRuleItem[];
  deletingRuleId: string | null;
  onDelete: (rule: FirewallRuleItem) => void;
}

/** Stored rules in the order the API returns them: system rules first. */
export default function RulesTable(props: RulesTableProps) {
  const { deletingRuleId, onDelete, rules } = props;
  const t = useDevetekTranslations('page.serverDetail.network.firewall');
  const label = useRuleLabel();

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={cn(dataTable.head, 'w-24')}>
            {t('table.action')}
          </TableHead>
          <TableHead className={cn(dataTable.head, 'w-24')}>
            {t('table.target')}
          </TableHead>
          <TableHead className={cn(dataTable.head, 'w-20')}>
            {t('table.protocol')}
          </TableHead>
          <TableHead className={cn(dataTable.head, 'w-28')}>
            {t('table.port')}
          </TableHead>
          <TableHead className={dataTable.head}>{t('table.source')}</TableHead>
          <TableHead className={dataTable.head}>{t('table.comment')}</TableHead>
          <TableHead className={cn(dataTable.head, 'w-24')}>
            {t('table.origin')}
          </TableHead>
          <TableHead className={cn(dataTable.head, 'w-14')}>
            <span className="sr-only">{t('table.actions')}</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rules.map((rule) => (
          <TableRow key={rule.id}>
            <TableCell className={dataTable.cell}>
              <StatusPill
                tone={ruleActionTone(rule.action)}
                label={actionLabel(t, rule.action)}
              />
            </TableCell>
            <TableCell className={dataTable.cell}>
              {t(`target.${rule.target}`)}
            </TableCell>
            <TableCell className={dataTable.monoCell}>
              {protocolLabel(t, rule.protocol)}
            </TableCell>
            <TableCell
              className={cn(dataTable.monoCell, 'font-semibold text-primary')}
            >
              {rule.port || t('anyPort')}
            </TableCell>
            <TableCell className={dataTable.monoCell}>
              <span className="block max-w-56 truncate" title={rule.source}>
                {rule.source || t('anySource')}
              </span>
            </TableCell>
            <TableCell className={dataTable.mutedCell}>
              <span className="block max-w-56 truncate" title={rule.comment}>
                {rule.comment || '-'}
              </span>
            </TableCell>
            <TableCell className={dataTable.cell}>
              <span
                className={cn(
                  'inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold',
                  ORIGIN_CLASSES[rule.origin],
                )}
              >
                {t(`origin.${rule.origin}`)}
              </span>
            </TableCell>
            <TableCell className={cn(dataTable.cell, 'text-right')}>
              {rule.locked ? (
                <span
                  className="inline-flex size-8 items-center justify-center text-muted-foreground"
                  role="img"
                  aria-label={t('locked')}
                  title={t('locked')}
                >
                  <LockIcon className="size-4" />
                </span>
              ) : (
                <Button
                  buttonStyle="ghost"
                  danger
                  size="icon-sm"
                  disabled={deletingRuleId === rule.id}
                  aria-label={t('removeRuleAria', { rule: label(rule) })}
                  title={t('removeRule')}
                  onClick={() => onDelete(rule)}
                >
                  <Trash2Icon />
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

type Translate = ReturnType<typeof useDevetekTranslations>;

const KNOWN_ACTIONS = ['allow', 'deny', 'limit', 'reject'];
const KNOWN_PROTOCOLS = ['tcp', 'udp', 'any'];

function actionLabel(t: Translate, action: string) {
  return KNOWN_ACTIONS.includes(action) ? t(`action.${action}`) : action;
}

function protocolLabel(t: Translate, protocol: string) {
  return KNOWN_PROTOCOLS.includes(protocol)
    ? t(`protocol.${protocol}`)
    : protocol;
}

/** A rule in words, such as "Allow · Host · TCP 443 · Anywhere". */
export function useRuleLabel() {
  const t = useDevetekTranslations('page.serverDetail.network.firewall');

  return (rule: FirewallRuleItem) =>
    [
      actionLabel(t, rule.action),
      t(`target.${rule.target}`),
      `${protocolLabel(t, rule.protocol)} ${rule.port || t('anyPort')}`,
      rule.source || t('anySource'),
    ].join(' · ');
}
