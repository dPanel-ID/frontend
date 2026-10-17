import { useState } from 'react';

import {
  ActivityIcon,
  CirclePlayIcon,
  CircleStopIcon,
  EyeIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { AdapterOsServiceFromDto } from '@/entities/os-service/adapter';
import type {
  OsService,
  SchemaOsServiceParts,
} from '@/entities/os-service/rules/schema';
import { OS_SERVICE_STATE_METADATA } from '@/entities/os-service/ui/constants/state-metadata';
import usePushServiceActivityUsecase from '@/entities/os-service/usecase/push-activity';

import { useServiceOverviewModal } from '@/features/service-overview-modal';

import { ApiService } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

import { useServerDataModel } from '../../../-model/server-data';
import {
  TAB_PAGE_SIZE,
  TabMeta,
  TabPagination,
  TabPanel,
  TabRetry,
  TabSearch,
  TabState,
  tabTable,
} from '../_shared/TabPanel';

const ATTENTION_STATES = new Set<SchemaOsServiceParts.State>([
  'failed',
  'dead',
  'exited',
]);

const STATE_TONE: Record<SchemaOsServiceParts.State, StatusTone> = {
  running: 'success',
  failed: 'danger',
  dead: 'danger',
  exited: 'neutral',
  reload: 'info',
  reloading: 'info',
  restarting: 'info',
  unknown: 'neutral',
};

/** systemd units on the server, searchable and paged by the API. */
export default function ServicesTab() {
  const t = useDevetekTranslations('page.serverDetail.services');
  const tCommon = useDevetekTranslations('page.serverDetail.tabsCommon');
  const [serverId] = useServerDataModel((s) => [String(s.serverId)]);
  const [openServiceOverviewModal] = useServiceOverviewModal();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounceValue(searchQuery);

  const [response, refresh] = ApiService.Origin.$ServerId.useGet({
    serverId,
    page,
    pageSize: TAB_PAGE_SIZE,
    searchByName: debouncedSearchQuery.trim() || undefined,
  });

  const services = useAdapter(response, (raw) => ({
    pagination: raw.pagination,
    list: raw.services.map((service) =>
      AdapterOsServiceFromDto.toOsService(service).unwrap(),
    ),
  }));

  const [pushActivity] = usePushServiceActivityUsecase({
    onSuccess: () => refresh(),
  });

  const list = services.$status === 'success' ? services.list : [];
  const total =
    services.$status === 'success' ? services.pagination.total_item : undefined;
  const totalPage =
    services.$status === 'success'
      ? Math.max(1, services.pagination.total_page)
      : 1;
  const running = list.filter((s) => s.serviceState === 'running').length;
  const attention = list.filter((s) =>
    ATTENTION_STATES.has(s.serviceState),
  ).length;
  const isLoading = response.$status === 'loading';

  return (
    <TabPanel
      icon={SlidersHorizontalIcon}
      title={t('title')}
      description={t('description')}
      actions={
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          size="sm"
          disabled={isLoading}
          onClick={() => refresh()}
        >
          <RefreshCwIcon className={cn(isLoading && 'animate-spin')} />
          {tCommon('refresh')}
        </Button>
      }
      tiles={
        <>
          <StatTile
            size="sm"
            icon={SlidersHorizontalIcon}
            label={t('tiles.total')}
            value={total ?? '-'}
          />
          <StatTile
            size="sm"
            icon={CirclePlayIcon}
            tone="emerald"
            label={t('tiles.running')}
            value={running}
          />
          <StatTile
            size="sm"
            icon={ShieldAlertIcon}
            tone={attention > 0 ? 'red' : 'neutral'}
            label={t('tiles.attention')}
            value={attention}
          />
        </>
      }
      toolbar={
        <>
          <TabSearch
            value={searchQuery}
            placeholder={t('searchPlaceholder')}
            onChange={(value) => {
              setSearchQuery(value);
              setPage(1);
            }}
          />
          <TabMeta>{tCommon('rows', { count: total ?? 0 })}</TabMeta>
        </>
      }
      footer={
        <TabPagination
          page={Math.min(page, totalPage)}
          totalPage={totalPage}
          onPageChange={setPage}
        />
      }
    >
      {services.$status === 'initial' ||
      (services.$status === 'loading' && !services.prevData) ? (
        <TabState state="loading" title={tCommon('loading')} />
      ) : services.$status === 'failed' ? (
        <TabState
          state="failed"
          title={tCommon('loadFailed')}
          description={getApiErrorDetail(services.error)}
          action={<TabRetry onClick={() => refresh()} />}
        />
      ) : list.length === 0 ? (
        <TabState
          state="empty"
          title={searchQuery ? t('noMatch') : t('empty')}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className={cn(tabTable.head, 'w-40')}>
                {t('table.state')}
              </TableHead>
              <TableHead className={tabTable.head}>
                {t('table.service')}
              </TableHead>
              <TableHead className={cn(tabTable.head, 'w-48 text-right')}>
                {t('table.actions')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((service) => (
              <ServiceRow
                key={service.serviceName}
                service={service}
                onClickDetail={() =>
                  openServiceOverviewModal({
                    serviceName: service.serviceName,
                    serverId,
                  })
                }
                onActivity={(activity) =>
                  pushActivity({
                    activity,
                    serviceName: service.serviceName,
                    targetServerId: serverId,
                  })
                }
              />
            ))}
          </TableBody>
        </Table>
      )}
    </TabPanel>
  );
}

function ServiceRow(props: {
  service: OsService;
  onClickDetail: () => void;
  onActivity: (activity: SchemaOsServiceParts.Activity) => void;
}) {
  const { onActivity, onClickDetail, service } = props;
  const t = useDevetekTranslations();
  const tTab = useDevetekTranslations('page.serverDetail.services');
  const metadata = OS_SERVICE_STATE_METADATA[service.serviceState];
  const pulse =
    service.serviceState === 'reloading' ||
    service.serviceState === 'restarting' ||
    service.serviceState === 'reload';

  return (
    <TableRow>
      <TableCell className={tabTable.cell}>
        <StatusPill
          tone={STATE_TONE[service.serviceState]}
          pulse={pulse}
          label={t(metadata.i18n.statusLabel)}
        />
      </TableCell>
      <TableCell className={cn(tabTable.monoCell, 'text-primary')}>
        {service.serviceName}
      </TableCell>
      <TableCell className={cn(tabTable.cell, 'text-right')}>
        <div className="inline-flex items-center gap-1.5">
          <Button
            size="sm"
            buttonColor="secondary"
            buttonStyle="outline"
            onClick={onClickDetail}
          >
            <EyeIcon className="size-4" />
            {tTab('details')}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon-sm"
                buttonColor="secondary"
                buttonStyle="outline"
                aria-label={tTab('activity')}
                title={tTab('activity')}
              >
                <ActivityIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onActivity('start')}>
                <CirclePlayIcon className="size-4" />
                {t('common.actions.start')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActivity('restart')}>
                <RotateCcwIcon className="size-4" />
                {t('common.actions.restart')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActivity('reload')}>
                <RefreshCwIcon className="size-4" />
                {t('common.actions.reload')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onActivity('stop')}>
                <CircleStopIcon className="size-4" />
                {t('common.actions.stop')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </TableCell>
    </TableRow>
  );
}
