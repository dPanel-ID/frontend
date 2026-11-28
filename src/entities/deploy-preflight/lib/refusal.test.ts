import { describe, expect, it } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import { getPreflightRefusal } from './refusal';

function failed(code: number, error: string, data?: unknown) {
  return {
    $status: 'failed',
    kind: 'api',
    error: new BaseResponseError({ code, status: 'failed', error, data }),
  };
}

describe('getPreflightRefusal', () => {
  it('reads the checks of a 422 pre-flight refusal, errors first', () => {
    const refusal = getPreflightRefusal(
      failed(
        422,
        'pre-flight checks failed: laravel/framework needs PHP ^8.4. Fix it, or deploy anyway with skip_preflight (dnocs: --skip-preflight).',
        {
          framework: 'laravel',
          blocking: true,
          checks: [
            { code: 'composer_lock_missing', level: 'warning', message: 'w' },
            {
              code: 'php_version_unsupported',
              level: 'error',
              message: 'e',
              params: { required: '^8.4', selected: 8.3 },
            },
            null,
          ],
        },
      ),
    );
    expect(refusal?.message).toMatch(/^pre-flight checks failed/);
    expect(refusal?.checks.map((check) => check.code)).toEqual([
      'php_version_unsupported',
      'composer_lock_missing',
    ]);
    expect(refusal?.checks[0]?.params).toEqual({
      required: '^8.4',
      selected: '8.3',
    });
  });

  it('keeps a refusal without checks, to show its message', () => {
    expect(
      getPreflightRefusal(failed(422, 'pre-flight checks failed: x', null))
        ?.checks,
    ).toEqual([]);
  });

  it('ignores every other answer', () => {
    expect(getPreflightRefusal({ $status: 'success' })).toBeNull();
    expect(getPreflightRefusal(failed(422, 'invalid definition'))).toBeNull();
    expect(
      getPreflightRefusal(failed(500, 'pre-flight checks failed: x')),
    ).toBeNull();
    expect(
      getPreflightRefusal({ $status: 'failed', error: new Error('network') }),
    ).toBeNull();
  });
});
