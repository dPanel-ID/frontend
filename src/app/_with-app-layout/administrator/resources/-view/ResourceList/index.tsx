import { useDevetekTranslations } from '@/services/i18n';

import { buildPaginationV2 } from '@/widgets/ui-atomic-builder/atom-pagination-v2';

import { useAdminResourcesDataModel } from '../../-model/resources-data';
import { ResourceListState } from '../ResourceListState';

import AdminRemovedServers from './AdminRemovedServers';
import AdminServerCards from './AdminServerCards';
import ResourceCard from './ResourceCard';

const ResourcePagination = buildPaginationV2({});

/**
 * The selected type as cards, newest first: servers as the servers page
 * draws them, everything else as a resource card with its related data.
 */
export default function ResourceList() {
  const t = useDevetekTranslations('page.adminResources');
  const [
    type,
    resources,
    servers,
    page,
    search,
    changePage,
    refresh,
    refreshServers,
  ] = useAdminResourcesDataModel((s) => [
    s.type,
    s.resources,
    s.servers,
    s.page,
    s.search,
    s.changePage,
    s.refresh,
    s.refreshServers,
  ]);

  const isServers = type === 'servers';
  const source = isServers ? servers : resources;
  if (source.$status === 'failed') {
    return (
      <ResourceListState.Error
        {...source}
        onRetry={isServers ? refreshServers : refresh}
      />
    );
  }

  const shownServers = current(servers);
  const shownResources = current(resources);
  // While another tab loads, the previous tab's rows would sit under this
  // tab's name; show the placeholder instead.
  const resourceData =
    shownResources?.type === type ? shownResources : undefined;
  const data = isServers ? shownServers : resourceData;
  if (!data) return <ResourceListState.Loading />;

  const count = isServers
    ? (shownServers?.servers.length ?? 0)
    : (resourceData?.items.length ?? 0);
  if (count < 1) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground">
        {search ? t('empty.search', { search }) : t(`empty.${type}`)}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {isServers && <AdminRemovedServers />}
      {isServers && shownServers ? (
        <AdminServerCards
          servers={shownServers.servers}
          stats={shownServers.stats}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {resourceData?.items.map((item) => (
            <ResourceCard key={item.id} type={type} item={item} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {t('total', { count: data.total })}
        </p>
        {data.totalPage > 1 && (
          <ResourcePagination
            currentPage={page}
            totalPage={data.totalPage}
            onClickBack={() => changePage(Math.max(1, page - 1))}
            onClickForward={() =>
              changePage(Math.min(data.totalPage, page + 1))
            }
            onPageChange={changePage}
          />
        )}
      </div>
    </div>
  );
}

/** The latest rows, kept while a refresh or the next page loads. */
function current<T>(response: {
  $status: string;
  prevData?: T;
}): T | undefined {
  if (response.$status === 'success') return response as unknown as T;
  if (response.$status === 'loading') return response.prevData;
  return undefined;
}
