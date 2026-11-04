// @vitest-environment jsdom

import type { InternalAxiosRequestConfig } from 'axios';
import { afterEach, describe, expect, test } from 'vitest';

import {
  LS_ORGANIZATION_ID,
  X_AUTH_ORGANIZATION_ID,
  workspaceHeaders,
} from '../config';

import { axiosClient } from './client';

/** Sends nothing; answers with the headers the request would have carried. */
async function sentWorkspace(headers?: Record<string, string>) {
  const response = await axiosClient.get('/probe', {
    headers,
    adapter: (config: InternalAxiosRequestConfig) =>
      Promise.resolve({
        data: { workspace: config.headers.get(X_AUTH_ORGANIZATION_ID) ?? null },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }),
  });
  return (response.data as { workspace: string | null }).workspace;
}

describe('workspace header', () => {
  afterEach(() => {
    window.localStorage.clear();
  });

  test('defaults to the workspace selected in the app shell', async () => {
    window.localStorage.setItem(LS_ORGANIZATION_ID, '5209311491061018854');
    expect(await sentWorkspace()).toBe('5209311491061018854');
  });

  test('is absent when nothing is selected', async () => {
    expect(await sentWorkspace()).toBeNull();
  });

  test('keeps a workspace the request names', async () => {
    window.localStorage.setItem(LS_ORGANIZATION_ID, '5209311491061018854');
    expect(await sentWorkspace(workspaceHeaders('2430473335433071236'))).toBe(
      '2430473335433071236',
    );
    expect(await sentWorkspace(workspaceHeaders('personal'))).toBe('personal');
  });
});

describe('workspaceHeaders', () => {
  test.each([
    ['5209311491061018854', '5209311491061018854'],
    ['org-5209311491061018854', '5209311491061018854'],
    ['personal', 'personal'],
    ['', 'personal'],
  ])('%o -> %s', (input, expected) => {
    expect(workspaceHeaders(input)).toEqual({
      [X_AUTH_ORGANIZATION_ID]: expected,
    });
  });
});
