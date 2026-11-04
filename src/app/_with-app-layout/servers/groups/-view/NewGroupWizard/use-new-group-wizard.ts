import { useMemo, useState } from 'react';

import {
  defaultRoleFor,
  defaultVersionOf,
  hasBlockingIssue,
  recommendEngine,
  validateClusterNodes,
} from '@/features/server-groups/shared/lib/cluster';
import type {
  ClusterCandidate,
  ClusterNodeDraft,
} from '@/features/server-groups/shared/lib/cluster';

import { ApiCluster, ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import type { ClusterDetailDto, ClusterKindDto } from '@/shared/rules/cluster';

export const GENERIC_KIND = 'generic';

export type WizardStep = 'type' | 'configure' | 'review' | 'install';

export interface CreatedCluster {
  cluster: ClusterDetailDto;
  warnings: string[];
}

const BUILTIN_INGRESS = 'builtin_ingress';

/**
 * The New group wizard's state: the chosen type, the form of that type, the
 * live checks and the create request. Engine and version follow the picked
 * servers until the user chooses one explicitly.
 */
export function useNewGroupWizard(kinds: ClusterKindDto[]) {
  const [step, setStep] = useState<WizardStep>('type');
  const [kindName, setKindName] = useState<string>(GENERIC_KIND);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nodes, setNodes] = useState<ClusterNodeDraft[]>([]);
  const [engineChoice, setEngineChoice] = useState<string>();
  const [versionChoice, setVersionChoice] = useState<string>();
  const [ingressChoice, setIngressChoice] = useState<boolean>();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<CreatedCluster | null>(null);

  const kind =
    kindName === GENERIC_KIND
      ? undefined
      : kinds.find((item) => item.name === kindName);
  const servers = useMemo(() => nodes.map((node) => node.server), [nodes]);

  const recommendedEngine = kind ? recommendEngine(kind, servers) : undefined;
  const chosenEngine = kind?.engines.find((item) => item.name === engineChoice);
  const engine =
    chosenEngine ??
    kind?.engines.find((item) => item.name === recommendedEngine) ??
    kind?.engines[0];

  const version =
    engine && versionChoice && engine.versions.includes(versionChoice)
      ? versionChoice
      : engine
        ? defaultVersionOf(engine)
        : '';

  const ingressOption = engine?.options.find(
    (option) => option.name === BUILTIN_INGRESS,
  );
  const builtinIngress =
    ingressChoice ??
    (typeof ingressOption?.default === 'boolean'
      ? ingressOption.default
      : true);

  const issues = useMemo(
    () => (kind ? validateClusterNodes(kind, nodes, engine) : []),
    [kind, nodes, engine],
  );

  const trimmedName = name.trim();
  const canContinue =
    step === 'type'
      ? kindName === GENERIC_KIND || kind?.status === 'available'
      : step === 'configure'
        ? trimmedName.length > 0 &&
          (!kind || (!hasBlockingIssue(issues) && Boolean(engine && version)))
        : true;

  const chooseKind = (next: string) => {
    if (next === kindName) return;
    setKindName(next);
    setNodes([]);
    setEngineChoice(undefined);
    setVersionChoice(undefined);
    setIngressChoice(undefined);
    setError('');
  };

  const chooseEngine = (next: string) => {
    setEngineChoice(next);
    setVersionChoice(undefined);
    setIngressChoice(undefined);
  };

  const toggleServer = (server: ClusterCandidate) => {
    setNodes((current) => {
      if (current.some((node) => node.server.id === server.id)) {
        return current.filter((node) => node.server.id !== server.id);
      }
      const role = kind ? defaultRoleFor(kind.roles, current) : '';
      return [...current, { server, role }];
    });
  };

  const setNodeRole = (serverId: string, role: string) => {
    setNodes((current) =>
      current.map((node) =>
        node.server.id === serverId ? { ...node, role } : node,
      ),
    );
  };

  const reset = () => {
    setStep('type');
    setKindName(GENERIC_KIND);
    setName('');
    setDescription('');
    setNodes([]);
    setEngineChoice(undefined);
    setVersionChoice(undefined);
    setIngressChoice(undefined);
    setError('');
    setIsSubmitting(false);
    setCreated(null);
  };

  /** Creates a generic group; answers its id, or undefined on failure. */
  const createGeneric = async () => {
    setIsSubmitting(true);
    setError('');

    const response = await ApiHostGroup.Create.doPost({
      name: trimmedName,
      description: description.trim() || undefined,
      server_ids: [],
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return undefined;
    }

    return response.id ? String(response.id) : undefined;
  };

  /** Creates the cluster group and moves to the Installing step. */
  const createCluster = async () => {
    if (!kind || !engine) return;

    setIsSubmitting(true);
    setError('');

    const response = await ApiCluster.Create.doPost({
      name: trimmedName,
      description: description.trim(),
      kind: kind.name,
      engine: engine.name,
      version,
      nodes: nodes.map((node) => ({
        server_id: node.server.id,
        role: node.role,
      })),
      options: { builtin_ingress: builtinIngress },
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    setCreated({ cluster: response.cluster, warnings: response.warnings });
    setStep('install');
  };

  return {
    step,
    setStep,
    kindName,
    kind,
    chooseKind,
    name,
    setName,
    description,
    setDescription,
    nodes,
    toggleServer,
    setNodeRole,
    engine,
    recommendedEngine,
    chooseEngine,
    version,
    setVersion: setVersionChoice,
    builtinIngress,
    hasIngressOption: Boolean(ingressOption),
    setBuiltinIngress: setIngressChoice,
    issues,
    canContinue,
    error,
    setError,
    isSubmitting,
    created,
    createGeneric,
    createCluster,
    reset,
  };
}

export type NewGroupWizard = ReturnType<typeof useNewGroupWizard>;
