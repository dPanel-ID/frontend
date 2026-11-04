import { useEffect, useRef, useState } from 'react';

import { CheckIcon, CopyIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

interface CopyBlockProps {
  label: string;
  value: string;
  /** Preformatted, scrollable block (files, env) instead of one line. */
  multiline?: boolean;
  className?: string;
}

/** A value to copy, selectable by hand when the clipboard is refused. */
export default function CopyBlock(props: CopyBlockProps) {
  const { className, label, multiline = false, value } = props;
  const t = useDevetekTranslations('widget.workers.copy');

  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const refTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(refTimer.current), []);

  const handleCopy = async () => {
    window.clearTimeout(refTimer.current);
    try {
      await navigator.clipboard.writeText(value);
      setState('copied');
    } catch {
      setState('failed');
    }
    refTimer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  const copyLabel = `${t('copy')}: ${label}`;

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          {label}
        </span>
        <Button
          size="xs"
          buttonStyle="outline"
          buttonColor="secondary"
          aria-label={copyLabel}
          title={copyLabel}
          onClick={handleCopy}
        >
          {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
          {state === 'copied' ? t('copied') : t('copy')}
        </Button>
      </div>

      {multiline ? (
        <pre className="max-h-64 overflow-auto rounded-lg border bg-background/60 p-3 font-mono text-xs leading-relaxed select-all whitespace-pre">
          {value}
        </pre>
      ) : (
        <code className="block min-w-0 rounded-lg border bg-background/60 px-3 py-2 font-mono text-xs break-all select-all">
          {value}
        </code>
      )}

      {state === 'failed' && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {t('failed')}
        </p>
      )}
    </div>
  );
}
