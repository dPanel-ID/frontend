import { memo, useMemo, useRef } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import type { EnvTextError } from '@/entities/application/lib/env-text';

import { cn } from '@/shared/libs/tailwind/cn';

import { useEnvErrorMessage } from './messages';

/** Errors listed at once; the rest are counted. */
const SHOWN_ERRORS = 50;

const LineNumbers = memo(function LineNumbers(props: {
  count: number;
  errorLines: Set<number>;
}) {
  const numbers = [];
  for (let line = 1; line <= props.count; line += 1) {
    const hasError = props.errorLines.has(line);
    numbers.push(
      <div
        key={line}
        className={cn(
          'h-5 px-2 text-right',
          hasError && 'bg-destructive/10 font-semibold text-destructive',
        )}
      >
        {line}
      </div>,
    );
  }
  return <>{numbers}</>;
});

interface EnvTextBoxProps {
  id: string;
  label: string;
  text: string;
  errors: EnvTextError[];
  placeholder?: string;
  onTextChange: (text: string) => void;
}

/**
 * One variable per line, with line numbers so the errors below can name
 * the line. Lines do not wrap, so line numbers stay next to their line.
 */
export default function EnvTextBox(props: EnvTextBoxProps) {
  const { id, label, text, errors, placeholder, onTextChange } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor');
  const message = useEnvErrorMessage();
  const gutter = useRef<HTMLDivElement>(null);

  const lineCount = text.split('\n').length;
  const errorLinesKey = errors.map((error) => error.line).join(',');
  const errorLines = useMemo(
    () => new Set(errorLinesKey ? errorLinesKey.split(',').map(Number) : []),
    [errorLinesKey],
  );
  const errorsId = `${id}-errors`;
  const helpId = `${id}-help`;

  return (
    <div className="flex flex-col gap-2">
      <div
        className={cn(
          'relative flex overflow-hidden rounded-md border bg-background shadow-xs focus-within:ring-[3px] focus-within:ring-ring/50 focus-within:border-ring dark:bg-input/30',
          errors.length > 0 && 'border-destructive',
        )}
      >
        <div
          aria-hidden="true"
          className="shrink-0 select-none overflow-hidden border-r bg-muted/40 py-2 font-mono text-xs leading-5 text-muted-foreground"
        >
          <div ref={gutter}>
            <LineNumbers count={lineCount} errorLines={errorLines} />
          </div>
        </div>
        <textarea
          id={id}
          aria-label={label}
          aria-invalid={errors.length > 0 ? true : undefined}
          aria-describedby={
            errors.length > 0 ? `${helpId} ${errorsId}` : helpId
          }
          value={text}
          placeholder={placeholder}
          onChange={(event) => onTextChange(event.target.value)}
          onScroll={(event) => {
            if (gutter.current) {
              gutter.current.style.transform = `translateY(-${event.currentTarget.scrollTop}px)`;
            }
          }}
          rows={Math.min(Math.max(lineCount + 1, 6), 20)}
          wrap="off"
          spellCheck={false}
          autoCapitalize="off"
          autoComplete="off"
          autoCorrect="off"
          className="min-w-0 flex-1 resize-y bg-transparent px-3 py-2 font-mono text-sm leading-5 placeholder:text-muted-foreground focus-visible:outline-none"
        />
      </div>

      <p id={helpId} className="text-xs text-muted-foreground">
        {t('textHelp')}
      </p>

      {errors.length > 0 && (
        <div
          id={errorsId}
          className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-xs text-destructive"
        >
          <p className="font-semibold">
            {t('errorCount', { count: errors.length })}
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {errors.slice(0, SHOWN_ERRORS).map((error) => (
              <li key={`${error.line}-${error.code}`}>
                {message(error, 'line')}
              </li>
            ))}
          </ul>
          {errors.length > SHOWN_ERRORS && (
            <p className="mt-1">
              {t('moreErrors', { count: errors.length - SHOWN_ERRORS })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
