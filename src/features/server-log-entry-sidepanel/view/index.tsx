import { useState } from 'react';
import type { ReactNode } from 'react';

import {
  BracesIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  TagIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import Layout from '@/services/sidepanel/ui/presentation/Layout/General';

import {
  LogLevelBadge,
  formatJson,
} from '@/features/server-log-viewer-sidepanel/view';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import type { ServerLogEntrySidepanelProps as Props } from '../rules/types';

/** One log line in full: message, structured payload, context and raw text. */
export default function ServerLogEntrySidepanel(props: Props) {
  const { entry, filePath } = props;
  const t = useDevetekTranslations('sidepanel.logEntry');
  const [copied, setCopied] = useState(false);

  const context = [entry.jsonPrefix, entry.jsonSuffix]
    .filter(Boolean)
    .join(' ');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(entry.raw);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be refused; the raw line stays selectable below.
    }
  };

  return (
    <Layout classNameFrame="w-[calc(100svw_-_16px)] max-w-[620px]">
      <Layout.Title
        title={t('title')}
        subtitle={[t('line', { number: entry.lineNumber }), filePath]
          .filter(Boolean)
          .join(' · ')}
        hasCloseButton
      />

      <Layout.Content className="pb-4">
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
            <Block
              title={t('payload')}
              icon={<BracesIcon className="size-4" />}
            >
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
      </Layout.Content>

      <Layout.Cta className="gap-y-2">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={handleCopy}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          {copied ? t('copied') : t('copy')}
        </Button>
      </Layout.Cta>
    </Layout>
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
