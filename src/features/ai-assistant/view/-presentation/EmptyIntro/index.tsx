import { SparklesIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

const EXAMPLES = [
  'exampleServers',
  'exampleExecutions',
  'exampleDomains',
] as const;

interface Props {
  onPick: (prompt: string) => void;
  disabled?: boolean;
}

export default function EmptyIntro(props: Props) {
  const { onPick, disabled } = props;

  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-sky-400/30 bg-sky-500/10 p-4">
      <div className="flex items-center gap-2 text-sky-700 dark:text-sky-200">
        <SparklesIcon className="size-4" aria-hidden />
        <h4 className="text-sm font-bold">
          {t('sidepanel.aiAssistant.introTitle')}
        </h4>
      </div>
      <p className="text-sm text-muted-foreground">
        {t('sidepanel.aiAssistant.introBody')}
      </p>
      <div className="flex flex-col gap-2">
        {EXAMPLES.map((key) => {
          const prompt = t(`sidepanel.aiAssistant.${key}`);
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onPick(prompt)}
              className="rounded-lg border bg-card px-3 py-2 text-left text-sm transition-all hover:border-sky-400/40 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {prompt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
