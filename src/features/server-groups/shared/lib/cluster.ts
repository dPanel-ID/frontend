import type {
  ClusterArchitecture,
  ClusterEngineDto,
  ClusterKindDto,
  ClusterRoleDto,
} from '@/shared/rules/cluster';

/** A server that may become a cluster node, as the wizard sees it. */
export interface ClusterCandidate {
  id: string;
  hostname: string;
  address: string;
  /** Normalized from the server's `os_arch`; undefined when unknown. */
  arch?: ClusterArchitecture;
  region?: string;
  provider?: string;
  status?: string;
  /** Set when the server already belongs to a group. */
  hostGroupId?: string;
}

export interface ClusterNodeDraft {
  server: ClusterCandidate;
  role: string;
}

export interface ClusterIssue {
  level: 'error' | 'warning';
  code:
    | 'noServers'
    | 'minServers'
    | 'roleMin'
    | 'roleMax'
    | 'roleOdd'
    | 'unknownArch'
    | 'mixedRegions'
    | 'engineUnsupported';
  params?: Record<string, string | number>;
}

const ARCH_ALIASES: Record<string, ClusterArchitecture> = {
  amd64: 'amd64',
  x86_64: 'amd64',
  x64: 'amd64',
  arm64: 'arm64',
  aarch64: 'arm64',
  armhf: 'armhf',
  armv7l: 'armhf',
  armv7: 'armhf',
  armv6l: 'armhf',
  arm: 'armhf',
};

/**
 * Ansible reports `x86_64`, `aarch64` or `armv7l`; the cluster API speaks
 * `amd64`, `arm64` and `armhf`. Unknown values stay unknown.
 */
export function normalizeArchitecture(
  raw?: string | null,
): ClusterArchitecture | undefined {
  if (!raw) return undefined;
  return ARCH_ALIASES[raw.trim().toLowerCase()];
}

export function isArmArchitecture(arch?: ClusterArchitecture) {
  return arch === 'arm64' || arch === 'armhf';
}

/** Picked servers whose known architecture the engine cannot run on. */
export function serversUnsupportedByEngine(
  engine: Pick<ClusterEngineDto, 'architectures'>,
  servers: ClusterCandidate[],
) {
  return servers.filter(
    (server) =>
      server.arch !== undefined && !engine.architectures.includes(server.arch),
  );
}

/**
 * Engine preference per kind: the first eligible name wins. Arm boards and
 * small machines fit the lightweight engine; otherwise the hardened one.
 */
const ENGINE_PREFERENCE: Record<string, { arm: string[]; other: string[] }> = {
  kubernetes: { arm: ['k3s'], other: ['rke2', 'k3s'] },
};

/**
 * The engine to pre-select and badge as "Recommended", or undefined when no
 * engine can run on every picked server.
 */
export function recommendEngine(
  kind: Pick<ClusterKindDto, 'name' | 'engines'>,
  servers: ClusterCandidate[],
): string | undefined {
  const eligible = kind.engines.filter(
    (engine) => serversUnsupportedByEngine(engine, servers).length === 0,
  );
  if (eligible.length === 0) return undefined;

  const preference = ENGINE_PREFERENCE[kind.name];
  const order = servers.some((server) => isArmArchitecture(server.arch))
    ? preference?.arm
    : preference?.other;

  for (const name of order ?? []) {
    if (eligible.some((engine) => engine.name === name)) return name;
  }

  return eligible[0]?.name;
}

function versionParts(version: string) {
  return (version.replace(/^v/i, '').match(/\d+/g) ?? []).map(Number);
}

/** Compares release tags such as `v1.31.4+k3s1` numerically. */
export function compareVersions(left: string, right: string) {
  const a = versionParts(left);
  const b = versionParts(right);
  const length = Math.max(a.length, b.length);

  for (let index = 0; index < length; index += 1) {
    const difference = (a[index] ?? 0) - (b[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return left.localeCompare(right);
}

export function sortVersionsNewestFirst(versions: string[]) {
  return [...new Set(versions)].sort((left, right) =>
    compareVersions(right, left),
  );
}

/** The engine's default version when it is listed, else the newest. */
export function defaultVersionOf(
  engine: Pick<ClusterEngineDto, 'versions' | 'default_version'>,
) {
  if (
    engine.default_version &&
    engine.versions.includes(engine.default_version)
  )
    return engine.default_version;
  return sortVersionsNewestFirst(engine.versions)[0] ?? '';
}

/**
 * The role a newly picked server gets: the first role still below its
 * minimum, else a role without an upper limit, else the last role.
 */
export function defaultRoleFor(
  roles: ClusterRoleDto[],
  nodes: ClusterNodeDraft[],
): string {
  const countOf = (role: string) =>
    nodes.filter((node) => node.role === role).length;

  const missing = roles.find((role) => countOf(role.name) < role.min);
  if (missing) return missing.name;

  const unlimited = roles.find((role) => role.max === 0);
  if (unlimited) return unlimited.name;

  return roles.at(-1)?.name ?? '';
}

/** Live checks under the form. Errors block the next step; warnings do not. */
export function validateClusterNodes(
  kind: Pick<ClusterKindDto, 'min_servers' | 'roles'>,
  nodes: ClusterNodeDraft[],
  engine?: Pick<ClusterEngineDto, 'name' | 'title' | 'architectures'>,
): ClusterIssue[] {
  const issues: ClusterIssue[] = [];

  if (nodes.length === 0) {
    issues.push({ level: 'error', code: 'noServers' });
    return issues;
  }

  if (nodes.length < kind.min_servers) {
    issues.push({
      level: 'error',
      code: 'minServers',
      params: { min: kind.min_servers },
    });
  }

  for (const role of kind.roles) {
    const count = nodes.filter((node) => node.role === role.name).length;
    const roleTitle = role.title || role.name;

    if (count < role.min) {
      issues.push({
        level: 'error',
        code: 'roleMin',
        params: { role: roleTitle, min: role.min },
      });
    }
    if (role.max > 0 && count > role.max) {
      issues.push({
        level: 'error',
        code: 'roleMax',
        params: { role: roleTitle, max: role.max },
      });
    }
    if (role.odd && count > 1 && count % 2 === 0) {
      issues.push({
        level: 'error',
        code: 'roleOdd',
        params: { role: roleTitle, count },
      });
    }
  }

  if (engine) {
    const unsupported = serversUnsupportedByEngine(
      engine,
      nodes.map((node) => node.server),
    );
    if (unsupported.length > 0) {
      issues.push({
        level: 'error',
        code: 'engineUnsupported',
        params: {
          engine: engine.title || engine.name,
          servers: unsupported.map((server) => server.hostname).join(', '),
        },
      });
    }
  }

  const unknownArch = nodes.filter((node) => node.server.arch === undefined);
  if (unknownArch.length > 0) {
    issues.push({
      level: 'warning',
      code: 'unknownArch',
      params: {
        servers: unknownArch.map((node) => node.server.hostname).join(', '),
      },
    });
  }

  const regions = new Set(
    nodes.map((node) => node.server.region).filter(Boolean),
  );
  if (regions.size > 1) {
    issues.push({
      level: 'warning',
      code: 'mixedRegions',
      params: { regions: [...regions].join(', ') },
    });
  }

  return issues;
}

export function hasBlockingIssue(issues: ClusterIssue[]) {
  return issues.some((issue) => issue.level === 'error');
}

/** Statuses that still change on their own, so the page polls them. */
export function isClusterTransitioning(status?: string) {
  return status === 'installing' || status === 'uninstalling';
}

/** Delete is allowed only before or after the engine is on the servers. */
export function canDeleteCluster(status?: string) {
  return (
    status === 'pending' || status === 'failed' || status === 'uninstalled'
  );
}

export function canUninstallCluster(status?: string) {
  return status === 'ready' || status === 'failed';
}

export type ClusterStatusTone =
  | 'success'
  | 'info'
  | 'warning'
  | 'danger'
  | 'neutral';

export function clusterStatusTone(status?: string): {
  tone: ClusterStatusTone;
  pulse: boolean;
} {
  switch (status) {
    case 'ready':
      return { tone: 'success', pulse: false };
    case 'installing':
    case 'uninstalling':
      return { tone: 'info', pulse: true };
    case 'failed':
      return { tone: 'danger', pulse: false };
    case 'pending':
      return { tone: 'warning', pulse: false };
    default:
      return { tone: 'neutral', pulse: false };
  }
}
