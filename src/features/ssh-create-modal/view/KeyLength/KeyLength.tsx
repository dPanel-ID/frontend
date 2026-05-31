import { useEffect, useMemo } from 'react';

import { ApiSecret } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';

import { KEY_LENGTH_LIST } from '../../config';
import { useSSHCreateContext } from '../../model';

const KEY_META: Record<
  number,
  { level: string; desc: string; recommended?: boolean }
> = {
  2048: {
    level: 'Standard',
    desc: 'Compatible with all systems. Sufficient for most use cases.',
  },
  3072: {
    level: 'Strong',
    desc: 'Good balance of security and performance.',
  },
  4096: {
    level: 'Maximum',
    desc: 'Highest security. Recommended for sensitive environments.',
    recommended: true,
  },
};

export default function KeyLength() {
  const { keyLength, setKeyLength } = useSSHCreateContext();
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
        <p className="text-sm font-medium">Key Length (bits)</p>
        <p className="text-xs text-primary/50">Longer = more secure</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {keyLengthList.map((item) => {
          const meta = KEY_META[item.value];
          const isActive = keyLength === item.value;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => setKeyLength(item.value)}
              className={cn(
                'relative flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all',
                isActive
                  ? 'border-primary bg-primary/5 ring-1 ring-primary'
                  : 'border-border bg-card/50 hover:border-primary/40 hover:bg-muted/40',
              )}
            >
              {meta?.recommended && (
                <span className="absolute top-2 right-2 text-[10px] font-semibold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  Recommended
                </span>
              )}
              <span className="text-base font-bold">{item.label}</span>
              <span
                className={cn(
                  'text-xs font-semibold',
                  isActive ? 'text-primary' : 'text-primary/60',
                )}
              >
                {meta?.level}
              </span>
              <span className="text-[11px] text-primary/50 leading-tight">
                {meta?.desc}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
