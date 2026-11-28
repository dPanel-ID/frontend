import { ListPlusIcon, Trash2Icon } from 'lucide-react';

import { Button } from '@/shared/presentation/atoms/Button';
import { Input } from '@/shared/presentation/atoms/Input';

export interface CommandListEditorProps {
  /** Prefix of every input id, unique on the page. */
  idPrefix: string;
  commands: string[];
  onChange: (commands: string[]) => void;
  /** Shown next to each field: "Command {n}". */
  itemLabel: (index: number) => string;
  addLabel: string;
  removeLabel: (index: number) => string;
  placeholder?: string;
  emptyLabel?: string;
  disabled?: boolean;
  /** Most commands a section accepts. */
  max?: number;
}

/**
 * An ordered list of command lines, each editable, removable, and one more
 * added at the end. Props in, elements out: the caller owns the list.
 */
export function CommandListEditor(props: CommandListEditorProps) {
  const {
    addLabel,
    commands,
    disabled,
    emptyLabel,
    idPrefix,
    itemLabel,
    max = 20,
    onChange,
    placeholder,
    removeLabel,
  } = props;

  const update = (index: number, value: string) => {
    onChange(commands.map((command, at) => (at === index ? value : command)));
  };

  return (
    <div className="grid gap-2">
      {commands.length === 0 && emptyLabel && (
        <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
          {emptyLabel}
        </p>
      )}
      {commands.map((command, index) => (
        <div key={index} className="flex items-center gap-2">
          <label className="sr-only" htmlFor={`${idPrefix}-${index}`}>
            {itemLabel(index)}
          </label>
          <span
            aria-hidden="true"
            className="w-5 shrink-0 text-right font-mono text-xs text-muted-foreground"
          >
            {index + 1}
          </span>
          <Input
            id={`${idPrefix}-${index}`}
            className="min-w-0 flex-1 font-mono text-xs"
            value={command}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={4096}
            onChange={(event) => update(index, event.target.value)}
          />
          <Button
            type="button"
            size="xs"
            variant="ghost"
            disabled={disabled}
            title={removeLabel(index)}
            aria-label={removeLabel(index)}
            onClick={() => onChange(commands.filter((_, at) => at !== index))}
          >
            <Trash2Icon className="size-4" />
          </Button>
        </div>
      ))}
      <div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || commands.length >= max}
          onClick={() => onChange([...commands, ''])}
        >
          <ListPlusIcon className="size-4" />
          {addLabel}
        </Button>
      </div>
    </div>
  );
}
