function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

export function containsRedactedModuleValue(value: unknown): boolean {
  if (value === '[redacted]') {
    return true;
  }

  if (Array.isArray(value)) {
    return value.some((item) => containsRedactedModuleValue(item));
  }

  if (isRecord(value)) {
    return Object.values(value).some((item) => containsRedactedModuleValue(item));
  }

  return false;
}

export function isPinnedModuleRef(value: unknown) {
  if (!isRecord(value)) {
    return false;
  }

  const expectedCommit =
    typeof value.expected_commit === 'string'
      ? value.expected_commit.trim()
      : '';
  if (expectedCommit) {
    return true;
  }

  return (
    typeof value.type === 'string' &&
    value.type.trim().toLowerCase() === 'commit' &&
    typeof value.name === 'string' &&
    value.name.trim().length > 0
  );
}

export function buildModuleRetryRequirements(request: Record<string, unknown>) {
  const variables = isRecord(request.variables) ? request.variables : undefined;
  const ref = isRecord(request.ref) ? request.ref : undefined;

  return {
    defaultRefText: ref ? JSON.stringify(ref, null, 2) : '',
    defaultVariablesText: variables ? JSON.stringify(variables, null, 2) : '',
    requiresPinnedRef: !isPinnedModuleRef(ref),
    requiresVariablesResubmission: containsRedactedModuleValue(variables),
  } as const;
}
