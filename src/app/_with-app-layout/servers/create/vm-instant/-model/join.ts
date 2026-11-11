import type { DTOs } from '@/shared/api';

/** How a new cloud VM joins dPanel. */
export type JoinMethod = 'agent' | 'ssh';

/** What the provider's VM create contract lets the form offer. */
export interface JoinContract {
  /** The contract has a `join_method` field that offers the agent. */
  agentJoin: boolean;
  /** The join method the contract preselects. */
  defaultJoinMethod: JoinMethod;
  /** The contract has a `reserve_public_ip` field. */
  publicIPChoice: boolean;
}

/**
 * Reads the join method and public IP choices from a VM create contract.
 * A provider without a `join_method` field joins over SSH only, and one
 * without `reserve_public_ip` always gives its VMs a public IP.
 */
export function readJoinContract(
  fields?: DTOs.CloudProviderFieldV1[],
): JoinContract {
  const joinField = fields?.find((field) => field.key === 'join_method');
  const agentJoin = Boolean(
    joinField?.options?.some((option) => option.value === 'agent'),
  );

  return {
    agentJoin,
    defaultJoinMethod:
      agentJoin && joinField?.default !== 'ssh' ? 'agent' : 'ssh',
    publicIPChoice: Boolean(
      fields?.some((field) => field.key === 'reserve_public_ip'),
    ),
  };
}

interface JoinValues {
  joinMethod: JoinMethod;
  contract: { agentJoin: boolean; publicIPChoice: boolean };
  spec: { reservePublicIP: boolean };
}

/** The join method the request uses: SSH where the agent is not offered. */
export function resolveJoinMethod(values: JoinValues): JoinMethod {
  return values.contract.agentJoin ? values.joinMethod : 'ssh';
}

/**
 * The public IP choice the request sends: undefined where the provider has
 * no choice, and always true for SSH, which reaches the VM on its public IP.
 */
export function resolveReservePublicIP(values: JoinValues) {
  if (!values.contract.publicIPChoice) return undefined;
  if (resolveJoinMethod(values) === 'ssh') return true;
  return values.spec.reservePublicIP;
}
