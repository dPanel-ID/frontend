import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, ArrowRightIcon, BookOpenIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { DocsMarkdown } from '../-presentation/DocsMarkdown';
import { DocsNav } from '../-presentation/DocsNav';
import { DocsToc } from '../-presentation/DocsToc';
import { DocsTopBar } from '../-presentation/DocsTopBar';
import { pageHeadings } from '../../-lib/headings';
import type { DocsPageLocation } from '../../-lib/registry';
import { docsImageUrl, docsLinkTarget } from '../../-lib/registry';
import type { DocsSection } from '../../-rules/content';

interface DocsPageViewProps {
  sections: DocsSection[];
  location: DocsPageLocation;
}

/**
 * One documentation page: the index on the left on wide screens, the page
 * itself in the middle, and the way onwards at the bottom.
 *
 * It fills the window like every other page of the app. Prose keeps its own
 * reading measure inside the article, and screenshots show at their captured
 * density, so a wide window adds room rather than stretching either. The
 * index stays in view while the article scrolls.
 */
export function DocsPageView(props: DocsPageViewProps) {
  const { location, sections } = props;
  const { group, next, page, previous, section } = location;
  const t = useDevetekTranslations('page.docs');
  const headings = pageHeadings(page.markdown);

  return (
    // pb-24 lets the page scroll clear of the floating "Ask dPanel" button.
    <div className="flex w-full flex-col gap-4 p-3 pb-24 sm:p-4 sm:pb-24 lg:p-6 lg:pb-24">
      <DocsTopBar />
      <FlowHero
        accent="sky"
        icon={BookOpenIcon}
        headnote={
          <Breadcrumb
            items={[
              { text: t('breadcrumb'), url: '/docs/intro' },
              {
                text: section.title,
                url: `/docs/${section.slug}/${section.pages[0]?.slug ?? ''}`,
              },
              ...(group
                ? [
                    {
                      text: group.title,
                      url: `/docs/${section.slug}/${group.page?.slug ?? group.pages[0]?.slug ?? ''}`,
                    },
                  ]
                : []),
            ]}
          />
        }
        title={page.title}
        description={page.summary}
        aside={
          section.app && (
            // A path from the section's _category_.json, not a typed route.
            <a href={section.app.href} className={flowCtaClassName('sky')}>
              {section.app.label}
              <ArrowRightIcon className="size-4" aria-hidden />
            </a>
          )
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="hidden w-72 shrink-0 rounded-2xl border bg-card p-3 lg:sticky lg:top-4 lg:block lg:max-h-[calc(100svh-2rem)] lg:overflow-y-auto">
          <DocsNav
            sections={sections}
            activeSection={section.slug}
            activePage={page.slug}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <article className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6">
            <DocsMarkdown
              markdown={page.markdown}
              resolveLink={(href) => docsLinkTarget(href, page.file)}
              resolveImage={(src) => docsImageUrl(src, page.file)}
            />
          </article>

          {(previous ?? next) && (
            <nav
              aria-label={t('pagerLabel')}
              className="grid gap-3 sm:grid-cols-2"
            >
              {previous ? (
                <DocsPagerLink
                  sectionSlug={section.slug}
                  slug={previous.slug}
                  label={t('previous')}
                  title={previous.title}
                  direction="previous"
                />
              ) : (
                <span />
              )}
              {next && (
                <DocsPagerLink
                  sectionSlug={section.slug}
                  slug={next.slug}
                  label={t('next')}
                  title={next.title}
                  direction="next"
                />
              )}
            </nav>
          )}

          <div className="rounded-2xl border bg-card p-4 lg:hidden">
            <DocsNav
              sections={sections}
              activeSection={section.slug}
              activePage={page.slug}
            />
          </div>
        </div>

        {headings.length > 1 && (
          <aside className="hidden w-60 shrink-0 xl:sticky xl:top-4 xl:block xl:max-h-[calc(100svh-2rem)] xl:overflow-y-auto">
            <DocsToc headings={headings} />
          </aside>
        )}
      </div>
    </div>
  );
}

interface DocsPagerLinkProps {
  sectionSlug: string;
  slug: string;
  label: string;
  title: string;
  direction: 'previous' | 'next';
}

function DocsPagerLink(props: DocsPagerLinkProps) {
  const { direction, label, sectionSlug, slug, title } = props;
  const isNext = direction === 'next';

  return (
    <Link
      to="/docs/$section/$page"
      params={{ section: sectionSlug, page: slug }}
      className={cn(
        'group flex flex-col gap-1 rounded-xl border bg-card p-4 transition-all',
        'hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        isNext && 'sm:text-right',
      )}
    >
      <span
        className={cn(
          'flex items-center gap-1.5 text-xs text-muted-foreground',
          isNext && 'sm:justify-end',
        )}
      >
        {!isNext && <ArrowLeftIcon className="size-3.5" aria-hidden />}
        {label}
        {isNext && <ArrowRightIcon className="size-3.5" aria-hidden />}
      </span>
      <span className="text-sm font-semibold text-primary">{title}</span>
    </Link>
  );
}
