import dayjs from 'dayjs';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import type { SshKeyCard } from '../../../-lib/describe-ssh-key';
import { SshKeyActions } from '../SshKeyActions';
import { SshKeyAccessPill, SshKeyIdentity } from '../SshKeyIdentity';
import type { SshKeyHandlers } from '../useSshKeyHandlers';

export interface SshTableProps {
  sshKeys: SshKeyCard[];
  handlersFor: (sshKey: SshKeyCard) => SshKeyHandlers;
}

/** The dense view: one line per key, for workspaces with many of them. */
export default function SshTable(props: SshTableProps) {
  const { handlersFor, sshKeys } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.sshKeys.table.key')}
            </TableHead>
            <TableHead>{t('page.sshKeys.table.access')}</TableHead>
            <TableHead>{t('common.terms.owner')}</TableHead>
            <TableHead>{t('page.sshKeys.table.created')}</TableHead>
            <TableHead>{t('page.sshKeys.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.sshKeys.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sshKeys.map((sshKey) => {
            const handlers = handlersFor(sshKey);

            return (
              <TableRow key={sshKey.id}>
                <TableCell className="px-4">
                  <SshKeyIdentity
                    sshKey={sshKey}
                    size="sm"
                    onClickName={handlers.openDetails}
                  />
                </TableCell>
                <TableCell>
                  <SshKeyAccessPill sshKey={sshKey} />
                </TableCell>
                <TableCell>
                  <span className="text-xs text-primary/80">
                    {sshKey.ownerName ?? '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <DateCell value={sshKey.createdAt} locale={locale} />
                </TableCell>
                <TableCell>
                  <DateCell value={sshKey.updatedAt} locale={locale} />
                </TableCell>
                <TableCell className="px-4">
                  <SshKeyActions handlers={handlers} layout="menu" />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

interface DateCellProps {
  value: string | null;
  locale: ReturnType<typeof useDevetekLocale>;
}

function DateCell(props: DateCellProps) {
  const { locale, value } = props;

  if (!value) return <span className="text-xs text-primary/40">—</span>;

  return (
    <div className="flex flex-col">
      <span className="text-xs text-primary/80">
        {getDistanceFromNow(value, locale)}
      </span>
      <span className="text-[0.65rem] text-muted-foreground">
        {dayjs(value).format('YYYY/MM/DD HH:mm')}
      </span>
    </div>
  );
}
