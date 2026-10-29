import { useState } from 'react';
import type { KeyboardEvent } from 'react';

import {
  CalendarClockIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/atoms/Popover';

import {
  LOG_TIME_RANGE_MAX_LOOKBACK_DAYS,
  LOG_TIME_RANGE_MAX_LOOKBACK_MS,
  LOG_TIME_RANGE_PRESET_ORDER,
  formatUtcOffset,
  fromDateTimeLocalValue,
  toDateTimeLocalValue,
  validateCustomLogTimeRange,
} from '../../lib/log-time-range';
import type {
  CustomLogTimeRangeError,
  LogTimeRange,
  LogTimeRangePreset,
} from '../../lib/log-time-range';

interface LogTimeRangeMenuProps {
  value: LogTimeRange;
  onChange: (range: LogTimeRange) => void;
}

const PRESET_LABEL_KEYS: Record<LogTimeRangePreset, string> = {
  '10m': 'timeRangePresets.last10m',
  '1h': 'timeRangePresets.last1h',
  '6h': 'timeRangePresets.last6h',
  '24h': 'timeRangePresets.last24h',
  '3d': 'timeRangePresets.last3d',
  '7d': 'timeRangePresets.last7d',
  '10d': 'timeRangePresets.last10d',
};

const CUSTOM_ERROR_KEYS: Record<CustomLogTimeRangeError, string> = {
  invalid: 'customRangeErrors.invalid',
  startAfterEnd: 'customRangeErrors.startAfterEnd',
  tooOld: 'customRangeErrors.tooOld',
  inFuture: 'customRangeErrors.inFuture',
};

const DEFAULT_CUSTOM_RANGE_MS = 60 * 60 * 1000;

/**
 * Picks the window runtime logs are read from: a recent period that follows
 * "now", or a fixed range reaching back at most the lookback window.
 */
export default function LogTimeRangeMenu(props: LogTimeRangeMenuProps) {
  const { onChange, value } = props;

  const t = useDevetekTranslations('common.logViewer');
  const locale = useDevetekLocale();

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'presets' | 'custom'>('presets');

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) setView('presets');
  };

  const handleSelect = (range: LogTimeRange) => {
    onChange(range);
    setOpen(false);
  };

  const triggerLabel =
    value.kind === 'relative'
      ? t(PRESET_LABEL_KEYS[value.preset])
      : formatAbsoluteRange(value.fromMs, value.toMs, locale);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`${t('timeRangeLabel')}: ${triggerLabel}`}
          className={cn(
            'inline-flex h-8 min-w-0 max-w-72 items-center gap-2 rounded-md border bg-background px-2 text-sm font-medium transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring',
            'data-[state=open]:bg-accent',
          )}
        >
          <CalendarClockIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{triggerLabel}</span>
          <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-[min(20rem,calc(100vw-2rem))] p-0"
      >
        {view === 'presets' ? (
          <PresetView
            value={value}
            onSelect={handleSelect}
            onOpenCustom={() => setView('custom')}
          />
        ) : (
          <CustomRangeView
            value={value}
            onApply={handleSelect}
            onBack={() => setView('presets')}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

function PresetView(props: {
  value: LogTimeRange;
  onSelect: (range: LogTimeRange) => void;
  onOpenCustom: () => void;
}) {
  const { onOpenCustom, onSelect, value } = props;

  const t = useDevetekTranslations('common.logViewer');
  const [offset] = useState(() => formatUtcOffset(Date.now()));

  return (
    <div>
      <div className="px-4 pb-2 pt-3">
        <p className="text-sm font-semibold">{t('timeRange')}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {t('timeRangeHint', {
            days: LOG_TIME_RANGE_MAX_LOOKBACK_DAYS,
            offset,
          })}
        </p>
      </div>

      <div role="group" aria-label={t('timeRange')} className="p-1">
        {LOG_TIME_RANGE_PRESET_ORDER.map((preset) => {
          const isActive = value.kind === 'relative' && value.preset === preset;

          return (
            <button
              key={preset}
              type="button"
              aria-pressed={isActive}
              onClick={() => onSelect({ kind: 'relative', preset })}
              className={cn(
                'flex h-8 w-full items-center gap-2 rounded-sm px-2 text-left text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:bg-accent focus-visible:outline-hidden',
                isActive && 'font-medium',
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">
                {isActive && <CheckIcon className="size-4" />}
              </span>
              {t(PRESET_LABEL_KEYS[preset])}
            </button>
          );
        })}
      </div>

      <div className="border-t p-1">
        <button
          type="button"
          aria-pressed={value.kind === 'absolute'}
          onClick={onOpenCustom}
          className={cn(
            'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'focus-visible:bg-accent focus-visible:outline-hidden',
          )}
        >
          <span className="flex size-4 shrink-0 items-center justify-center">
            {value.kind === 'absolute' && <CheckIcon className="size-4" />}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium">
              {t('customRange')}
            </span>
            <span className="block text-xs text-muted-foreground">
              {t('customRangeHint', {
                days: LOG_TIME_RANGE_MAX_LOOKBACK_DAYS,
              })}
            </span>
          </span>
          <ChevronRightIcon className="size-4 shrink-0 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function CustomRangeView(props: {
  value: LogTimeRange;
  onApply: (range: LogTimeRange) => void;
  onBack: () => void;
}) {
  const { onApply, onBack, value } = props;

  const t = useDevetekTranslations('common.logViewer');

  // The bounds are fixed when the view opens; validation re-reads the clock.
  const [nowMs] = useState(() => Date.now());
  const [from, setFrom] = useState(() =>
    toDateTimeLocalValue(
      value.kind === 'absolute'
        ? value.fromMs
        : nowMs - DEFAULT_CUSTOM_RANGE_MS,
    ),
  );
  const [to, setTo] = useState(() =>
    toDateTimeLocalValue(value.kind === 'absolute' ? value.toMs : nowMs),
  );
  const [error, setError] = useState<CustomLogTimeRangeError | null>(null);

  const minValue = toDateTimeLocalValue(nowMs - LOG_TIME_RANGE_MAX_LOOKBACK_MS);
  const maxValue = toDateTimeLocalValue(nowMs);

  const handleApply = () => {
    const fromMs = fromDateTimeLocalValue(from);
    const toMs = fromDateTimeLocalValue(to);
    const nextError = validateCustomLogTimeRange(fromMs, toMs, Date.now());

    setError(nextError);
    if (nextError) return;

    onApply({ kind: 'absolute', fromMs, toMs });
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    handleApply();
  };

  return (
    <div>
      <div className="flex items-center gap-1 border-b px-2 py-2">
        <Button
          size="icon-xs"
          buttonColor="secondary"
          buttonStyle="ghost"
          onClick={onBack}
          aria-label={t('backToPresets')}
          title={t('backToPresets')}
        >
          <ChevronLeftIcon />
        </Button>
        <p className="text-sm font-semibold">{t('customRange')}</p>
      </div>

      <div className="flex flex-col gap-3 px-4 py-3">
        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          {t('rangeFrom')}
          <Input
            type="datetime-local"
            className="h-9 text-sm text-foreground"
            value={from}
            min={minValue}
            max={maxValue}
            aria-invalid={error !== null}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => {
              setFrom(event.target.value);
              setError(null);
            }}
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
          {t('rangeTo')}
          <Input
            type="datetime-local"
            className="h-9 text-sm text-foreground"
            value={to}
            min={minValue}
            max={maxValue}
            aria-invalid={error !== null}
            onKeyDown={handleInputKeyDown}
            onChange={(event) => {
              setTo(event.target.value);
              setError(null);
            }}
          />
        </label>

        <p
          aria-live="polite"
          className={cn(
            'text-xs',
            error ? 'text-destructive' : 'text-muted-foreground',
          )}
        >
          {error
            ? t(CUSTOM_ERROR_KEYS[error], {
                days: LOG_TIME_RANGE_MAX_LOOKBACK_DAYS,
              })
            : t('customRangeTimezone', { offset: formatUtcOffset(nowMs) })}
        </p>
      </div>

      <div className="flex justify-end gap-2 border-t px-4 py-3">
        <Button
          size="sm"
          buttonColor="secondary"
          buttonStyle="outline"
          onClick={onBack}
        >
          {t('cancel')}
        </Button>
        <Button size="sm" onClick={handleApply}>
          {t('applyRange')}
        </Button>
      </div>
    </div>
  );
}

function formatAbsoluteRange(fromMs: number, toMs: number, locale: string) {
  const formatter = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return formatter.formatRange(new Date(fromMs), new Date(toMs));
}
