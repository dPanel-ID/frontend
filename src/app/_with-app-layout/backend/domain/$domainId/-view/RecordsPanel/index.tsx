import { ListTreeIcon, XIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import {
  DataPanel,
  DataPanelMeta,
  DataPanelPagination,
  DataPanelRetry,
  DataPanelSearch,
  DataPanelState,
  dataTable,
} from '@/shared/presentation/organisms/DataPanel';

import { useDomainRecordsModel } from '../../-model/domain-records';
import { useRecordDelete } from '../../-usecase/use-record-delete';

import { RecordRow } from './RecordRow';
import { TypeFilter } from './TypeFilter';

/**
 * Every record in the zone, searched and filtered on the API. Matching text
 * is highlighted, so it is clear why each record is in the list.
 */
export default function RecordsPanel() {
  const t = useDevetekTranslations('page.domainDetail.records');
  const tCommon = useDevetekTranslations('common.dataPanel');
  const [
    domain,
    records,
    isFetching,
    refreshRecords,
    search,
    searchInput,
    setSearchInput,
    type,
    setType,
    setPage,
    clearFilters,
  ] = useDomainRecordsModel((s) => [
    s.domain,
    s.records,
    s.isFetchingRecords,
    s.refreshRecords,
    s.search,
    s.searchInput,
    s.setSearchInput,
    s.type,
    s.setType,
    s.setPage,
    s.clearFilters,
  ]);
  const deleteRecord = useRecordDelete();

  const zone = domain.$status === 'success' ? domain.domain.hostname : '';
  const isFiltered = Boolean(search || type);

  return (
    <DataPanel
      icon={ListTreeIcon}
      title={t('title')}
      description={t('description')}
      toolbar={
        <>
          <div className="flex min-w-0 flex-col gap-2 lg:flex-row lg:items-center">
            <DataPanelSearch
              value={searchInput}
              placeholder={t('searchPlaceholder')}
              onChange={setSearchInput}
            />
            <TypeFilter value={type} onChange={setType} />
          </div>
          <DataPanelMeta>
            <span className={cn(isFetching && 'animate-pulse')}>
              {records.$status === 'success'
                ? isFiltered
                  ? t('matches', { count: records.total })
                  : t('count', { count: records.total })
                : ' '}
            </span>
          </DataPanelMeta>
        </>
      }
      footer={
        records.$status === 'success' && (
          <DataPanelPagination
            page={records.page}
            totalPage={records.totalPage}
            onPageChange={setPage}
          />
        )
      }
    >
      {records.$status === 'initial' || records.$status === 'loading' ? (
        <DataPanelState state="loading" title={tCommon('loading')} />
      ) : records.$status === 'failed' ? (
        <DataPanelState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(records.error)}
          action={<DataPanelRetry onClick={() => refreshRecords()} />}
        />
      ) : records.records.length === 0 ? (
        <DataPanelState
          state="empty"
          title={
            search && type
              ? t('noMatchTyped', { query: search, type })
              : search
                ? t('noMatch', { query: search })
                : type
                  ? t('noMatchType', { type })
                  : t('empty')
          }
          description={isFiltered ? t('noMatchHint') : undefined}
          action={
            isFiltered && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1.5 rounded-lg border bg-background px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-border/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
              >
                <XIcon className="size-3.5" />
                {t('clearFilters')}
              </button>
            )
          }
        />
      ) : (
        <Table className={cn(isFetching && 'opacity-60 transition-opacity')}>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(dataTable.head, 'w-24')}>
                {t('table.type')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.name')}
              </TableHead>
              <TableHead className={dataTable.head}>
                {t('table.content')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-20')}>
                {t('table.ttl')}
              </TableHead>
              <TableHead className={cn(dataTable.head, 'w-32 text-right')}>
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.records.map((record) => (
              <RecordRow
                key={record.id}
                record={record}
                zone={zone}
                query={search}
                onDelete={deleteRecord}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </DataPanel>
  );
}
