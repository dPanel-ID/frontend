import { useMemo, useState } from 'react';

import { useAuthLoggedIn } from '@/services/auth';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import { AdapterDomainFromDto } from '@/entities/domain/adapter';
import { AdapterServerFromDto } from '@/entities/server/adapter';
import { toServerModuleFromCatalog } from '@/entities/server-modules/lib/catalog';

import { ApiApplication, ApiDomain, ApiModule, ApiServer } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';

import {
  mergeCatalogModulesWithServerInventory,
  runtimeItemFromInfrastructureModule,
} from '../-lib/modules';
import type { InfrastructureModuleCatalog } from '../-model/form';
import { SERVER_PAGE_SIZE } from '../-model/form';

/** Everything the create flow needs to fetch, in one hook. */
export type CreateResources = ReturnType<typeof useLoadBalancerCreateResources>;

export function useLoadBalancerCreateResources(
  selectedServerId?: string,
  selectedEngine?: string,
) {
  const { userProfile } = useAuthLoggedIn();
  const [serverSearch, setServerSearch] = useState('');
  const [applicationSearch, setApplicationSearch] = useState('');
  const [serverPage, setServerPage] = useState(1);

  const [responseServers, refreshServers] = ApiServer.Find.useGet({
    userId: userProfile.id,
    searchQuery: serverSearch,
    page: serverPage,
    pageSize: SERVER_PAGE_SIZE,
  });

  const [responseApplications, refreshApplications] =
    ApiApplication.Find.useGet({
      name: applicationSearch,
      page: 1,
      limit: 12,
    });

  const [responseDomains, refreshDomains] = ApiDomain.Find.useGet({
    page: 1,
    perPage: 12,
  });

  const [responseModules, refreshModules] = ApiModule.Find.useGet({
    serverId: selectedServerId || undefined,
    options: {
      skip: !selectedServerId,
    },
  });

  const [responseServerModules, refreshServerModules] =
    ApiServer.Modules.$Id.useGet({
      serverId: String(selectedServerId ?? ''),
      options: {
        skip: !selectedServerId,
      },
    });

  const servers = useAdapter(responseServers, (raw) => ({
    // A private server has no public IP, so nothing could reach a load
    // balancer on it, nor an upstream it serves.
    list: (raw.machines ?? [])
      .filter((machine) => machine.connectivity !== 'private')
      .map((machine) => AdapterServerFromDto.toServerCard(machine).unwrap()),
    pagination: raw.pagination,
  }));

  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));

  const domains = useAdapter(responseDomains, (raw) => ({
    list: (raw.domains ?? []).map((domain) =>
      AdapterDomainFromDto.toDomainCard(domain).unwrap(),
    ),
    pagination: raw.pagination,
  }));

  const infrastructureCatalogModules = useAdapter(responseModules, (raw) => ({
    repository: raw.repository,
    list: raw.modules
      .map((module) =>
        toServerModuleFromCatalog(
          module,
          raw.repository.ref.name,
          raw.repository.ref.resolved_commit,
        ),
      )
      .filter(
        (module) =>
          module.category.includes('infrastructure') ||
          module.installerType === 'infrastructure',
      ),
  }));
  const serverModuleInventory = useMemo(() => {
    if (responseServerModules.$status === 'success') {
      return responseServerModules.modules ?? [];
    }

    if (responseServerModules.$status === 'loading') {
      return responseServerModules.prevData?.modules ?? [];
    }

    return [];
  }, [responseServerModules]);
  const infrastructureModules = useMemo<
    typeof infrastructureCatalogModules
  >(() => {
    const mergeData = <T extends InfrastructureModuleCatalog>(data: T): T => ({
      ...data,
      list: mergeCatalogModulesWithServerInventory(
        data.list,
        serverModuleInventory,
      ),
    });

    if (infrastructureCatalogModules.$status === 'success') {
      return mergeData(infrastructureCatalogModules);
    }

    if (infrastructureCatalogModules.$status === 'loading') {
      return {
        ...infrastructureCatalogModules,
        prevData: infrastructureCatalogModules.prevData
          ? mergeData(infrastructureCatalogModules.prevData)
          : undefined,
      };
    }

    return infrastructureCatalogModules;
  }, [infrastructureCatalogModules, serverModuleInventory]);

  const moduleCatalog =
    infrastructureModules.$status === 'success'
      ? infrastructureModules
      : infrastructureModules.$status === 'loading'
        ? infrastructureModules.prevData
        : undefined;
  const selectedInfrastructureModule = selectedEngine
    ? moduleCatalog?.list.find((module) => module.id === selectedEngine)
    : undefined;
  const catalogRef = moduleCatalog?.repository.ref.name;

  const [selectedEngineDetail, refreshSelectedEngineDetail] =
    ApiModule.Detail.$Name.useGet({
      name: selectedEngine || '',
      ref: catalogRef,
      options: {
        skip: !selectedServerId || !selectedEngine || !catalogRef,
      },
    });

  const selectedEngineDetailData =
    selectedEngineDetail.$status === 'success' &&
    selectedEngineDetail.id === selectedEngine
      ? selectedEngineDetail
      : undefined;

  const selectedEngineRuntimeItem =
    selectedInfrastructureModule && selectedEngineDetailData
      ? runtimeItemFromInfrastructureModule(
          selectedInfrastructureModule,
          selectedEngineDetailData,
        )
      : undefined;

  const updateServerSearch = (value: string) => {
    setServerSearch(value);
    setServerPage(1);
  };

  return {
    servers,
    applications,
    domains,
    infrastructureModules,
    selectedEngineDetail,
    selectedEngineRuntimeItem,
    refreshServers,
    refreshApplications,
    refreshDomains,
    refreshModules: () => {
      refreshModules();
      refreshServerModules();
    },
    refreshSelectedEngineDetail,
    serverSearch,
    setServerSearch: updateServerSearch,
    applicationSearch,
    setApplicationSearch,
    serverPage,
    setServerPage,
  };
}
