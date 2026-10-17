import { useState } from 'react';

import {
  ActivityIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
  ShieldAlertIcon,
} from 'lucide-react';

import { AdapterOsServiceFromDto } from '@/entities/os-service/adapter';
import ServicesTable from '@/entities/os-service/ui/presentation/ServicesTable';
import usePushServiceActivityUsecase from '@/entities/os-service/usecase/push-activity';

import {
  ServerManagementIconButton,
  ServerManagementMetric,
  ServerManagementSidepanel,
  ServerManagementState,
  ServerManagementToolbar,
} from '@/features/server-management-sidepanel-ui';
import { useServiceOverviewModal } from '@/features/service-overview-modal';

import { ApiService } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { Input } from '@/shared/presentation/atoms/Input';
import { buildPaginationV2 } from '@/widgets/ui-atomic-builder/atom-pagination-v2';

import type { ServerServicesSidepanelProps as Props } from '../rules/types';

const SERVICES_PAGE_SIZE = 10;
const ServicePaginationControl = buildPaginationV2({});

export default function ServerServicesSidepanel(props: Props) {
  const { embedded = false, serverId, serverName } = props;

  const [openServiceOverviewModal] = useServiceOverviewModal();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, isSearchDebouncing] =
    useDebounceValue(searchQuery);

  const [response, refresh] = ApiService.Origin.$ServerId.useGet({
    serverId,
    page,
    pageSize: SERVICES_PAGE_SIZE,
    searchByName: debouncedSearchQuery.trim() || undefined,
  });

  const services = useAdapter(response, (raw) => ({
    pagination: raw.pagination,
    list: raw.services.map((service) =>
      AdapterOsServiceFromDto.toOsService(service).unwrap(),
    ),
  }));

  const serviceList = services.$status === 'success' ? services.list : [];
  const pagination =
    services.$status === 'success' ? services.pagination : null;
  const totalPage = Math.max(1, pagination?.total_page ?? 1);
  const currentPage = Math.min(page, totalPage);

  const serviceStats =
    services.$status === 'success'
      ? {
          total: pagination?.total_item ?? serviceList.length,
          running: serviceList.filter(
            (service) => service.serviceState === 'running',
          ).length,
          failed: serviceList.filter((service) =>
            ['failed', 'dead', 'exited'].includes(service.serviceState),
          ).length,
        }
      : {
          total: '-',
          running: '-',
          failed: '-',
        };

  const [handlePushServiceActivity] = usePushServiceActivityUsecase({
    onSuccess: () => refresh(),
  });

  const isLoading = services.$status === 'loading';
  const hasSearchQuery = debouncedSearchQuery.trim().length > 0;

  return (
    <ServerManagementSidepanel
      embedded={embedded}
      title="Services"
      subtitle={serverName || `Server ID: ${serverId}`}
      icon={SettingsIcon}
      heading="Service manager"
      description="Review systemd service health and run lifecycle actions from one consistent control surface."
      actions={
        <>
          <ServerManagementIconButton
            label="Refresh services"
            icon={RefreshCwIcon}
            disabled={isLoading}
            isLoading={isLoading}
            onClick={() => refresh()}
          />
        </>
      }
      metrics={
        <>
          <ServerManagementMetric
            label="Services"
            value={serviceStats.total}
            icon={ActivityIcon}
          />
          <ServerManagementMetric
            label="Running shown"
            value={serviceStats.running}
            icon={SettingsIcon}
          />
          <ServerManagementMetric
            label="Attention shown"
            value={serviceStats.failed}
            icon={ShieldAlertIcon}
          />
        </>
      }
    >
      <ServerManagementToolbar>
        <label className="relative min-w-[260px] flex-1">
          <span className="sr-only">Search services</span>
          <Input
            className="pl-9"
            inputSize="sm"
            value={searchQuery}
            placeholder="Search service name"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck={false}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(1);
            }}
          />
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </label>

        <p className="text-xs text-muted-foreground">
          {services.$status === 'success'
            ? `${pagination?.total_item ?? serviceList.length} matched services`
            : isSearchDebouncing
              ? 'Filtering services'
              : 'Waiting for service data'}
        </p>
      </ServerManagementToolbar>

      {services.$status === 'initial' || services.$status === 'loading' ? (
        <ServicesTable.PlaceholderLoading />
      ) : services.$status === 'failed' ? (
        <ServerManagementState
          state="failed"
          title="Failed to load services"
          description={getApiErrorDetail(services.error)}
          action={
            <ServerManagementIconButton
              label="Retry"
              icon={RefreshCwIcon}
              onClick={() => refresh()}
            />
          }
        />
      ) : serviceList.length === 0 && !pagination?.total_item ? (
        <ServerManagementState
          title={
            hasSearchQuery
              ? 'No services match the filter'
              : 'No running services found'
          }
          description={
            hasSearchQuery
              ? 'Try another systemd service name.'
              : 'The agent did not report any systemd services for this server.'
          }
        />
      ) : (
        <div className="grid gap-3">
          <ServicesTable
            targetServerId={serverId}
            services={[...serviceList]}
            onClickServiceDetail={(serviceName) => {
              openServiceOverviewModal({ serviceName, serverId });
            }}
            onClickActivity={handlePushServiceActivity}
          />

          {pagination && totalPage > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card px-3 py-2">
              <p className="text-xs text-muted-foreground">
                Showing page {currentPage} of {totalPage}
              </p>
              <ServicePaginationControl
                alwaysShowPaginationRows
                currentPage={currentPage}
                totalPage={totalPage}
                onClickBack={() =>
                  setPage((activePage) => Math.max(1, activePage - 1))
                }
                onClickForward={() =>
                  setPage((activePage) => Math.min(totalPage, activePage + 1))
                }
                onPageChange={(newPage) => setPage(newPage)}
              />
            </div>
          ) : null}
        </div>
      )}
    </ServerManagementSidepanel>
  );
}
