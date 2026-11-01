import { createFileRoute } from '@tanstack/react-router';

import {
  SITE,
  organizationJsonLd,
  seoHead,
  softwareApplicationJsonLd,
  websiteJsonLd,
} from '@/shared/libs/seo';

import { ModelProvider } from './-models';
import LandingView from './-view';

export const Route = createFileRoute('/')({
  ssr: true,
  head: () =>
    seoHead({
      title: `${SITE.name} | Server, deployment and DNS control panel`,
      exactTitle: true,
      // Search results show about 160 characters; the full description is
      // in the structured data below.
      description:
        'dPanel - dNocs is a control panel to launch servers on any cloud, deploy apps from GitHub, and manage domains, HTTPS load balancers and logs.',
      path: '/',
      jsonLd: [
        organizationJsonLd(),
        websiteJsonLd(),
        softwareApplicationJsonLd(),
      ],
    }),
  component: Landing,
});

function Landing() {
  return (
    <ModelProvider>
      <LandingView />
    </ModelProvider>
  );
}
