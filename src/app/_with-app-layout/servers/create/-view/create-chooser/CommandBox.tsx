import { useEffect, useState } from 'react';

import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react';

import { useToaster } from '@/services/toaster';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

interface CommandBoxProps {
  command: string;
  /** Where to run it, shown in the box's title bar. */
  label: string;
  copyLabel: string;
  copiedLabel: string;
  copyFailedMessage: string;
}

/** A command in the dark terminal box, with a copy button. */
export default function CommandBox(props: CommandBoxProps) {
  const { command, copiedLabel, copyFailedMessage, copyLabel, label } = props;
  const [openToaster] = useToaster();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      openToaster({ variant: 'error', message: copyFailedMessage });
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-neutral-950 text-neutral-100">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs text-neutral-400">
          <TerminalIcon className="size-3.5 shrink-0" />
          <span className="truncate">{label}</span>
        </span>
        <Button
          size="sm"
          buttonStyle="ghost"
          buttonColor="secondary"
          className="h-7 shrink-0 text-neutral-200 hover:bg-white/10 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
          {copied ? copiedLabel : copyLabel}
        </Button>
      </div>
      <pre className="overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed">
        {command}
      </pre>
    </div>
  );
}
