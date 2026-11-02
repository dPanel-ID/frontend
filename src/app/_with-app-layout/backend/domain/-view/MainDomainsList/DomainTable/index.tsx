import dayjs from 'dayjs';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import { DomainActions } from '../DomainActions';
import {
  DomainAccessPill,
  DomainIdentity,
  DomainProviderPill,
} from '../DomainIdentity';

import type { DomainTableProps as Props } from './types';

/** The dense view: one line per domain, for workspaces with many of them. */
export default function DomainTable(props: Props) {
  const { data } = props;
  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  return (
    <div className="overflow-x-auto rounded-2xl border bg-card">
      <Table className="min-w-[680px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="px-4">
              {t('page.domain.table.domain')}
            </TableHead>
            <TableHead>{t('page.domain.table.provider')}</TableHead>
            <TableHead>{t('page.domain.table.ownership')}</TableHead>
            <TableHead>{t('page.domain.table.updated')}</TableHead>
            <TableHead className="px-4 text-right">
              {t('page.domain.table.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((domain) => (
            <TableRow key={domain.id}>
              <TableCell className="px-4">
                <DomainIdentity domain={domain} size="sm" />
              </TableCell>
              <TableCell>
                <DomainProviderPill domain={domain} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-primary/80">
                    <OwnerLink ownership={domain.ownership} />
                  </span>
                  <DomainAccessPill domain={domain} />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="text-xs text-primary/80">
                    {getDistanceFromNow(domain.timestamp.updated, locale)}
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground">
                    {dayjs(domain.timestamp.updated).format('YYYY/MM/DD HH:mm')}
                  </span>
                </div>
              </TableCell>
              <TableCell className="px-4">
                <DomainActions domain={domain} layout="menu" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
