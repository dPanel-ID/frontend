import { describe, expect, it, vi } from 'vitest';

import { submitMachineSelection } from './submit-selection';

describe('submitMachineSelection', () => {
  it('waits for async member mutations before allowing the picker to close', async () => {
    const onMachinesSelected = vi.fn().mockResolvedValue(undefined);

    await expect(
      submitMachineSelection({
        machineIds: [1, 2],
        onMachinesSelected,
      }),
    ).resolves.toEqual({
      error: null,
      shouldClose: true,
    });

    expect(onMachinesSelected).toHaveBeenCalledWith([1, 2]);
  });

  it('returns the mutation error so the active picker surface can stay open and retry', async () => {
    const onMachinesSelected = vi
      .fn()
      .mockRejectedValue(new Error('Unable to update members right now'));

    await expect(
      submitMachineSelection({
        machineIds: [1],
        onMachinesSelected,
      }),
    ).resolves.toEqual({
      error: 'Unable to update members right now',
      shouldClose: false,
    });
  });
});
