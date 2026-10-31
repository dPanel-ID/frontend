import { Children, isValidElement } from 'react';
import type { ComponentProps, ReactElement, ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import { CircleAlertIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import type { DocsLinkTarget } from '../../../-lib/links';
import { rehypeSteps } from '../../../-lib/rehype-steps';
import { remarkAdmonitions } from '../../../-lib/remark-admonitions';
import type { DocsAdmonition, DocsCalloutTone } from '../../../-rules/content';
import { isDocsAdmonition } from '../../../-rules/content';

/** Callout tones reuse the product's meaning for each colour. */
const CALLOUT: Record<
  DocsCalloutTone,
  { icon: LucideIcon; frame: string; title: string }
> = {
  info: {
    icon: InfoIcon,
    frame: 'border-sky-400/30 bg-sky-500/10',
    title: 'text-sky-700 dark:text-sky-200',
  },
  warning: {
    icon: TriangleAlertIcon,
    frame: 'border-amber-400/30 bg-amber-500/10',
    title: 'text-amber-700 dark:text-amber-200',
  },
  danger: {
    icon: CircleAlertIcon,
    frame: 'border-red-400/30 bg-red-500/10',
    title: 'text-red-700 dark:text-red-200',
  },
};

/**
 * Prose is held to a comfortable measure. Long-form text is tiring to read
 * much past the high sixties of characters per line, and the content column
 * is far wider than that on a desktop. Tables, images and code keep the full
 * width, since they are scanned rather than read line by line.
 */
const MEASURE = 'max-w-[68ch]';

const PROSE = 'text-[0.9375rem] leading-7 text-primary/90';

const LINK =
  'font-medium text-sky-700 underline decoration-sky-500/40 underline-offset-2 transition-colors hover:decoration-sky-500 dark:text-sky-300';

export interface DocsMarkdownProps {
  markdown: string;
  /** Where a link in this page goes. */
  resolveLink: (href: string) => DocsLinkTarget;
  /** The served URL of an image in this page. */
  resolveImage: (src: string) => string | undefined;
}

/**
 * A documentation page body, written in Markdown and drawn with the house
 * blocks and type scale: the same headings, measure, steps, tables, callouts
 * and code panels the guides have always used.
 */
export function DocsMarkdown(props: DocsMarkdownProps) {
  const { markdown, resolveImage, resolveLink } = props;
  const t = useDevetekTranslations('page.docs');

  const components: Components = {
    h1: (heading) => <DocsHeading level={2} {...heading} />,
    h2: (heading) => <DocsHeading level={2} {...heading} />,
    h3: (heading) => <DocsHeading level={3} {...heading} />,
    h4: (heading) => <DocsHeading level={3} {...heading} />,

    p: ({ children, node }) => {
      // An image on a line of its own becomes a figure, which a paragraph
      // cannot hold.
      const onlyImages = node?.children.every(
        (child) =>
          (child.type === 'element' && child.tagName === 'img') ||
          (child.type === 'text' && !child.value.trim()),
      );
      if (onlyImages) return <>{children}</>;

      return <p className={cn(MEASURE, PROSE)}>{children}</p>;
    },

    ul: ({ children }) => (
      <ul className={cn(MEASURE, 'flex flex-col gap-2.5')}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={cn(MEASURE, 'flex flex-col gap-3')}>{children}</ol>
    ),
    li: ({ children, node }) => {
      const step = node?.properties.dataStep;

      if (typeof step === 'number') {
        return (
          <li className={cn('flex gap-3', PROSE)}>
            <span
              aria-hidden
              className={cn(
                'flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold tabular-nums',
                FLOW_ACCENTS.sky.icon,
              )}
            >
              {step}
            </span>
            <div className="min-w-0 flex-1 [&>*+*]:mt-2 [&>p]:max-w-none">
              {children}
            </div>
          </li>
        );
      }

      return (
        <li className={cn('flex gap-3', PROSE)}>
          <span
            aria-hidden
            className="mt-3 size-1.5 shrink-0 rounded-full bg-sky-500"
          />
          <div className="min-w-0 flex-1 [&>*+*]:mt-2 [&>p]:max-w-none">
            {children}
          </div>
        </li>
      );
    },

    strong: ({ children }) => (
      <strong className="font-semibold text-primary">{children}</strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
    code: ({ children }) => (
      <code className="rounded-md border bg-background/60 px-1.5 py-0.5 font-mono text-[0.8125em] text-primary">
        {children}
      </code>
    ),
    pre: ({ children }) => <DocsCodeBlock>{children}</DocsCodeBlock>,
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          MEASURE,
          'flex flex-col gap-2 border-l-2 border-sky-500/40 pl-4 text-primary/80',
        )}
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr className="border-border" />,

    a: ({ children, href = '' }) => (
      <DocsLink target={resolveLink(href)}>{children}</DocsLink>
    ),

    img: ({ alt = '', src = '', title }) => {
      const url = typeof src === 'string' ? resolveImage(src) : undefined;

      return (
        <figure className="flex flex-col gap-3">
          {/*
           * Screenshots are captured at twice their display size, so the 2x
           * descriptor halves their intrinsic width: a narrow panel shows at
           * its real size, sharp on a retina display, instead of stretched
           * across the column. Tall panels are capped so one image never
           * fills more than a screen.
           */}
          <img
            src={url}
            srcSet={url ? `${url} 2x` : undefined}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-auto max-h-[720px] w-auto max-w-full self-start rounded-xl border bg-card"
          />
          {title && (
            <figcaption className="text-sm leading-6 text-muted-foreground">
              {title}
            </figcaption>
          )}
        </figure>
      );
    },

    table: ({ children }) => (
      <div className="overflow-hidden rounded-xl border bg-card">
        <Table>{children}</Table>
      </div>
    ),
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => <TableHead>{children}</TableHead>,
    td: ({ children }) => (
      <TableCell className="min-w-32 whitespace-normal align-top text-sm leading-6 text-primary/75 first:font-semibold first:text-primary">
        {children}
      </TableCell>
    ),

    aside: ({ children, node }) => {
      const tone = node?.properties.dataCallout;
      const kind = String(node?.properties.dataKind ?? 'note');
      const title = String(node?.properties.dataTitle ?? '');
      if (tone !== 'info' && tone !== 'warning' && tone !== 'danger') {
        return <aside>{children}</aside>;
      }

      const style = CALLOUT[tone];
      const Icon = style.icon;
      const admonition: DocsAdmonition = isDocsAdmonition(kind) ? kind : 'note';

      return (
        <aside
          data-callout={tone}
          className={cn('flex gap-3 rounded-xl border p-4', style.frame)}
        >
          <Icon
            className={cn('mt-0.5 size-4 shrink-0', style.title)}
            aria-hidden
          />
          <div className="flex min-w-0 flex-col gap-1 text-sm leading-6 text-primary/85 [&_p]:max-w-none [&_p]:text-sm [&_p]:leading-6">
            <p className={cn('text-sm font-bold', style.title)}>
              {title || t(`callout.${admonition}`)}
            </p>
            {children}
          </div>
        </aside>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDirective, remarkAdmonitions]}
      rehypePlugins={[rehypeSteps]}
      components={components}
    >
      {markdown}
    </ReactMarkdown>
  );
}

/** A heading carries an id so `page.md#heading` links can land on it. */
function DocsHeading(
  props: ComponentProps<'h2'> & { level: 2 | 3; node?: unknown },
) {
  const { children, level } = props;
  const id = headingId(textOf(children));

  if (level === 3) {
    return (
      <h3
        id={id}
        className="mt-2 scroll-mt-6 text-base font-semibold tracking-tight text-primary first:mt-0"
      >
        {children}
      </h3>
    );
  }

  // A heading needs to outrank the text under it, and to sit closer to what
  // it introduces than to what it follows.
  return (
    <h2
      id={id}
      className="mt-6 scroll-mt-6 text-xl font-semibold tracking-tight text-primary first:mt-0"
    >
      {children}
    </h2>
  );
}

function DocsCodeBlock(props: { children?: ReactNode }) {
  const code = Children.toArray(props.children).find(isValidElement) as
    | ReactElement<{ className?: string; children?: ReactNode }>
    | undefined;
  const language = /language-([\w-]+)/.exec(code?.props.className ?? '')?.[1];

  return (
    <div className="overflow-hidden rounded-xl border bg-background/60">
      {language && (
        <div className="border-b px-4 py-1.5 font-mono text-[0.6875rem] uppercase tracking-wide text-muted-foreground">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-primary/80">
        <code>{code?.props.children ?? props.children}</code>
      </pre>
    </div>
  );
}

function DocsLink(props: { target: DocsLinkTarget; children?: ReactNode }) {
  const { children, target } = props;

  switch (target.kind) {
    case 'page':
      return (
        <Link
          to="/docs/$section/$page"
          params={{ section: target.section, page: target.page }}
          hash={target.hash}
          className={LINK}
        >
          {children}
        </Link>
      );
    case 'anchor':
      return (
        <a href={`#${target.hash}`} className={LINK}>
          {children}
        </a>
      );
    case 'app':
      return (
        <a href={target.href} className={LINK}>
          {children}
        </a>
      );
    case 'external':
      return (
        <a
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className={LINK}
        >
          {children}
        </a>
      );
    case 'broken':
      return <span>{children}</span>;
  }
}

/** The text inside a heading, for its id. */
function textOf(node: ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') return `${node}`;
  if (Array.isArray(node)) return node.map(textOf).join('');
  if (isValidElement<{ children?: ReactNode }>(node)) {
    return textOf(node.props.children);
  }

  return '';
}

/** `What happens next?` becomes `what-happens-next`. */
export function headingId(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/[\s-]+/g, '-');
}
