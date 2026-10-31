import {
  CheckIcon,
  CircleAlertIcon,
  RotateCcwIcon,
  ShieldQuestionIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/presentation/atoms/Table';

import { toolLabel } from '../../../lib/tool-label';
import type { ChatAction, ChatEntry } from '../../../rules/types';

interface Props {
  entry: ChatEntry;
  onRetry?: (entry: ChatEntry) => void;
  retryDisabled?: boolean;
  onDecide?: (action: ChatAction, approve: boolean) => void;
  decideDisabled?: boolean;
}

/** Markdown elements mapped onto the product's primitives. Raw HTML is never rendered. */
const MARKDOWN: Components = {
  p: ({ children }) => (
    <p className="leading-relaxed [&:not(:first-child)]:mt-2">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mt-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-2 list-decimal space-y-1 pl-5">{children}</ol>
  ),
  code: ({ children }) => (
    <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="mt-2 overflow-x-auto rounded-lg bg-black/5 p-2 text-xs dark:bg-white/10">
      {children}
    </pre>
  ),
  a: ({ children, href }) => (
    <a
      className="text-sky-700 underline dark:text-sky-300"
      href={href}
      target="_blank"
      rel="noreferrer noopener"
    >
      {children}
    </a>
  ),
  table: ({ children }) => (
    <div className="mt-2 overflow-x-auto rounded-lg border">
      <Table className="text-xs">{children}</Table>
    </div>
  ),
  thead: ({ children }) => <TableHeader>{children}</TableHeader>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableHead className="h-8 px-2">{children}</TableHead>,
  td: ({ children }) => (
    <TableCell className="px-2 py-1.5">{children}</TableCell>
  ),
};

export default function MessageBubble(props: Props) {
  const { entry, onRetry, retryDisabled, onDecide, decideDisabled } = props;

  const t = useDevetekTranslations();

  if (entry.role === 'user') {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] whitespace-pre-wrap break-words rounded-xl rounded-br-sm bg-sky-600 px-3 py-2 text-sm text-white dark:bg-sky-500">
          {entry.content}
        </p>
      </div>
    );
  }

  if (entry.status === 'pending') {
    return (
      <div
        className="flex items-center gap-2 text-sm text-muted-foreground"
        role="status"
      >
        <Spinner classNameWrapper="w-max size-4" />
        <span>{t('sidepanel.aiAssistant.thinking')}</span>
      </div>
    );
  }

  if (entry.status === 'failed') {
    return (
      <div
        className="flex flex-col gap-2 rounded-xl border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm"
        role="alert"
      >
        <p className="flex items-start gap-2 text-red-700 dark:text-red-200">
          <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span>{entry.error || t('sidepanel.aiAssistant.failedGeneric')}</span>
        </p>
        {onRetry && entry.retryText && (
          <Button
            className="self-start"
            size="sm"
            buttonColor="secondary"
            disabled={retryDisabled}
            onClick={() => onRetry(entry)}
          >
            <RotateCcwIcon aria-hidden />
            {t('sidepanel.aiAssistant.retry')}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={cn('max-w-full break-words text-sm text-primary')}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={MARKDOWN}
          skipHtml
        >
          {entry.content || t('sidepanel.aiAssistant.emptyAnswer')}
        </ReactMarkdown>
      </div>
      {(entry.actions ?? []).map((action) => (
        <ActionCard
          key={action.id}
          action={action}
          onDecide={onDecide}
          disabled={decideDisabled}
        />
      ))}
      {entry.tools.length > 0 && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <WrenchIcon className="size-3 shrink-0" aria-hidden />
          <span className="truncate">
            {t('sidepanel.aiAssistant.toolsUsed', {
              tools: Array.from(new Set(entry.tools)).map(toolLabel).join(', '),
            })}
          </span>
        </p>
      )}
    </div>
  );
}

const ACTION_STATUS_TONE: Record<ChatAction['status'], string> = {
  pending: 'border-amber-400/40 bg-amber-500/10',
  deciding: 'border-sky-400/40 bg-sky-500/10',
  executed: 'border-emerald-400/40 bg-emerald-500/10',
  rejected: 'border-neutral-400/40 bg-neutral-500/10',
  failed: 'border-red-400/40 bg-red-500/10',
};

interface ActionCardProps {
  action: ChatAction;
  onDecide?: (action: ChatAction, approve: boolean) => void;
  disabled?: boolean;
}

/** A change the assistant proposed; nothing happens until it is approved. */
function ActionCard(props: ActionCardProps) {
  const { action, onDecide, disabled } = props;

  const t = useDevetekTranslations();

  return (
    <div
      className={cn(
        'mt-1 flex flex-col gap-2 rounded-xl border px-3 py-2 text-sm',
        ACTION_STATUS_TONE[action.status],
      )}
    >
      <p className="flex items-start gap-2">
        <ShieldQuestionIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        <span className="font-medium">
          {t(`sidepanel.aiAssistant.action.${action.status}`)}
        </span>
      </p>
      <p className="break-words text-primary">{action.summary}</p>
      {action.status === 'pending' && onDecide && (
        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={disabled}
            onClick={() => onDecide(action, true)}
          >
            <CheckIcon aria-hidden />
            {t('sidepanel.aiAssistant.action.approve')}
          </Button>
          <Button
            size="sm"
            buttonColor="secondary"
            disabled={disabled}
            onClick={() => onDecide(action, false)}
          >
            <XIcon aria-hidden />
            {t('sidepanel.aiAssistant.action.reject')}
          </Button>
        </div>
      )}
      {action.status === 'deciding' && (
        <span
          className="flex items-center gap-2 text-muted-foreground"
          role="status"
        >
          <Spinner classNameWrapper="w-max size-4" />
          {t('sidepanel.aiAssistant.action.working')}
        </span>
      )}
    </div>
  );
}
