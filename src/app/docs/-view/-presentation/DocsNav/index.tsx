import { useId, useState } from 'react';

import { Link } from '@tanstack/react-router';
import { ChevronRightIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import type {
  DocsColor,
  DocsGroup,
  DocsPage,
  DocsSection,
} from '../../../-rules/content';
import { DOCS_COLOR_CLASSES, DocsIcon } from '../DocsIcon';

interface DocsNavProps {
  sections: DocsSection[];
  activeSection: string;
  activePage: string;
}

/**
 * The documentation index. It is the same list on every page, so a reader
 * always sees where they are and what else there is.
 *
 * Each section has its own colour and every page its own icon, so the list
 * can be scanned by shape and colour before it is read. Groups fold away,
 * and open on their own when the page being read is inside them.
 */
export function DocsNav(props: DocsNavProps) {
  const { activePage, activeSection, sections } = props;
  const t = useDevetekTranslations('page.docs');

  return (
    <nav aria-label={t('navLabel')} className="flex flex-col gap-5">
      {sections.map((section) => {
        const isCurrentSection = section.slug === activeSection;

        return (
          <div key={section.slug} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 px-2">
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg ring-1',
                  DOCS_COLOR_CLASSES[section.color].tile,
                )}
              >
                <DocsIcon
                  icon={section.icon}
                  color={section.color}
                  className="text-current dark:text-current"
                />
              </span>
              <p className="text-sm font-semibold text-primary">
                {section.title}
              </p>
            </div>

            <ul className="ml-[1.375rem] flex flex-col gap-0.5 border-l border-border/70 pl-2">
              {section.nav.map((item) =>
                item.kind === 'page' ? (
                  <li key={item.page.slug}>
                    <DocsNavLink
                      section={section.slug}
                      page={item.page}
                      color={section.color}
                      isActive={
                        isCurrentSection && item.page.slug === activePage
                      }
                    />
                  </li>
                ) : (
                  <li key={item.group.slug}>
                    <DocsNavGroup
                      section={section.slug}
                      group={item.group}
                      color={section.color}
                      activePage={isCurrentSection ? activePage : undefined}
                    />
                  </li>
                ),
              )}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}

interface DocsNavLinkProps {
  section: string;
  page: DocsPage;
  color: DocsColor;
  isActive: boolean;
  className?: string;
}

function DocsNavLink(props: DocsNavLinkProps) {
  const { className, color, isActive, page, section } = props;

  return (
    <Link
      to="/docs/$section/$page"
      params={{ section, page: page.slug }}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
        isActive
          ? cn('font-semibold ring-1', DOCS_COLOR_CLASSES[color].active)
          : // The sidebar is already bg-card, so a card hover is invisible;
            // the page background is what reads here.
            'text-primary/75 hover:bg-background hover:text-primary',
        className,
      )}
    >
      <DocsIcon icon={page.icon} color={color} />
      <span className="min-w-0 leading-snug">{page.label}</span>
    </Link>
  );
}

interface DocsNavGroupProps {
  section: string;
  group: DocsGroup;
  color: DocsColor;
  activePage?: string;
}

function DocsNavGroup(props: DocsNavGroupProps) {
  const { activePage, color, group, section } = props;
  const t = useDevetekTranslations('page.docs');

  const containsActive =
    activePage !== undefined &&
    (group.page?.slug === activePage ||
      group.pages.some((page) => page.slug === activePage));
  // Undefined until the reader toggles it: until then, follow the page.
  const [userOpen, setUserOpen] = useState<boolean>();
  const isOpen = userOpen ?? containsActive;
  // The index renders twice (rail and phone), so ids must be unique per copy.
  const listId = useId();

  const groupPage: DocsPage = group.page ?? {
    ...(group.pages[0] as DocsPage),
    label: group.title,
    icon: group.icon,
  };

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-0.5">
        <DocsNavLink
          section={section}
          page={{ ...groupPage, label: group.title }}
          color={color}
          isActive={group.page?.slug === activePage}
          className="min-w-0 flex-1"
        />
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={listId}
          aria-label={t(isOpen ? 'collapseGroup' : 'expandGroup', {
            name: group.title,
          })}
          onClick={() => setUserOpen(!isOpen)}
          className="flex size-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <ChevronRightIcon
            aria-hidden
            className={cn('size-4 transition-transform', isOpen && 'rotate-90')}
          />
        </button>
      </div>

      {isOpen && (
        <ul
          id={listId}
          className="ml-[1.125rem] flex flex-col gap-0.5 border-l border-border/70 pl-2"
        >
          {group.pages.map((page) => (
            <li key={page.slug}>
              <DocsNavLink
                section={section}
                page={page}
                color={color}
                isActive={page.slug === activePage}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
