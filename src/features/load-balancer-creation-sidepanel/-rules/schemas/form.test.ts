import { describe, expect, it } from 'vitest';

import { schemaCreationForm } from './form';

function formWithAppRule(rule: Record<string, unknown>) {
  return {
    domain: 'example.com',
    description: '',
    serverId: '1',
    lbKind: 'l7',
    engine: 'caddy',
    features: { sslEnabled: true, protocol: 'http' },
    l7rules: [
      {
        pathMatch: '/*',
        type: 'proxy-pass-app',
        applicationIdIfProxyPassApp: '24',
        ...rule,
      },
    ],
  };
}

function issuePaths(values: unknown) {
  const result = schemaCreationForm.safeParse(values);
  return result.success
    ? []
    : result.error.issues.map((issue) => issue.path.join('.'));
}

describe('schemaCreationForm custom application targets', () => {
  it.each(['registered', 'private'])(
    'ignores blank custom rows left behind in %s mode',
    (mode) => {
      expect(
        issuePaths(
          formWithAppRule({
            addressModeIfProxyPassApp: mode,
            customTargetsIfProxyPassApp: [{ address: '', port: undefined }],
          }),
        ),
      ).toEqual([]);
    },
  );

  it('requires an address on each row in custom mode', () => {
    expect(
      issuePaths(
        formWithAppRule({
          addressModeIfProxyPassApp: 'custom',
          customTargetsIfProxyPassApp: [
            { address: '10.0.0.5' },
            { address: '  ', port: 70_000 },
          ],
        }),
      ),
    ).toEqual([
      'l7rules.0.customTargetsIfProxyPassApp.1.address',
      'l7rules.0.customTargetsIfProxyPassApp.1.port',
    ]);
  });

  it('accepts filled custom targets', () => {
    expect(
      issuePaths(
        formWithAppRule({
          addressModeIfProxyPassApp: 'custom',
          customTargetsIfProxyPassApp: [
            { address: '10.0.0.5', port: 8080 },
            { address: '10.0.0.6' },
          ],
        }),
      ),
    ).toEqual([]);
  });
});
