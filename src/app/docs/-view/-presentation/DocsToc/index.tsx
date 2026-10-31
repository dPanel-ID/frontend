import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import type { DocsHeadingEntry } from '../../../-lib/headings';
import { headingId } from '../DocsMarkdown';

interface DocsTocProps {
  headings: DocsHeadingEntry[];
}

/**
 * The page's own outline, beside the article on a wide window. Prose keeps
 * its reading measure, so this is what the extra width is for: a reader can
 * see the shape of a long guide and jump to the part they came for.
 */
export function DocsToc(props: DocsTocProps) {
  const { headings } = props;
  const t = useDevetekTranslations('page.docs');

  return (
    <nav aria-label={t('onThisPage')} className="flex flex-col gap-2">
      <p className="px-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {t('onThisPage')}
      </p>
      <ul className="flex flex-col gap-0.5 border-l border-border/70">
        {headings.map((heading, index) => (
          <li key={`${index}-${heading.text}`}>
            <a
              href={`#${headingId(heading.text)}`}
              className={cn(
                '-ml-px block border-l border-transparent py-1 pr-2 text-sm leading-snug text-primary/70 transition-colors',
                'hover:border-sky-500 hover:text-primary',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                heading.level === 2 ? 'pl-3' : 'pl-6 text-xs',
              )}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
