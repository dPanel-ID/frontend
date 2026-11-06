/** The Google Analytics 4 property for dnocs.devetek.app. */
export const GA_MEASUREMENT_ID = 'G-ER43ZRM38V';

/**
 * The Google tag (gtag.js), as head scripts for the root route.
 *
 * Only the production build loads it, so local development and preview
 * builds do not count as visits. Page views after the first come from GA4's
 * enhanced measurement, which follows the router's history changes.
 */
export function googleAnalyticsScripts(
  environment: string | undefined = import.meta.env.VITE_ENVIRONMENT,
) {
  if (environment !== 'production') return [];

  return [
    {
      src: `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`,
      async: true,
    },
    {
      children: [
        'window.dataLayer = window.dataLayer || [];',
        'function gtag(){dataLayer.push(arguments);}',
        "gtag('js', new Date());",
        `gtag('config', '${GA_MEASUREMENT_ID}');`,
      ].join('\n'),
    },
  ];
}
