import { describe, expect, it } from 'vitest';

import en from '@/services/i18n/config/dict-en.json';
import id from '@/services/i18n/config/dict-id.json';

import { KNOWN_PREFLIGHT_CHECKS } from './PreflightCheckList';

type Checks = Record<string, string>;

const checksOf = (dict: unknown): Checks =>
  (dict as { dialog: { deployPreflight: { checks: Checks } } }).dialog
    .deployPreflight.checks;

describe('KNOWN_PREFLIGHT_CHECKS', () => {
  it.each([
    ['en', checksOf(en)],
    ['id', checksOf(id)],
  ])('has %s text for every known check', (_lang, checks) => {
    for (const code of KNOWN_PREFLIGHT_CHECKS) {
      expect(checks[code], code).toBeTruthy();
    }
  });

  it('describes the FrankenPHP and Octane checks with their params', () => {
    const checks = checksOf(en);
    expect(checks.frankenphp_php_mismatch).toContain('{served}');
    expect(checks.frankenphp_php_mismatch).toContain('{selected}');
    expect(checks.frankenphp_php_unsupported).toContain('{required}');
    expect(checks.frankenphp_extension_missing).toContain('{extension}');
    expect(checks.octane_listens_everywhere).toContain('{caddyfile}');
    expect(checks.octane_admin_port_unavailable).toContain('{port}');
  });
});
