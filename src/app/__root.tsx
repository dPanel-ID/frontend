import { useEffect } from 'react';

import { TanStackDevtools } from '@tanstack/react-devtools';
import {
  ClientOnly,
  HeadContent,
  Outlet,
  Scripts,
  createRootRoute,
  useRouter,
} from '@tanstack/react-router';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';
import { createServerFn } from '@tanstack/react-start';
import { getRequestHeaders } from '@tanstack/react-start/server';

import { AuthModelProvider } from '@/services/auth/model';
import { DialogController } from '@/services/dialog';
import { DevetekIntlProvider } from '@/services/i18n';
import { getLocale, loadMessages } from '@/services/i18n/usecase';
import { ModalController } from '@/services/modal';
import { SidepanelController } from '@/services/sidepanel';
import { ThemeScript } from '@/services/theme/lib/themeScript';
import { DevetekThemeModel } from '@/services/theme/model';
import { ToasterController } from '@/services/toaster';

import { AssistantLauncher } from '@/features/ai-assistant';

import { googleAnalyticsScripts } from '@/shared/libs/analytics/google-analytics';
import { EventsProvider } from '@/shared/libs/events';
import { SITE, siteUrl } from '@/shared/libs/seo';

import appCss from '../styles.css?url';

import NotFoundView from './-view/NotFound';

const isStaticBuild =
  import.meta.env.VITE_STATIC_PRERENDER === 'true' ||
  import.meta.env.VITE_STATIC_SPA === 'true';
const staticRequestHeaders = {
  userAgent: 'StaticPrerender',
};

const getHeaders = createServerFn().handler(() => {
  const headers = getRequestHeaders();

  return {
    userAgent: headers.get('User-Agent'),
  };
});

export const Route = createRootRoute({
  ssr: true,
  notFoundComponent: NotFoundView,
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      // Defaults for every page; public pages override them with `seoHead`,
      // and the signed-in app with `noIndexHead`.
      { title: SITE.name },
      { name: 'description', content: SITE.description },
      { name: 'application-name', content: SITE.name },
      { name: 'apple-mobile-web-app-title', content: SITE.shortName },
      { name: 'theme-color', content: SITE.themeColor },
      { property: 'og:site_name', content: SITE.name },
      { property: 'og:image', content: siteUrl(SITE.image) },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      { rel: 'icon', href: '/favicon.ico', sizes: '48x48' },
      { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      { rel: 'manifest', href: '/manifest.json' },
    ],
    scripts: googleAnalyticsScripts(),
  }),
  shellComponent: ShellComponent,
  loader: async () => {
    const locale = await getLocale();
    const messages = await loadMessages(locale);
    const requestHeaders = isStaticBuild
      ? staticRequestHeaders
      : await getHeaders();

    return {
      locale,
      messages,
      requestHeaders,
    };
  },
  component: RootComponent,
});

function RootComponent() {
  const { locale, messages } = Route.useLoaderData();
  useSavedLocale(locale);

  return (
    <EventsProvider>
      <DevetekIntlProvider
        locale={locale}
        messages={messages}
        timeZone={isStaticBuild ? 'UTC' : undefined}
      >
        <DevetekThemeModel>
          <AuthModelProvider>
            <ClientOnly>
              <SidepanelController />
              <ModalController />
              <DialogController />
              <ToasterController />
              <AssistantLauncher />
            </ClientOnly>

            <Outlet />
          </AuthModelProvider>
        </DevetekThemeModel>
      </DevetekIntlProvider>
    </EventsProvider>
  );
}

/**
 * A static build prerenders every page in the default language, so a page
 * opened or refreshed starts in English whatever the reader picked. Once it
 * is running, reload the root data when the saved language differs, so the
 * choice in the locale cookie survives a refresh. A server-rendered page
 * reads the cookie itself and needs none of this.
 */
function useSavedLocale(locale: string) {
  const router = useRouter();

  useEffect(() => {
    if (!isStaticBuild) return;

    void getLocale().then((saved) => {
      if (saved !== locale) void router.invalidate();
    });
  }, [locale, router]);
}

function ShellComponent({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <ThemeScript />
      </head>
      <body>
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
