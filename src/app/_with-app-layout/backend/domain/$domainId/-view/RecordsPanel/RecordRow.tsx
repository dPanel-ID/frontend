import { CopyIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DnsRecord } from '@/entities/domain/rules/schema/parts';

import { humanizeSeconds } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { TableCell, TableRow } from '@/shared/presentation/atoms/Table';
import { dataTable } from '@/shared/presentation/organisms/DataPanel';

import type { RecordTypeTone } from '../../-lib/records';
import {
  highlightParts,
  isAutoTtl,
  recordTypeTone,
  splitRecordName,
} from '../../-lib/records';

const TYPE_TONES: Record<RecordTypeTone, string> = {
  sky: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  violet:
    'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  amber:
    'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  emerald:
    'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  neutral: 'border-border bg-background text-primary/75',
};

interface RecordRowProps {
  record: DnsRecord;
  /** The domain, which every name ends in; shown muted. */
  zone: string;
  /** The search, highlighted wherever it matches. */
  query: string;
  onDelete: (record: DnsRecord) => void;
}

export function RecordRow(props: RecordRowProps) {
  const { onDelete, query, record, zone } = props;
  const t = useDevetekTranslations('page.domainDetail.records');
  const [openToaster] = useToaster();
  const name = splitRecordName(record.name, zone);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      openToaster({ variant: 'success', message: t('copied', { value }) });
    } catch {
      // Clipboard access can be refused; the text is still selectable.
    }
  };

  return (
    <TableRow>
      <TableCell className={dataTable.cell}>
        <span
          className={cn(
            'inline-flex min-w-12 justify-center rounded-md border px-1.5 py-0.5 font-mono text-[11px] font-bold',
            TYPE_TONES[recordTypeTone(record.type)],
          )}
        >
          {record.type}
        </span>
      </TableCell>

      <TableCell
        className={cn(dataTable.cell, 'min-w-56 max-w-80 whitespace-normal')}
      >
        <span className="flex items-start gap-1">
          <span
            className="min-w-0 break-all font-mono text-[13px]"
            title={record.name}
          >
            {name.host ? (
              <span className="font-semibold text-primary">
                <Highlight text={name.host} query={query} />
              </span>
            ) : (
              <span className="mr-1 rounded border px-1 font-sans text-[10px] font-semibold uppercase text-muted-foreground">
                {t('apex')}
              </span>
            )}
            {name.zone && (
              <span className="text-muted-foreground">
                {name.host ? '.' : ''}
                <Highlight text={name.zone} query={query} />
              </span>
            )}
          </span>
          <CopyButton title={t('copyName')} onClick={() => copy(record.name)} />
        </span>
        {record.comment && (
          <span className="mt-0.5 block truncate text-xs text-muted-foreground">
            {record.comment}
          </span>
        )}
      </TableCell>

      <TableCell
        className={cn(
          dataTable.monoCell,
          'min-w-48 max-w-96 whitespace-normal',
        )}
      >
        <span className="flex items-start gap-1">
          <span
            className="line-clamp-2 min-w-0 break-all text-primary/85"
            title={record.content}
          >
            <Highlight text={record.content} query={query} />
          </span>
          <CopyButton
            title={t('copyContent')}
            onClick={() => copy(record.content)}
          />
        </span>
      </TableCell>

      <TableCell className={dataTable.mutedCell}>
        {isAutoTtl(record.ttl) ? t('ttlAuto') : humanizeSeconds(record.ttl)}
      </TableCell>

      <TableCell className={cn(dataTable.cell, 'text-right')}>
        <button
          type="button"
          aria-label={t('delete')}
          title={t('delete')}
          onClick={() => onDelete(record)}
          className="inline-flex size-8 items-center justify-center rounded-lg border bg-background/50 text-red-500/80 transition-colors hover:border-red-400/40 hover:bg-red-500/10 hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
        >
          <Trash2Icon className="size-4" />
        </button>
      </TableCell>
    </TableRow>
  );
}

/** `text` with every match of `query` marked. */
function Highlight(props: { text: string; query: string }) {
  const { query, text } = props;

  return highlightParts(text, query).map((part, index) =>
    part.match ? (
      <mark
        key={index}
        className="rounded-sm bg-amber-300/60 px-0.5 text-inherit dark:bg-amber-400/30"
      >
        {part.text}
      </mark>
    ) : (
      <span key={index}>{part.text}</span>
    ),
  );
}

/** A quiet copy button beside a value; always visible, so touch works. */
function CopyButton(props: { title: string; onClick: () => void }) {
  const { onClick, title } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className="mt-px inline-flex size-5 shrink-0 items-center justify-center rounded text-muted-foreground/60 transition-colors hover:bg-border/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50"
    >
      <CopyIcon className="size-3.5" />
    </button>
  );
}
