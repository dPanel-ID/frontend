import { AxiosError, AxiosHeaders } from 'axios';
import { describe, expect, it } from 'vitest';

import { BaseResponseError } from '@/shared/libs/api-client/lib/error';

import { classifyUnlinkFailure, toSignInMethodViews } from './sign-in-methods';

describe('toSignInMethodViews', () => {
  it('lists password, Google and GitHub with their actions', () => {
    const views = toSignInMethodViews([
      {
        provider: 'github',
        linked: true,
        username: 'octocat',
        can_unlink: true,
      },
      { provider: 'password', linked: true },
      { provider: 'google', linked: false, can_unlink: false },
    ]);

    expect(views).toEqual([
      {
        provider: 'password',
        linked: true,
        username: undefined,
        action: 'none',
        isOnlyMethod: false,
      },
      {
        provider: 'google',
        linked: false,
        username: undefined,
        action: 'none',
        isOnlyMethod: false,
      },
      {
        provider: 'github',
        linked: true,
        username: 'octocat',
        action: 'unlink',
        isOnlyMethod: false,
      },
    ]);
  });

  it('offers Link for GitHub when it is not linked', () => {
    const [, , github] = toSignInMethodViews([
      { provider: 'password', linked: true },
      { provider: 'github', linked: false, can_unlink: false },
    ]);
    expect(github).toMatchObject({ linked: false, action: 'link' });
  });

  it('offers Link for Google only once a link flow exists for it', () => {
    const methods = [{ provider: 'google', linked: false }];
    expect(toSignInMethodViews(methods)[1]?.action).toBe('none');
    expect(
      toSignInMethodViews(methods, new Set(['google', 'github']))[1]?.action,
    ).toBe('link');
  });

  it('never offers Unlink when the API says it would lock the person out', () => {
    const views = toSignInMethodViews([
      { provider: 'password', linked: false },
      { provider: 'google', linked: true, can_unlink: false },
      { provider: 'github', linked: false, can_unlink: false },
    ]);
    expect(views[1]).toMatchObject({
      linked: true,
      action: 'none',
      isOnlyMethod: true,
    });
  });

  it('never links or unlinks the password', () => {
    const [password] = toSignInMethodViews([
      { provider: 'password', linked: true, can_unlink: true },
    ]);
    expect(password?.action).toBe('none');
  });

  it('strips a leading @ and ignores a blank username', () => {
    expect(
      toSignInMethodViews([
        { provider: 'github', linked: true, username: '@octocat' },
      ])[2]?.username,
    ).toBe('octocat');
    expect(
      toSignInMethodViews([
        { provider: 'github', linked: true, username: ' ' },
      ])[2]?.username,
    ).toBeUndefined();
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['an object', { provider: 'github' }],
    ['an empty list', []],
  ])('shows every method as not linked for %s', (_label, methods) => {
    const views = toSignInMethodViews(methods);
    expect(views.map((v) => v.provider)).toEqual([
      'password',
      'google',
      'github',
    ]);
    expect(views.every((v) => !v.linked && !v.isOnlyMethod)).toBe(true);
  });

  it('tolerates odd fields, unknown providers and duplicates', () => {
    const views = toSignInMethodViews([
      null,
      'github',
      { provider: 'gitlab', linked: true },
      { provider: 'GitHub', linked: 'yes', can_unlink: 1, username: 42 },
      { provider: 'github', linked: true, can_unlink: true },
    ]);
    expect(views[2]).toMatchObject({
      linked: false,
      username: undefined,
      action: 'link',
    });
  });
});

describe('classifyUnlinkFailure', () => {
  it('reads a 409 envelope as the last sign-in method', () => {
    const error = new BaseResponseError({
      code: 409,
      status: 'failed',
      error: 'conflict',
    });
    expect(classifyUnlinkFailure(error)).toBe('lastMethod');
  });

  it('reads a 409 HTTP response as the last sign-in method', () => {
    const error = new AxiosError('conflict', '409', undefined, undefined, {
      status: 409,
      statusText: 'Conflict',
      headers: {},
      config: { headers: new AxiosHeaders() },
      data: null,
    });
    expect(classifyUnlinkFailure(error)).toBe('lastMethod');
  });

  it.each([
    new BaseResponseError({ code: 500, status: 'failed', error: 'boom' }),
    new Error('network'),
    undefined,
  ])('reads %s as a generic failure', (error) => {
    expect(classifyUnlinkFailure(error)).toBe('other');
  });
});
