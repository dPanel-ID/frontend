import { useMemo } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiSecret } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { KEY_TYPE_LIST } from '../../config';
import { useSSHCreateContext } from '../../model';

/**
 * Lets someone choose a key without knowing what Ed25519 is: the choice is
 * framed as which servers the key has to work with. The algorithm name stays
 * visible for people who do know.
 */
export default function KeyType() {
  const { algorithm, setAlgorithm } = useSSHCreateContext();
  const t = useDevetekTranslations();
  const [algorithmsResponse] = ApiSecret.SshKey.Algorithms.useGet({});

  const choices = useMemo(() => {
    if (algorithmsResponse.$status !== 'success') return KEY_TYPE_LIST;

    const supported = algorithmsResponse.algorithms
      .filter((item) => KEY_TYPE_LIST.some((known) => known.name === item.name))
      .map((item) => {
        const known = KEY_TYPE_LIST.find((entry) => entry.name === item.name);

        return {
          name: item.name,
          // The plain-language copy is ours; the backend only says which
          // algorithms exist and which it recommends.
          title: known?.title ?? item.label,
          description: known?.description ?? '',
          technicalName: item.label || known?.technicalName || item.name,
          recommended: item.recommended ?? known?.recommended ?? false,
        };
      });

    return supported.length > 0 ? supported : KEY_TYPE_LIST;
  }, [algorithmsResponse]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">
          {t('page.sshKeys.create.typeLabel')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('page.sshKeys.create.typeHint')}
        </p>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {choices.map((choice) => {
          const isActive = algorithm === choice.name;

          return (
            <button
              key={choice.name}
              type="button"
              aria-pressed={isActive}
              onClick={() => setAlgorithm(choice.name)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-lg border bg-card p-3 pt-6 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2',
                FLOW_ACCENTS.sky.ring,
                isActive ? FLOW_ACCENTS.sky.selected : FLOW_ACCENTS.sky.hover,
              )}
            >
              {choice.recommended && (
                <span
                  className={cn(
                    'absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
                    FLOW_ACCENTS.sky.badge,
                  )}
                >
                  {t('page.sshKeys.create.levels.recommended')}
                </span>
              )}
              <span className="text-sm font-bold">{t(choice.title)}</span>
              <span className="text-[11px] leading-tight text-muted-foreground">
                {t(choice.description)}
              </span>
              <span
                className={cn(
                  'text-[11px] font-semibold',
                  isActive ? FLOW_ACCENTS.sky.text : 'text-muted-foreground',
                )}
              >
                {choice.technicalName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
