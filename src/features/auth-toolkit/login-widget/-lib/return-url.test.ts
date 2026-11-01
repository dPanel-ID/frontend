import { describe, expect, it } from 'vitest';

import { safeReturnUrl } from './return-url';

const frontend = 'https://dnocs.devetek.app';

describe('safeReturnUrl', () => {
  it('accepts dPanel services on the same domain', () => {
    expect(
      safeReturnUrl(
        'https://dbmanager.devetek.app/?server=138&service=x',
        frontend,
      ),
    ).toBe('https://dbmanager.devetek.app/?server=138&service=x');
    expect(safeReturnUrl('https://dnocs.devetek.app/servers', frontend)).toBe(
      'https://dnocs.devetek.app/servers',
    );
    expect(safeReturnUrl('https://devetek.app/', frontend)).toBe(
      'https://devetek.app/',
    );
  });

  it('refuses other sites and look-alike domains', () => {
    expect(safeReturnUrl('https://evil.example/', frontend)).toBeNull();
    expect(
      safeReturnUrl('https://devetek.app.evil.example/', frontend),
    ).toBeNull();
    expect(safeReturnUrl('https://evildevetek.app/', frontend)).toBeNull();
    expect(safeReturnUrl('//evil.example/', frontend)).toBeNull();
    expect(safeReturnUrl('/dashboard', frontend)).toBeNull();
  });

  it('refuses unsafe schemes and credentials', () => {
    expect(safeReturnUrl('javascript:alert(1)', frontend)).toBeNull();
    expect(safeReturnUrl('http://dbmanager.devetek.app/', frontend)).toBeNull();
    expect(
      safeReturnUrl('https://user:pass@dbmanager.devetek.app/', frontend),
    ).toBeNull();
  });

  it('handles missing input', () => {
    expect(safeReturnUrl(null, frontend)).toBeNull();
    expect(safeReturnUrl('  ', frontend)).toBeNull();
    expect(
      safeReturnUrl('https://dbmanager.devetek.app/', undefined),
    ).toBeNull();
  });

  it('allows local development hosts only from a local frontend', () => {
    expect(
      safeReturnUrl('http://localhost:8081/', 'http://localhost:3000'),
    ).toBe('http://localhost:8081/');
    expect(safeReturnUrl('http://localhost:8081/', frontend)).toBeNull();
  });
});
