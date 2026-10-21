import { CircleAlertIcon, InfoIcon, TriangleAlertIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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

import type { DocsBlock, DocsCalloutTone } from '../../../-rules/content';

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

/** One documentation block, rendered with the house blocks and type scale. */
export function DocsBlockView(props: { block: DocsBlock }) {
  const { block } = props;

  switch (block.kind) {
    case 'heading':
      // A heading needs to outrank the text under it, and to sit closer to
      // what it introduces than to what it follows.
      return (
        <h2 className="mt-6 text-xl font-semibold tracking-tight text-primary first:mt-0">
          {block.text}
        </h2>
      );

    case 'paragraph':
      return (
        <p
          className={cn(MEASURE, 'text-[0.9375rem] leading-7 text-primary/90')}
        >
          {block.text}
        </p>
      );

    case 'list':
      return (
        <ul className={cn(MEASURE, 'flex flex-col gap-2.5')}>
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[0.9375rem] leading-7 text-primary/90"
            >
              <span
                aria-hidden
                className="mt-3 size-1.5 shrink-0 rounded-full bg-sky-500"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );

    case 'steps':
      return (
        <ol className={cn(MEASURE, 'flex flex-col gap-3')}>
          {block.items.map((item, index) => (
            <li
              key={item}
              className="flex gap-3 text-[0.9375rem] leading-7 text-primary/90"
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold tabular-nums',
                  FLOW_ACCENTS.sky.icon,
                )}
              >
                {index + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      );

    case 'table':
      return (
        <div className="overflow-hidden rounded-xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                {block.head.map((cell, index) => (
                  <TableHead key={`${cell}-${index}`}>{cell}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {block.rows.map((row) => (
                <TableRow key={row.join('|')}>
                  {row.map((cell, index) => (
                    <TableCell
                      key={`${cell}-${index}`}
                      className={cn(
                        'align-top text-sm leading-6',
                        index === 0
                          ? 'font-semibold text-primary'
                          : 'text-primary/75',
                      )}
                    >
                      {cell}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case 'image':
      return (
        <figure className="flex flex-col gap-3">
          <img
            src={block.src}
            alt={block.alt}
            loading="lazy"
            width={800}
            height={500}
            className="w-full rounded-xl border bg-card"
          />
          {block.caption && (
            <figcaption className="text-sm leading-6 text-muted-foreground">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case 'code':
      return (
        <pre className="overflow-x-auto rounded-xl border bg-background/60 p-4 font-mono text-xs leading-relaxed text-primary/80">
          {block.code}
        </pre>
      );

    case 'callout': {
      const tone = CALLOUT[block.tone];
      const Icon = tone.icon;

      return (
        <aside className={cn('flex gap-3 rounded-xl border p-4', tone.frame)}>
          <Icon
            className={cn('mt-0.5 size-4 shrink-0', tone.title)}
            aria-hidden
          />
          <div className="flex flex-col gap-1">
            <p className={cn('text-sm font-bold', tone.title)}>{block.title}</p>
            <p className="text-sm leading-6 text-primary/85">{block.text}</p>
          </div>
        </aside>
      );
    }
  }
}
