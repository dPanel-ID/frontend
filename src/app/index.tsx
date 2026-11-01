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
      description: SITE.description,
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
