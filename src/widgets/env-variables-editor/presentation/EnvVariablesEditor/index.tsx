import { useId, useMemo, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { parseEnvText } from '@/entities/application/lib/env-text';

import { cn } from '@/shared/libs/tailwind/cn';

import EnvRows from './EnvRows';
import EnvTextBox from './EnvTextBox';

export type EnvEditorMode = 'rows' | 'text';

export interface EnvVariablesEditorProps {
  /** The variables as text (see entities/application/lib/env-text). */
  text: string;
  onTextChange: (text: string) => void;
  /** Accessible name of the editor, e.g. "Runtime variables". */
  label: string;
  defaultMode?: EnvEditorMode;
  /** Shown in a banner at the start of the toolbar. */
  notice?: React.ReactNode;
  /** Shown just before the mode switch, e.g. the show/hide values button. */
  actions?: React.ReactNode;
  textPlaceholder?: string;
}

function ModeSwitch(props: {
  mode: EnvEditorMode;
  rowsBlocked: boolean;
  onChange: (mode: EnvEditorMode) => void;
}) {
  const { mode, rowsBlocked, onChange } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor');

  const options: Array<{ id: EnvEditorMode; text: string }> = [
    { id: 'rows', text: t('modeRows') },
    { id: 'text', text: t('modeText') },
  ];

  return (
    <div
      role="group"
      aria-label={t('modeLabel')}
      className="inline-flex shrink-0 rounded-md border bg-background p-0.5"
    >
      {options.map((option) => {
        const active = option.id === mode;
        const disabled = option.id === 'rows' && !active && rowsBlocked;
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            disabled={disabled}
            title={disabled ? t('rowsBlocked') : undefined}
            onClick={() => onChange(option.id)}
            className={cn(
              'h-6 rounded-sm px-2 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
              active
                ? 'bg-card font-semibold text-foreground shadow-xs not-dark:border'
                : 'text-foreground/60 hover:bg-black/5 dark:hover:bg-white/5',
            )}
          >
            {option.text}
          </button>
        );
      })}
    </div>
  );
}

/**
 * Edits environment variables one row per variable, or as one block of
 * text (`KEY_NAME="VALUE"` per line). Both views edit the same text, so
 * switching keeps every change; the parent stores the text and turns it
 * into variables with parseEnvText when saving.
 */
export default function EnvVariablesEditor(props: EnvVariablesEditorProps) {
  const {
    text,
    onTextChange,
    label,
    defaultMode = 'rows',
    notice,
    actions,
    textPlaceholder,
  } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor');
  const id = useId();
  const [mode, setMode] = useState<EnvEditorMode>(defaultMode);

  const errors = useMemo(
    () => (mode === 'text' ? parseEnvText(text).errors : []),
    [mode, text],
  );
  const rowsBlocked = errors.length > 0;

  const modeSwitch = (
    <ModeSwitch mode={mode} rowsBlocked={rowsBlocked} onChange={setMode} />
  );

  return (
    <div className="flex flex-col gap-2" role="group" aria-label={label}>
      {notice ? (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="min-w-0 flex-1 basis-48">{notice}</span>
          <div className="flex flex-wrap items-center gap-2">
            {actions}
            {modeSwitch}
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          {actions}
          {modeSwitch}
        </div>
      )}

      {mode === 'text' ? (
        <>
          <EnvTextBox
            id={`${id}-text`}
            label={label}
            text={text}
            errors={errors}
            placeholder={textPlaceholder}
            onTextChange={onTextChange}
          />
          {rowsBlocked && (
            <p className="text-xs text-muted-foreground">{t('rowsBlocked')}</p>
          )}
        </>
      ) : (
        <EnvRows text={text} idPrefix={id} onTextChange={onTextChange} />
      )}
    </div>
  );
}
