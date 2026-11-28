import { parseEnvText } from '@/entities/application/lib/env-text';
import {
  keepReleasesOf,
  normalizeSharedPath,
  usesReleaseFolders,
} from '@/entities/application/lib/release-folders';
import type { ReleaseFoldersView } from '@/entities/application/lib/release-folders';

import type { DTOs } from '@/shared/api';

import { upsertEnvText } from './database-env';

/** Release step of the definition, as the wizard edits it. */
export interface ReleaseDraft {
  enabled: boolean;
  commands: string[];
  timeout: string;
}

/** Health check of the definition, as the wizard edits it. */
export interface HealthCheckDraft {
  path: string;
  expectedStatus: number;
  timeout: string;
  retries: number;
}

/**
 * The deployment steps around the build: release commands, post-deploy
 * commands, extra processes and the health check. Empty means "not set",
 * so an application without a preset deploys exactly as before.
 */
export interface LifecycleDraft {
  release: ReleaseDraft | null;
  postDeployCommands: string[];
  healthCheck: HealthCheckDraft | null;
  /** Processes the preset offers (worker, scheduler); off until enabled. */
  offeredProcesses: DTOs.AppDefinitionProcess[];
  enabledProcessNames: string[];
  /**
   * Release folders, when the preset suggests them. Null sends nothing,
   * so the app deploys in place like every app made before them.
   */
  releaseFolders: ReleaseFoldersView | null;
}

export const EMPTY_LIFECYCLE: LifecycleDraft = {
  release: null,
  postDeployCommands: [],
  healthCheck: null,
  offeredProcesses: [],
  enabledProcessNames: [],
  releaseFolders: null,
};

/** What the wizard keeps of a preset to explain it and pick modules. */
export interface PresetInfo {
  /** Repository and branch the preset was read for. */
  key: string;
  framework: string;
  facts: DTOs.ApplicationPresetFactsV1;
  hints: string[];
  modules: DTOs.ApplicationPresetModuleV1[];
  checks: DTOs.ApplicationPreflightCheckV1[];
}

/** The part of the form a preset fills in. */
export interface PresetPatch {
  appFramework: string;
  appProgLang: string;
  appProgLangVersion: string;
  appBuildCommand: string[];
  appRunCommand: string;
  runtimeEnvText: string;
  lifecycle: LifecycleDraft;
  laravelPreset: PresetInfo;
}

/**
 * The items of a list that may hold null entries (production data does),
 * and an empty list for a missing one.
 */
function compact<T>(
  list: ReadonlyArray<T | null | undefined> | null | undefined,
): T[] {
  return (list ?? []).filter((item): item is T => item != null);
}

export function presetKey(repository: string, branch: string) {
  return `${repository.trim()}@${branch.trim()}`;
}

function commandsOf(step: { command?: unknown; cmd?: unknown }): string[] {
  const value = step.command ?? step.cmd;
  if (Array.isArray(value)) {
    return value.map((item) => String(item ?? '').trim()).filter(Boolean);
  }
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

/** Every build command of the preset's steps, in order. */
export function buildCommandsFromDefinition(
  definition?: DTOs.AppDefinition | null,
): string[] {
  const steps = definition?.build?.target?.machine?.steps ?? [];
  return compact(steps).flatMap((step) => commandsOf(step));
}

function cleanCommands(commands?: string[] | null) {
  return (commands ?? []).map((command) => command.trim()).filter(Boolean);
}

/**
 * Adds each KEY=value whose key the text does not set yet. Keys already
 * there, typed by the user or by an earlier helper, keep their value.
 */
export function addMissingEnv(
  text: string,
  entries: Array<[string, string]>,
): string {
  const present = new Set(
    parseEnvText(text).variables.map((variable) => variable.key),
  );
  const missing = entries.filter(([key]) => key && !present.has(key));
  if (!missing.length) return text;
  return upsertEnvText(text, missing);
}

function healthCheckDraft(
  check?: DTOs.AppDefinitionHealthCheck | null,
): HealthCheckDraft | null {
  if (!check) return null;
  const path = (check.path as string | undefined)?.trim();
  if (!path) return null;
  return {
    path,
    expectedStatus: check.expected_status || 200,
    timeout: check.timeout || '5s',
    retries: check.retries || 10,
  };
}

/** The preset's release-folder settings; null when it suggests none. */
function releaseFoldersDraft(
  definition: DTOs.AppDefinition,
): ReleaseFoldersView | null {
  if (!usesReleaseFolders(definition)) return null;
  return {
    enabled: true,
    sharedPaths: compact(definition.shared_paths)
      .map((path) => normalizeSharedPath(String(path)))
      .filter(Boolean),
    keepReleases: keepReleasesOf(definition.keep_releases),
  };
}

/**
 * Turns a preset into the form values it suggests. Null when the
 * repository is not one dPanel has a preset for. Runtime variables the
 * user already typed are kept; everything else follows the preset, and
 * stays editable afterwards.
 */
export function presetFormPatch(
  preset: DTOs.ApplicationPresetV1 | null | undefined,
  current: { runtimeEnvText: string; key: string },
): PresetPatch | null {
  if (!preset?.detected || !preset.framework || !preset.definition) {
    return null;
  }
  const definition = preset.definition;
  const language = definition.setup?.language;
  const environment = compact(definition.run?.environment)
    .filter((item) => item.key)
    .map((item): [string, string] => [
      item.key,
      (item.value as string | undefined) ?? '',
    ]);
  const releaseCommands = cleanCommands(definition.release?.commands);

  return {
    appFramework: preset.framework,
    appProgLang: language?.name ? String(language.name) : '',
    appProgLangVersion:
      language?.version != null ? String(language.version) : '',
    appBuildCommand: buildCommandsFromDefinition(definition),
    appRunCommand: definition.run?.command?.trim() ?? '',
    runtimeEnvText: addMissingEnv(current.runtimeEnvText, environment),
    lifecycle: {
      release: definition.release
        ? {
            enabled: definition.release.enabled !== false,
            commands: releaseCommands,
            timeout: definition.release.timeout ?? '',
          }
        : null,
      postDeployCommands: cleanCommands(definition.post_deploy?.commands),
      healthCheck: healthCheckDraft(definition.health_check),
      offeredProcesses: compact(preset.processes).filter((process) =>
        Boolean(process.name && process.command),
      ),
      enabledProcessNames: [],
      releaseFolders: releaseFoldersDraft(definition),
    },
    laravelPreset: {
      key: current.key,
      framework: preset.framework,
      facts: preset.facts ?? {},
      hints: compact(preset.hints)
        .map((hint) => hint.code)
        .filter(Boolean),
      modules: compact(preset.modules).filter((module) => module.name),
      checks: compact(preset.checks),
    },
  };
}

/**
 * The release, post-deploy, processes, health check and release-folder
 * sections the wizard sends. A section left empty is left out, so the
 * definition deploys as one without it.
 */
export type LifecycleDefinition = Pick<
  DTOs.AppDefinition,
  | 'release'
  | 'post_deploy'
  | 'processes'
  | 'health_check'
  | 'deploy_strategy'
  | 'shared_paths'
  | 'keep_releases'
>;

export function lifecycleDefinition(
  lifecycle: LifecycleDraft,
): LifecycleDefinition {
  const result: LifecycleDefinition = {};
  const releaseCommands = cleanCommands(lifecycle.release?.commands);
  if (lifecycle.release && releaseCommands.length) {
    result.release = {
      enabled: lifecycle.release.enabled,
      commands: releaseCommands,
      ...(lifecycle.release.timeout.trim()
        ? { timeout: lifecycle.release.timeout.trim() }
        : {}),
    };
  }
  const postDeploy = cleanCommands(lifecycle.postDeployCommands);
  if (postDeploy.length) result.post_deploy = { commands: postDeploy };

  const enabled = new Set(lifecycle.enabledProcessNames);
  const processes = lifecycle.offeredProcesses.filter((process) =>
    enabled.has(process.name),
  );
  if (processes.length) result.processes = processes;

  const path = lifecycle.healthCheck?.path.trim();
  if (lifecycle.healthCheck && path) {
    result.health_check = {
      path,
      expected_status: lifecycle.healthCheck.expectedStatus,
      timeout: lifecycle.healthCheck.timeout,
      retries: lifecycle.healthCheck.retries,
    };
  }

  // Only when the preset suggested them and the user kept them on.
  if (lifecycle.releaseFolders?.enabled) {
    result.deploy_strategy = 'releases';
    result.shared_paths = lifecycle.releaseFolders.sharedPaths
      .map(normalizeSharedPath)
      .filter((item, index, list) => item && list.indexOf(item) === index);
    result.keep_releases = lifecycle.releaseFolders.keepReleases;
  }
  return result;
}

function versionParts(version: string) {
  return version.split('.').map((part) => Number.parseInt(part, 10) || 0);
}

function compareVersions(left: string, right: string) {
  const a = versionParts(left);
  const b = versionParts(right);
  for (let index = 0; index < Math.max(a.length, b.length); index += 1) {
    const diff = (a[index] ?? 0) - (b[index] ?? 0);
    if (diff !== 0) return diff;
  }
  return 0;
}

/**
 * The newest option of a major ("22" picks "22.23.5" over "22.1.0"), or
 * the wanted version itself when it already names one option exactly.
 * Empty when no option belongs to that major.
 */
export function pickVersionOption(wanted: string, options: string[]): string {
  const target = wanted.trim();
  if (!target) return '';
  if (options.includes(target)) return target;
  const matching = options.filter(
    (option) => option === target || option.startsWith(`${target}.`),
  );
  return [...matching].sort(compareVersions).at(-1) ?? '';
}

/** Whether a module's version fits the version a preset asks for. */
export function versionMatches(wanted: string | undefined, actual: string) {
  const target = (wanted ?? '').trim();
  if (!target) return true;
  return actual === target || actual.startsWith(`${target}.`);
}

/** Pre-flight results kept on the review step. */
export interface PreflightState {
  status: 'idle' | 'loading' | 'done' | 'failed';
  /** The definition the results are for, so stale ones are not trusted. */
  key: string;
  blocking: boolean;
  checks: DTOs.ApplicationPreflightCheckV1[];
}

export const IDLE_PREFLIGHT: PreflightState = {
  status: 'idle',
  key: '',
  blocking: false,
  checks: [],
};

/**
 * Whether the deploy button waits: a blocking result for the current
 * definition holds it until the user chooses to deploy anyway. A check
 * that could not run never blocks; the server checks again.
 */
export function isPreflightBlocking(
  preflight: PreflightState,
  override: boolean,
) {
  return preflight.status === 'done' && preflight.blocking && !override;
}

/** Errors first, then warnings, each as the server ordered them. */
export function sortPreflightChecks(
  checks: DTOs.ApplicationPreflightCheckV1[] | null | undefined,
) {
  const list = compact(checks).filter((check) => check.code);
  return [
    ...list.filter((check) => check.level === 'error'),
    ...list.filter((check) => check.level !== 'error'),
  ];
}

/** The module input that holds a runtime's version. */
export function versionInputName(moduleName: string) {
  return moduleName === 'go' ? 'golang_version' : `${moduleName}_version`;
}

/**
 * Install variables for a catalog module the preset asks for: every
 * input's default, with the version input set to the option that fits
 * the preset (newest of a major for Node.js, the branch for PHP). Null
 * when the catalog offers no option of that version, so nothing is
 * installed that the preset did not ask for.
 */
export function presetModuleVariables(
  module: DTOs.ApplicationPresetModuleV1,
  inputs: DTOs.ModuleInputV1[],
): Record<string, unknown> | null {
  const variables: Record<string, unknown> = {};
  for (const input of inputs) {
    if (input.default === undefined || input.default === null) continue;
    if (input.type === 'boolean') {
      variables[input.name] = Boolean(input.default);
      continue;
    }
    if (input.default === '' && input.type !== 'hidden') continue;
    variables[input.name] = input.default;
  }
  const wanted = module.version?.trim();
  if (!wanted) return variables;
  const versionInput = inputs.find(
    (input) => input.name === versionInputName(module.name),
  );
  if (!versionInput) return variables;
  const options = versionInput.options ?? [];
  const picked = options.length ? pickVersionOption(wanted, options) : wanted;
  if (!picked) return null;
  variables[versionInput.name] = picked;
  return variables;
}
