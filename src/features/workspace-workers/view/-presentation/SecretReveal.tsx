import { KeyRoundIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { WorkerSecretResult } from '../../rules/types';

import CopyBlock from './CopyBlock';

interface SecretRevealProps {
  result: WorkerSecretResult;
}

/**
 * A VM worker's token and environment, shown this once. dPanel keeps only a
 * hash, so closing the dialog hides the token for good.
 */
export default function SecretReveal(props: SecretRevealProps) {
  const { result } = props;
  const t = useDevetekTranslations('widget.workers.secret');

  return (
    <div className="flex flex-col gap-4">
      <div
        className="flex items-start gap-3 rounded-lg border border-amber-400/50 bg-amber-500/10 p-3"
        role="alert"
      >
        <KeyRoundIcon
          className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300"
          aria-hidden
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-semibold">{t('title')}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('warning')}
          </p>
        </div>
      </div>

      {result.token ? (
        <CopyBlock label={t('token')} value={result.token} />
      ) : (
        <p className="text-xs text-muted-foreground">{t('noToken')}</p>
      )}

      {result.envBlock && (
        <div className="flex flex-col gap-1.5">
          <CopyBlock label={t('env')} value={result.envBlock} multiline />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('envHint')}
          </p>
        </div>
      )}
    </div>
  );
}
