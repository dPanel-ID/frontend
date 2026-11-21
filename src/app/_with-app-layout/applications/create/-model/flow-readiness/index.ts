import { isValidApplicationName } from '../../../-rules/application-name';
import { containerRuntime } from '../container-runtime';
import { useFormStore } from '../store/form';
import type { DependencyConfig, FlowMode, Progress } from '../store/form.types';

/** The sections of the flow, in the order they are shown. */
export const FLOW_STEP_KEYS = [
  '1-source',
  '2-server-dependencies',
  '3-details',
  '4-env',
  '5-preview',
] as const satisfies readonly Progress[];

export type FlowStepKey = (typeof FLOW_STEP_KEYS)[number];

/** Everything the readiness rules look at, and nothing else. */
export interface FlowReadinessInput {
  flowMode: FlowMode;
  appSourceMode: string;
  appSourceBundleIdent: string | null;
  appSourceGithubRepo: string | null;
  gitRepoConfig: Record<string, string> | null;
  hostedServerID: number | null;
  appName: string;
  appPort: string;
  portConflict: boolean;
  appBuildCommand: string[];
  appRunCommand: string;
  selectedDependencyIds: string[];
  dependencyConfigs: Record<string, DependencyConfig>;
  selectedRequiredBinaryIds: string[];
  requiredBinaryConfigs: Record<string, unknown>;
}

function isLanguageDependency(config?: DependencyConfig) {
  return config?.category?.some((category) => category === 'language') === true;
}

/**
 * Whether each section has what it needs.
 *
 * The flow used to hide every section but one and gate a Continue button on
 * the same rules. Showing all the sections at once means these answers are
 * no longer a gate — they are what the review panel reports, and what marks
 * a section done. The rules themselves are unchanged, so a flow that could
 * be submitted before can still be submitted now.
 */
export function evaluateFlowReadiness(
  input: FlowReadinessInput,
): Record<FlowStepKey, boolean> {
  const {
    appBuildCommand,
    appName,
    appPort,
    appRunCommand,
    appSourceBundleIdent,
    appSourceGithubRepo,
    appSourceMode,
    dependencyConfigs,
    gitRepoConfig,
    hostedServerID,
    portConflict,
    requiredBinaryConfigs,
    selectedDependencyIds,
    selectedRequiredBinaryIds,
  } = input;

  const selectedDependencyBinaryIds = selectedDependencyIds
    .filter((id) => isLanguageDependency(dependencyConfigs[id]))
    .map((id) => `binary:${dependencyConfigs[id]?.selectionId || id}`);

  // An application that only runs containers (Docker selected, no language
  // module) has Docker as its runtime and no binary to pick.
  const runsOnlyContainers =
    selectedDependencyBinaryIds.length === 0 &&
    containerRuntime(selectedDependencyIds, dependencyConfigs) !== undefined;

  const runtimeReady =
    runsOnlyContainers ||
    (selectedRequiredBinaryIds.length > 0 &&
      selectedRequiredBinaryIds.every(
        (id) =>
          Boolean(requiredBinaryConfigs[id]) &&
          selectedDependencyBinaryIds.includes(id),
      ));

  const source = Boolean(
    (appSourceMode === 'bundle' && appSourceBundleIdent) ||
    (appSourceMode === 'github' &&
      appSourceGithubRepo &&
      gitRepoConfig?.gitBranch &&
      gitRepoConfig.gitHead),
  );

  const serverAndDependencies = Boolean(
    hostedServerID &&
    selectedDependencyIds.length > 0 &&
    selectedDependencyIds.every((id) => Boolean(dependencyConfigs[id])),
  );

  const details = Boolean(
    // The API refuses the whole payload for a name it does not accept.
    isValidApplicationName(appName) &&
    runtimeReady &&
    appBuildCommand.some((command) => command.trim()) &&
    appRunCommand &&
    appPort &&
    // A port already taken on the server would fail at install time.
    !portConflict,
  );

  return {
    '1-source': source,
    '2-server-dependencies': serverAndDependencies,
    '3-details': details,
    // Environment variables are optional, and the preview only reports.
    '4-env': true,
    '5-preview': true,
  };
}

/** The sections this flow shows; update starts from the server section. */
export function flowStepKeys(flowMode: FlowMode): FlowStepKey[] {
  if (flowMode === 'update') return [...FLOW_STEP_KEYS].slice(1);
  return [...FLOW_STEP_KEYS];
}

export interface FlowReadiness {
  byStep: Record<FlowStepKey, boolean>;
  steps: FlowStepKey[];
  /** The first section still missing something, for the accent glow. */
  firstIncomplete?: FlowStepKey;
  /** True once every shown section is satisfied. */
  ready: boolean;
}

export function useFlowReadiness(): FlowReadiness {
  const [
    flowMode,
    appSourceMode,
    appSourceBundleIdent,
    appSourceGithubRepo,
    gitRepoConfig,
    hostedServerID,
    appName,
    appPort,
    portConflict,
    appBuildCommand,
    appRunCommand,
    selectedDependencyIds,
    dependencyConfigs,
    selectedRequiredBinaryIds,
    requiredBinaryConfigs,
  ] = useFormStore((s) => [
    s.flowMode,
    s.appSourceMode,
    s.appSourceBundleIdent,
    s.appSourceGithubRepo,
    s.gitRepoConfig,
    s.hostedServerID,
    s.appName,
    s.appPort,
    s.portConflict,
    s.appBuildCommand,
    s.appRunCommand,
    s.selectedDependencyIds,
    s.dependencyConfigs,
    s.selectedRequiredBinaryIds,
    s.requiredBinaryConfigs,
  ]);

  const byStep = evaluateFlowReadiness({
    flowMode,
    appSourceMode,
    appSourceBundleIdent,
    appSourceGithubRepo,
    gitRepoConfig,
    hostedServerID,
    appName,
    appPort,
    portConflict,
    appBuildCommand,
    appRunCommand,
    selectedDependencyIds,
    dependencyConfigs,
    selectedRequiredBinaryIds,
    requiredBinaryConfigs,
  });

  const steps = flowStepKeys(flowMode);

  return {
    byStep,
    steps,
    firstIncomplete: steps.find((key) => !byStep[key]),
    ready: steps.every((key) => byStep[key]),
  };
}
