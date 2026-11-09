import { useEffect, useRef, useState } from 'react';

import { CheckIcon, CopyIcon, TriangleAlertIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

/** A new token, shown this one time. */
export default function TokenReveal(props: { token: string }) {
  const { token } = props;
  const t = useDevetekTranslations('widget.serviceAccounts.reveal');
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const refTimer = useRef<number>(undefined);

  useEffect(() => () => window.clearTimeout(refTimer.current), []);

  const handleCopy = async () => {
    window.clearTimeout(refTimer.current);
    try {
      await navigator.clipboard.writeText(token);
      setState('copied');
    } catch {
      setState('failed');
    }
    refTimer.current = window.setTimeout(() => setState('idle'), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-start gap-2 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs leading-relaxed">
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
        {t('warning')}
      </p>

      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold text-muted-foreground">
            {t('label')}
          </span>
          <Button
            size="xs"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={handleCopy}
          >
            {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
            {state === 'copied' ? t('copied') : t('copy')}
          </Button>
        </div>
        <code className="block min-w-0 rounded-lg border bg-background/60 px-3 py-2 font-mono text-xs break-all">
          {token}
        </code>
        {state === 'failed' && (
          <p className="text-xs text-red-600 dark:text-red-400" role="alert">
            {t('copyFailed')}
          </p>
        )}
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground">
        {t('usage')}{' '}
        <code className="font-mono">Authorization: Bearer dps_…</code>
      </p>
    </div>
  );
}
