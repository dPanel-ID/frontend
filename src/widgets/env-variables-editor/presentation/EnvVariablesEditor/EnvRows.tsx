import { memo, useCallback, useLayoutEffect, useRef, useState } from 'react';

import { PlusIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type { EnvTextError } from '@/entities/application/lib/env-text';

import { Button } from '@/shared/presentation/atoms/Button';
import { Input } from '@/shared/presentation/atoms/Input';

import type { EnvRow } from '../../lib/rows';
import {
  newEnvRow,
  rowErrorsOf,
  rowsFromEnvText,
  rowsToEnvText,
  sanitizeEnvKey,
} from '../../lib/rows';

import { useEnvErrorMessage } from './messages';

interface RowProps {
  row: EnvRow;
  index: number;
  idPrefix: string;
  error?: EnvTextError;
  onChange: (id: number, patch: Partial<Pick<EnvRow, 'key' | 'value'>>) => void;
  onRemove: (id: number) => void;
}

const Row = memo(function Row(props: RowProps) {
  const { row, index, idPrefix, error, onChange, onRemove } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor');
  const message = useEnvErrorMessage();
  const errorId = `${idPrefix}-row-${row.id}-error`;
  const keyInvalid =
    error !== undefined && error.code !== 'textAfterQuote' ? true : undefined;

  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-start gap-2">
      <div className="min-w-0">
        <Input
          value={row.key}
          onChange={(event) =>
            onChange(row.id, { key: sanitizeEnvKey(event.target.value) })
          }
          placeholder="ENV_KEY"
          aria-label={t('rowKey', { index: index + 1 })}
          aria-invalid={keyInvalid}
          aria-describedby={error ? errorId : undefined}
          autoComplete="off"
          spellCheck={false}
          className="h-9 text-sm font-mono"
        />
        {error && (
          <p id={errorId} className="text-xs text-destructive mt-0.5">
            {message(error, 'row')}
          </p>
        )}
      </div>
      <Input
        value={row.value}
        onChange={(event) => onChange(row.id, { value: event.target.value })}
        placeholder="value"
        aria-label={t('rowValue', { index: index + 1 })}
        autoComplete="off"
        spellCheck={false}
        className="h-9 text-sm font-mono"
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        aria-label={t('rowRemove', { index: index + 1 })}
        title={t('rowRemove', { index: index + 1 })}
        className="size-9 p-0 shrink-0 text-muted-foreground hover:text-destructive"
        onClick={() => onRemove(row.id)}
      >
        <Trash2Icon className="size-4" />
      </Button>
    </div>
  );
});

interface EnvRowsProps {
  text: string;
  idPrefix: string;
  onTextChange: (text: string) => void;
}

/**
 * One row per variable. Rows are kept here so what is typed stays as typed
 * (a name is checked, not rewritten); every change is handed up as text.
 * A text change made outside (showing or hiding values) rebuilds the rows.
 */
export default function EnvRows(props: EnvRowsProps) {
  const { text, idPrefix, onTextChange } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor');

  const [rows, setRows] = useState(() => rowsFromEnvText(text));
  const [rowsText, setRowsText] = useState(text);
  if (text !== rowsText) {
    setRowsText(text);
    setRows(rowsFromEnvText(text));
  }

  const latest = useRef({ rows, onTextChange });
  useLayoutEffect(() => {
    latest.current = { rows, onTextChange };
  });

  const commit = useCallback((next: EnvRow[]) => {
    const nextText = rowsToEnvText(next);
    setRows(next);
    setRowsText(nextText);
    latest.current.onTextChange(nextText);
  }, []);

  const handleChange = useCallback<RowProps['onChange']>(
    (id, patch) => {
      commit(
        latest.current.rows.map((row) =>
          row.id === id ? { ...row, ...patch } : row,
        ),
      );
    },
    [commit],
  );

  const handleRemove = useCallback(
    (id: number) => {
      commit(latest.current.rows.filter((row) => row.id !== id));
    },
    [commit],
  );

  const handleAdd = () => {
    commit([...rows, newEnvRow()]);
  };

  const errors = rowErrorsOf(rows);

  return (
    <div className="flex flex-col gap-2">
      {rows.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2.25rem] gap-2">
          <p className="font-bold text-xs text-primary/70">{t('columnKey')}</p>
          <p className="font-bold text-xs text-primary/70">
            {t('columnValue')}
          </p>
        </div>
      )}

      {rows.map((row, index) => (
        <Row
          key={row.id}
          row={row}
          index={index}
          idPrefix={idPrefix}
          error={errors.get(index)}
          onChange={handleChange}
          onRemove={handleRemove}
        />
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-1 w-full gap-1"
        onClick={handleAdd}
      >
        <PlusIcon className="size-3" />
        {t('add')}
      </Button>
    </div>
  );
}
