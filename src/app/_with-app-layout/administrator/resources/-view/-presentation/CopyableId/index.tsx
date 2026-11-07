import { useEffect, useState } from 'react';

import { CheckIcon, CopyIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

interface CopyableIdProps {
  id: string | number;
  className?: string;
}

/**
 * A resource's ID as a chip that copies it, so an administrator can paste it
 * straight into a dnocs command or a support thread.
 */
export function CopyableId(props: CopyableIdProps) {
  const { className, id } = props;
  const t = useDevetekTranslations('page.adminResources.copyId');
  const [copied, setCopied] = useState(false);
  const value = String(id);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 1500);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      title={copied ? t('copied') : t('copy')}
      aria-label={t('label', { id: value })}
      onClick={(event) => {
        event.stopPropagation();
        void navigator.clipboard.writeText(value).then(() => setCopied(true));
      }}
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-md border bg-background/60 px-1.5 py-0.5 font-mono text-xs font-medium text-muted-foreground transition-colors hover:border-sky-400/50 hover:text-foreground',
        copied &&
          'border-emerald-400/50 text-emerald-600 dark:text-emerald-300',
        className,
      )}
    >
      <span>ID {value}</span>
      {copied ? (
        <CheckIcon className="size-3" aria-hidden />
      ) : (
        <CopyIcon className="size-3" aria-hidden />
      )}
    </button>
  );
}
