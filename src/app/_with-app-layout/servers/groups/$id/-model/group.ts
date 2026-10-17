import { useEffect, useMemo, useState } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';

import {
  toHostGroupDetail,
  toHostGroupOperation,
} from '@/entities/host-group/adapter';
import type {
  HostGroupDetail,
  HostGroupOperation,
} from '@/entities/host-group/rules/schema';

import { getOperationRefreshInterval } from '@/features/server-groups/shared/lib/operation';
import { useServerGroupMemberMutations } from '@/features/server-groups/usecase/member-mutations';
import { useRetainedResponseData } from '@/features/server-groups/usecase/use-retained-response-data';

import { ApiHostGroup } from '@/shared/api';
import { buildContext } from '@/shared/libs/react-factories/buildContext';

import type { GroupDetailTab } from '../-rules/search';

export interface GroupDetailModelProps {
  groupId: string;
  operationId?: string;
}

export interface OperationHistoryItem {
  id: string;
  type: string;
  status: string;
  targetCount: number;
  succeededCount: number;
  failedCount: number;
  updatedAt: Date;
}

export type GroupDialog =
  | { kind: 'edit' }
  | { kind: 'delete' }
  | { kind: 'deploy' }
  | { kind: 'module' }
  | { kind: 'retry' }
  | { kind: 'bulk'; action: 'inventory' | 'reboot' | 'upgrade' };

/**
 * Everything the group page knows: the group and its servers, the operation
 * history, the operation open in the URL (polled while it runs), member
 * mutations and which dialog is open.
 */
export const [GroupDetailModelProvider, useGroupDetailModel] = buildContext(
  'GroupDetailModel',
  (props: GroupDetailModelProps) => {
    const { groupId, operationId } = props;
    const navigate = useNavigate();
    const currentSearch = useSearch({
      from: '/_with-app-layout/servers/groups/$id/',
    });
    const [dialog, setDialog] = useState<GroupDialog | null>(null);
    const [operationStatus, setOperationStatus] = useState<string>();

    const [detailResponse, refreshDetail] = ApiHostGroup.Detail.$Id.useGet({
      id: groupId,
      options: { refreshIntervalMs: 10_000 },
    });
    const [historyResponse, refreshHistory] =
      ApiHostGroup.Operations.$Id.useGet({
        id: groupId,
        options: { refreshIntervalMs: 15_000 },
      });
    const [operationResponse, refreshOperation] =
      ApiHostGroup.Operation.$Id.useGet({
        id: operationId ?? '',
        options: {
          skip: !operationId,
          refreshIntervalMs: getOperationRefreshInterval(
            operationId,
            operationStatus,
          ),
        },
      });

    const detail = useRetainedResponseData(detailResponse);
    const history = useRetainedResponseData(historyResponse);
    const operationData = useRetainedResponseData(operationResponse);

    const group: HostGroupDetail | null = detail.data
      ? toHostGroupDetail(detail.data).unwrap()
      : null;

    const operation: HostGroupOperation | null =
      operationId && operationData.data
        ? toHostGroupOperation(operationData.data).unwrap()
        : null;

    const latestStatus = operation?.status;
    useEffect(() => {
      setOperationStatus(latestStatus);
    }, [latestStatus]);

    const operations = useMemo<OperationHistoryItem[]>(() => {
      return (history.data ?? [])
        .map((item) => ({
          id: item.id,
          type: item.type,
          status: item.status,
          targetCount: item.target_count,
          succeededCount: item.succeeded_count,
          failedCount: item.failed_count,
          updatedAt: new Date(item.updated_at),
        }))
        .sort(
          (left, right) => right.updatedAt.getTime() - left.updatedAt.getTime(),
        );
    }, [history.data]);

    const members = useServerGroupMemberMutations({
      groupId,
      onSuccess: () => refreshDetail(),
    });

    const goTo = (search: { tab?: GroupDetailTab; operationId?: string }) => {
      navigate({
        to: '/servers/groups/$id',
        params: { id: groupId },
        search: { ...currentSearch, ...search },
        replace: true,
      });
    };

    /** Opens the Operations tab on a freshly queued operation. */
    const showOperation = (nextOperationId: string) => {
      goTo({ tab: 'operations', operationId: nextOperationId });
      refreshHistory();
    };

    return {
      groupId,
      group,
      detailResponse,
      isDetailDegraded: detail.isDegraded,
      refreshDetail,
      operations,
      historyResponse,
      isHistoryDegraded: history.isDegraded,
      refreshHistory,
      operationId,
      operation,
      operationResponse,
      isOperationDegraded: operationData.isDegraded,
      refreshOperation,
      members,
      dialog,
      setDialog,
      goTo,
      showOperation,
      canRunActions: (group?.memberCount ?? 0) > 0 && !detail.isDegraded,
    };
  },
);
