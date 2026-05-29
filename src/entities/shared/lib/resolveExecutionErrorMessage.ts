import type { DTOs } from '@/shared/api';

type ExecutionErrorDetailSource = {
  error?: string | null;
  error_detail?: DTOs.ExecutionErrorDetailV1 | null;
};

function firstNonEmpty(values: Array<string | null | undefined>) {
  return values.map((value) => value?.trim()).find(Boolean);
}

export function resolveExecutionErrorMessage(
  source: ExecutionErrorDetailSource,
) {
  const detail = source.error_detail;

  if (detail) {
    const structuredMessage = firstNonEmpty([
      detail.summary,
      detail.message,
      detail.detail,
    ]);

    if (structuredMessage) return structuredMessage;

    const taskLabel = firstNonEmpty([detail.task_path, detail.task]);
    if (taskLabel) {
      const hostLabel = firstNonEmpty([detail.host, detail.machine_id]);
      const exitLabel =
        detail.exit_code == null ? undefined : `Exit code ${detail.exit_code}`;

      return [taskLabel, hostLabel, exitLabel].filter(Boolean).join(' - ');
    }
  }

  return source.error?.trim() || undefined;
}
