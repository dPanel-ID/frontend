export interface SubmitMachineSelectionParams {
  machineIds: number[];
  onMachinesSelected?: (machineIDs: number[]) => void | Promise<void>;
}

export async function submitMachineSelection(
  params: SubmitMachineSelectionParams,
) {
  const { machineIds, onMachinesSelected } = params;

  try {
    await onMachinesSelected?.(machineIds);

    return {
      error: null,
      shouldClose: true,
    } as const;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unable to submit selection.';

    return {
      error: message,
      shouldClose: false,
    } as const;
  }
}
