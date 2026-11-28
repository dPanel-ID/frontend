import { describe, expect, it } from 'vitest';

import {
  getHttpSettingsDraft,
  serializeRuntimeConfigDraft,
  toHttpSettingsPayload,
} from './runtime-config';

describe('gateway limits (config.http)', () => {
  it('reads stored settings and keeps empty fields empty', () => {
    expect(
      getHttpSettingsDraft({ request_body_max: '100MB', health_path: '/up' }),
    ).toEqual({
      requestBodyMax: '100MB',
      readBodyTimeout: '',
      responseTimeout: '',
      healthPath: '/up',
      healthInterval: '',
      healthTimeout: '',
    });
    expect(getHttpSettingsDraft(undefined).responseTimeout).toBe('');
  });

  it('sends only the fields with a value, trimmed', () => {
    const draft = getHttpSettingsDraft(undefined);
    expect(toHttpSettingsPayload(draft)).toEqual({});
    expect(
      toHttpSettingsPayload({
        ...draft,
        responseTimeout: ' 300s ',
        healthPath: '/up',
      }),
    ).toEqual({ response_timeout: '300s', health_path: '/up' });
  });

  it('treats whitespace-only edits as unchanged', () => {
    const base = {
      cloudflareProxied: false,
      http: getHttpSettingsDraft({ response_timeout: '300s' }),
      protocol: 'https',
      sslEnabled: true,
    };
    expect(
      serializeRuntimeConfigDraft({
        ...base,
        http: { ...base.http, responseTimeout: '300s ', healthPath: ' ' },
      }),
    ).toBe(serializeRuntimeConfigDraft(base));
  });
});
