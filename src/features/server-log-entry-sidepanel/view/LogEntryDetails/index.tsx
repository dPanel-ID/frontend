import type { ReactNode } from 'react';

import { BracesIcon, ClockIcon, TagIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  LogLevelBadge,
  formatJson,
} from '@/features/server-log-viewer-sidepanel/view';
import type { ParsedLogLine } from '@/features/server-log-viewer-sidepanel/view';

/**
 * One log line in full: level, time and source, the message, any structured
 * payload pretty-printed, the text around it and the raw line. Shown in the
 * entry side panel, and inline under a row where a side panel cannot open.
 */
export default function LogEntryDetails(props: { entry: ParsedLogLine }) {
  const { entry } = props;
  const t = useDevetekTranslations('sidepanel.logEntry');

  const context = [entry.jsonPrefix, entry.jsonSuffix]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <LogLevelBadge level={entry.level} />
        <span className="inline-flex items-center gap-1 font-mono">
          <ClockIcon className="size-3.5" />
          {entry.timestamp ?? '-'}
        </span>
        <span className="inline-flex items-center gap-1">
          <TagIcon className="size-3.5" />
          {entry.sourceLabel}
        </span>
        {entry.jsonLabel && (
          <span className="rounded border bg-background px-1.5 py-0.5 font-semibold">
            {entry.jsonLabel}
          </span>
        )}
      </div>

      <Block title={t('message')}>
        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-primary">
          {entry.message || entry.raw}
        </pre>
      </Block>

      {entry.jsonPayload !== undefined && (
        <Block title={t('payload')} icon={<BracesIcon className="size-4" />}>
          <pre className="max-h-96 overflow-auto whitespace-pre-wrap break-words font-mono text-xs leading-5 text-primary">
            {formatJson(entry.jsonPayload)}
          </pre>
        </Block>
      )}

      {context && (
        <Block title={t('context')}>
          <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-muted-foreground">
            {context}
          </pre>
        </Block>
      )}

      <Block title={t('raw')}>
        <pre className="max-h-60 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-5 text-muted-foreground">
          {entry.raw}
        </pre>
      </Block>
    </div>
  );
}

function Block(props: {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
}) {
  const { children, icon, title } = props;

  return (
    <section className="rounded-xl border bg-card">
      <h4 className="flex items-center gap-2 border-b px-3 py-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {icon}
        {title}
      </h4>
      <div className="p-3">{children}</div>
    </section>
  );
}
