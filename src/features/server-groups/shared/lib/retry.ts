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
  const requiresVariablesResubmission = containsRedactedModuleValue(variables);
  const requiresPinnedRef = !isPinnedModuleRef(ref);

  return {
    defaultRefText:
      ref && !requiresPinnedRef ? JSON.stringify(ref, null, 2) : '',
    defaultVariablesText:
      variables && !requiresVariablesResubmission
        ? JSON.stringify(variables, null, 2)
        : '',
    requiresPinnedRef,
    requiresVariablesResubmission,
  } as const;
}

export function parseModuleRetryPayload(
  request: Record<string, unknown>,
  retryVariablesText: string,
  retryRefText: string,
) {
  const requirements = buildModuleRetryRequirements(request);
  let variables: Record<string, unknown> | undefined;
  let ref:
    | {
        type?: string;
        name?: string;
        expected_commit?: string;
      }
    | undefined;

  if (requirements.requiresVariablesResubmission && !retryVariablesText.trim()) {
    throw new Error(
      'Resubmit the full variable set before retrying a redacted module operation.',
    );
  }

  if (requirements.requiresPinnedRef && !retryRefText.trim()) {
    throw new Error(
      'Provide an explicit pinned ref before retrying an unpinned module operation.',
    );
  }

  if (retryVariablesText.trim()) {
    const parsed = JSON.parse(retryVariablesText) as unknown;
    if (!isRecord(parsed)) {
      throw new Error('Variables JSON must be an object.');
    }
    if (containsRedactedModuleValue(parsed)) {
      throw new Error(
        'Resubmit the full variable set before retrying a redacted module operation.',
      );
    }
    variables = parsed;
  }

  if (retryRefText.trim()) {
    const parsed = JSON.parse(retryRefText) as unknown;
    if (!isRecord(parsed)) {
      throw new Error('Ref JSON must be an object.');
    }
    if (!isPinnedModuleRef(parsed)) {
      throw new Error(
        'Provide an explicit pinned ref before retrying an unpinned module operation.',
      );
    }
    ref = parsed;
  }

  return {
    ref,
    variables,
  } as const;
}
