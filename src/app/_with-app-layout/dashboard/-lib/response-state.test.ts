import { describe, expect, it } from 'vitest';

import type { Response } from '@/shared/libs/api-client/rules/types';

import { isUnauthorizedResponse, responseStatusCode } from './response-state';

function failedWith(error: unknown): Response<unknown> {
  return {
    $status: 'failed',
    kind: 'api',
    error,
  } as Response<unknown>;
}

describe('responseStatusCode', () => {
  it.each([['initial' as const], ['loading' as const], ['success' as const]])(
    'has no status for a %s response',
    (status) => {
      expect(
        responseStatusCode({ $status: status }),
      ).toBeUndefined();
    },
  );

  it('reads the backend code off a normalised API error', () => {
    expect(responseStatusCode(failedWith({ code: 403 }))).toBe(403);
  });

  it('reads the transport status off an axios response', () => {
    expect(responseStatusCode(failedWith({ response: { status: 401 } }))).toBe(
      401,
    );
  });

  it('falls back to the error status when there is no response', () => {
    expect(responseStatusCode(failedWith({ status: 500 }))).toBe(500);
  });

  it.each([
    [new Error('boom')],
    [{ code: 0 }],
    [{ code: 'ERR_NETWORK' }],
    [undefined],
    [null],
  ])('has no status for %s', (error) => {
    expect(responseStatusCode(failedWith(error))).toBeUndefined();
  });
});

describe('isUnauthorizedResponse', () => {
  it.each([401, 403])('treats %i as a refusal', (code) => {
    expect(isUnauthorizedResponse(failedWith({ code }))).toBe(true);
  });

  it.each([500, 502, 404])('treats %i as an ordinary failure', (code) => {
    expect(isUnauthorizedResponse(failedWith({ code }))).toBe(false);
  });

  it('treats a transport error as an ordinary failure', () => {
    expect(isUnauthorizedResponse(failedWith(new Error('offline')))).toBe(
      false,
    );
  });
});
