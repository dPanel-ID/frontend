import { describe, expect, it } from 'vitest';

import { GA_MEASUREMENT_ID, googleAnalyticsScripts } from './google-analytics';

describe('googleAnalyticsScripts', () => {
  it('loads gtag.js and configures the property in production', () => {
    const [loader, setup] = googleAnalyticsScripts('production');

    expect(loader).toEqual({
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
      async: true,
    });
    expect(setup?.children).toContain(
      `gtag('config', '${GA_MEASUREMENT_ID}');`,
    );
  });

  it.each(['development', 'beta', undefined])(
    'adds nothing in %s',
    (environment) => {
      expect(googleAnalyticsScripts(environment)).toEqual([]);
    },
  );
});
