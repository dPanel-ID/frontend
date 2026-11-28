// @vitest-environment jsdom
import {
  cleanup,
  renderHook,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import { useDeployPreflightGuard } from './use-deploy-preflight-guard';

const { openDialog } = vi.hoisted(() => ({ openDialog: vi.fn() }));
vi.mock('@/services/dialog', () => ({ useDialog: () => [openDialog] }));
vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
}));

afterEach(() => {
  cleanup();
  openDialog.mockReset();
  vi.useRealTimers();
});

const refused = {
  $status: 'failed',
  error: new BaseResponseError({
    code: 422,
    status: 'failed',
    error:
      'pre-flight checks failed: PHP. Fix it, or deploy anyway with skip_preflight.',
    data: {
      blocking: true,
      checks: [{ code: 'php_version_unsupported', level: 'error' }],
    },
  }),
};

describe('useDeployPreflightGuard', () => {
  it('lets other answers through', () => {
    const { result } = renderHook(() => useDeployPreflightGuard());
    expect(result.current({ $status: 'success' }, vi.fn())).toBe(false);
    expect(openDialog).not.toHaveBeenCalled();
  });

  it('opens the dialog after the current one closes; Deploy anyway resends', async () => {
    vi.useFakeTimers();
    const deployAnyway = vi.fn();
    const { result } = renderHook(() => useDeployPreflightGuard());

    expect(result.current(refused, deployAnyway)).toBe(true);
    expect(openDialog).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(openDialog).toHaveBeenCalledTimes(1);

    const payload = openDialog.mock.calls[0]![0] as {
      actions: Array<{ label: string; onClick?: () => unknown }>;
    };
    expect(payload.actions.map((action) => action.label)).toEqual([
      'deployAnyway',
      'cancel',
    ]);
    // Cancel has no action: nothing is deployed.
    expect(payload.actions[1]!.onClick).toBeUndefined();
    await payload.actions[0]!.onClick?.();
    expect(deployAnyway).toHaveBeenCalledTimes(1);
  });
});
