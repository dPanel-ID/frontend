import { Link } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  BookOpenIcon,
  ServerIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { DocsBlockView } from '../-presentation/DocsBlocks';
import { DocsFooter } from '../-presentation/DocsFooter';
import { DocsNav } from '../-presentation/DocsNav';
import type { DocsPageLocation } from '../../-lib/registry';
import type { DocsSection } from '../../-rules/content';

interface DocsPageViewProps {
  sections: DocsSection[];
  location: DocsPageLocation;
}

/**
 * One documentation page: the index on the left on wide screens, the page
 * itself in the middle, and the way onwards at the bottom.
 *
 * The whole thing is held to a fixed width rather than filling the display.
 * The screenshots in these pages are 800px wide, so a content column any
 * wider than that upscales them into a blur; the measure a reader wants for
 * long-form prose happens to be about the same width, so one cap serves both.
 */
export function DocsPageView(props: DocsPageViewProps) {
  const { location, sections } = props;
  const { next, page, previous, section } = location;
  const t = useDevetekTranslations('page.docs');

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-6 sm:px-6 lg:px-8">
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
            ]}
          />
        }
        title={page.title}
        description={page.summary}
        aside={
          <Link to="/servers" className={flowCtaClassName('sky')}>
            <ServerIcon className="size-4" />
            {t('goToServers')}
          </Link>
        }
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <aside className="hidden w-64 shrink-0 rounded-2xl border bg-card p-3 lg:block">
          <DocsNav
            sections={sections}
            activeSection={section.slug}
            activePage={page.slug}
          />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <article className="flex flex-col gap-4 rounded-2xl border bg-card p-5 sm:p-6">
            {page.blocks.map((block, index) => (
              <DocsBlockView key={`${block.kind}-${index}`} block={block} />
            ))}
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
      </div>

      <DocsFooter />
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
