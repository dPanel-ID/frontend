import { useEffect, useMemo } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiSecret } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { KEY_LENGTH_LIST } from '../../config';
import { useSSHCreateContext } from '../../model';

/** Security level per supported key size, so the number means something. */
const KEY_META: Record<
  number,
  { level: string; desc: string; recommended?: boolean }
> = {
  2048: {
    level: 'page.sshKeys.create.levels.standard',
    desc: 'page.sshKeys.create.levels.standardDesc',
  },
  3072: {
    level: 'page.sshKeys.create.levels.strong',
    desc: 'page.sshKeys.create.levels.strongDesc',
  },
  4096: {
    level: 'page.sshKeys.create.levels.maximum',
    desc: 'page.sshKeys.create.levels.maximumDesc',
    recommended: true,
  },
};

export default function KeyLength() {
  const { keyLength, setKeyLength } = useSSHCreateContext();
  const t = useDevetekTranslations();
  const [lengthsResponse] = ApiSecret.SshKey.Lengths.useGet({});

  const keyLengthList = useMemo(() => {
    if (lengthsResponse.$status !== 'success') {
      return KEY_LENGTH_LIST;
    }

    const supportedLengths = Array.from(lengthsResponse)
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b);

    if (supportedLengths.length < 1) {
      return KEY_LENGTH_LIST;
    }

    return supportedLengths.map((value) => ({
      value,
      label: String(value),
    }));
  }, [lengthsResponse]);

  useEffect(() => {
    if (keyLengthList.some((item) => item.value === keyLength)) return;

    const fallbackLength = keyLengthList.at(-1)?.value;
    if (fallbackLength) {
      setKeyLength(fallbackLength);
    }
  }, [keyLength, keyLengthList, setKeyLength]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <p className="text-sm font-semibold">
          {t('page.sshKeys.create.lengthLabel')}
        </p>
        <p className="text-xs text-muted-foreground">
          {t('page.sshKeys.create.lengthHint')}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keyLengthList.map((item) => {
          const meta = KEY_META[item.value];
          const isActive = keyLength === item.value;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setKeyLength(item.value)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-lg border bg-card p-3 pt-6 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2',
                FLOW_ACCENTS.sky.ring,
                isActive ? FLOW_ACCENTS.sky.selected : FLOW_ACCENTS.sky.hover,
              )}
            >
              {meta?.recommended && (
                <span
                  className={cn(
                    'absolute right-2 top-2 rounded-full border px-1.5 py-0.5 text-[10px] font-semibold',
                    FLOW_ACCENTS.sky.badge,
                  )}
                >
                  {t('page.sshKeys.create.levels.recommended')}
                </span>
              )}
              <span className="text-base font-bold">{item.label}</span>
              {meta && (
                <>
                  <span
                    className={cn(
                      'text-xs font-semibold',
                      isActive
                        ? FLOW_ACCENTS.sky.text
                        : 'text-muted-foreground',
                    )}
                  >
                    {t(meta.level)}
                  </span>
                  <span className="text-[11px] leading-tight text-muted-foreground">
                    {t(meta.desc)}
                  </span>
                </>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
