import { useCallback, useMemo } from 'react';

import { ApiAgent, ApiExecution } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import type { Response } from '@/shared/libs/api-client/rules/types';

import {
  sortActivityItems,
  staleAgents,
  toActivityItem,
} from '../-lib/activity';
import type { ActivityItem } from '../-lib/activity';
import { isUnauthorizedResponse } from '../-lib/response-state';
import { buildVerdict, unhealthyServers } from '../-lib/verdict';
import type { Verdict } from '../-lib/verdict';

/** Failures older than this are history, not something to act on now. */
const HEALTH_WINDOW = '24h';
const FAILURE_LIMIT = 8;

export interface DashboardHealthParams {
  servers: DTOs.MachineV1[];
  /** True when the server list could not be read, so its counts are unusable. */
  serversUnavailable?: boolean;
}

export interface DashboardHealth {
  verdict: Verdict;
  /** Failed and cancelled executions in the window, newest first. */
  failures: ActivityItem[];
  unreachableAgents: DTOs.AgentV2[];
  unhealthyServers: DTOs.MachineV1[];
  /** Nothing has resolved yet, so there is no verdict to show. */
  isLoading: boolean;
  /** Every health source failed; the page cannot make a claim. */
  hasFailed: boolean;
  /** A source refused the request, so retrying will not help. */
  isUnauthorized: boolean;
  refresh: () => void;
}

/**
 * Reads the three sources the page's health claims rest on — execution
 * counts, failed executions and agent heartbeats — once per render, so the
 * verdict line and the attention panel cannot disagree and the page does not
 * poll the same endpoints twice.
 */
export function useDashboardHealth(
  params: DashboardHealthParams,
): DashboardHealth {
  const { servers, serversUnavailable = false } = params;

  const [summaryResponse, refreshSummary] = ApiExecution.Summary.useGet({
    since: HEALTH_WINDOW,
  });
  const [failuresResponse, refreshFailures] = ApiExecution.Find.useGet({
    status: ['failed', 'cancelled'],
    since: HEALTH_WINDOW,
    limit: FAILURE_LIMIT,
  });
  const [agentsResponse, refreshAgents] = ApiAgent.Find.useGet({});

  const summary = useMemo<DTOs.ExecutionSummaryV2 | undefined>(() => {
    if (summaryResponse.$status !== 'success') return undefined;
    const { $status, ...counts } = summaryResponse;
    void $status;
    return counts;
  }, [summaryResponse]);

  const agents = useMemo<DTOs.AgentV2[] | undefined>(() => {
    if (agentsResponse.$status !== 'success') return undefined;
    // The api-client glues $status onto the payload, so copy the rows out
    // before reading them.
    return Array.from(agentsResponse);
  }, [agentsResponse]);

  const failures = useMemo(() => {
    if (failuresResponse.$status !== 'success') return [];
    return sortActivityItems(
      Array.from(failuresResponse).map(toActivityItem),
    ).slice(0, FAILURE_LIMIT);
  }, [failuresResponse]);

  const unreachableAgents = useMemo(
    () => (agents ? staleAgents(agents) : []),
    [agents],
  );

  const failingServers = useMemo(
    () => (serversUnavailable ? [] : unhealthyServers(servers)),
    [servers, serversUnavailable],
  );

  const verdict = useMemo(
    () =>
      buildVerdict({
        summary,
        servers,
        agents,
        serversUnavailable,
      }),
    [agents, servers, serversUnavailable, summary],
  );

  const refresh = useCallback(() => {
    refreshSummary();
    refreshFailures();
    refreshAgents();
  }, [refreshAgents, refreshFailures, refreshSummary]);

  const responses = [summaryResponse, failuresResponse, agentsResponse];

  return {
    verdict,
    failures,
    unreachableAgents,
    unhealthyServers: failingServers,
    isLoading: responses.every(isPending),
    hasFailed: responses.every((response) => response.$status === 'failed'),
    isUnauthorized: responses.some(isUnauthorizedResponse),
    refresh,
  };
}

function isPending(response: Response<unknown>) {
  return response.$status === 'initial' || response.$status === 'loading';
}
