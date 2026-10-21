import { Link, createFileRoute } from '@tanstack/react-router';
import { BookOpenIcon, ServerIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { docsSections } from '../-lib/registry';
import { DocsFooter } from '../-view/-presentation/DocsFooter';
import { DocsNav } from '../-view/-presentation/DocsNav';

import { DocsIntroContent, introCopyFor  } from './-view/DocsIntroContent';

export const Route = createFileRoute('/docs/intro/')({
  ssr: true,
  head: () => ({
    meta: [
      {
        title: 'dPanel Documentation | Introduction',
      },
      {
        name: 'description',
        content:
          'dPanel launches a server at your cloud provider, or connects one you already run, then sets it up and deploys your application.',
      },
    ],
  }),
  component: DocsIntroPage,
});

function DocsIntroPage() {
  const locale = useDevetekLocale();
  const t = useDevetekTranslations('page.docs');
  const sections = docsSections(locale);
  const copy = introCopyFor(locale);
  const firstSection = sections[0];

  return (
    <>
      <a
        href="#docs-intro-content"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        Skip to content
      </a>

      <main
        id="docs-intro-content"
        tabIndex={-1}
        className="min-h-svh bg-background text-foreground"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <FlowHero
            accent="sky"
            icon={BookOpenIcon}
            headnote={
              <Breadcrumb
                items={[{ text: t('breadcrumb'), url: '/docs/intro' }]}
              />
            }
            badge={copy.hero.badge}
            title={copy.hero.title}
            description={copy.hero.subtitle}
            aside={
              <Link to="/" className={flowCtaClassName('sky')}>
                <ServerIcon className="size-4" />
                {copy.hero.primaryCta}
              </Link>
            }
          />

          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            {/*
              The same index the rest of the documentation carries, so the
              introduction is a way in to the guides rather than a dead end.
            */}
            <aside className="hidden w-64 shrink-0 rounded-2xl border bg-card p-3 lg:block">
              <DocsNav sections={sections} activeSection="" activePage="" />
            </aside>

            <div className="flex min-w-0 flex-1 flex-col gap-4">
              <DocsIntroContent
                locale={locale}
                readMoreHref={
                  firstSection
                    ? `/docs/${firstSection.slug}/${firstSection.pages[0]?.slug ?? ''}`
                    : undefined
                }
                readMoreLabel={firstSection?.pages[0]?.title}
              />

              <div className="rounded-2xl border bg-card p-4 lg:hidden">
                <DocsNav sections={sections} activeSection="" activePage="" />
              </div>
            </div>
          </div>

          <DocsFooter />
        </div>
      </main>
    </>
  );
}
