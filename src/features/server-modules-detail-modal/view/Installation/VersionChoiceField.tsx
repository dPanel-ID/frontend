import { useState } from 'react';

import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';

import {
  CUSTOM_CHOICE,
  MAX_CUSTOM_LENGTH,
  allowsCustomValue,
  isAcceptedValue,
  isCustomValue,
} from './version-choice';

interface VersionChoiceFieldProps {
  input: DTOs.ModuleInputV1;
  value: string;
  onChange: (value: string) => void;
}

/**
 * A listed choice, such as the five newest versions. When the input allows
 * it, "Custom version…" opens a text box for any other release, checked
 * against the input's pattern as the API will.
 */
export function VersionChoiceField(props: VersionChoiceFieldProps) {
  const { input, onChange, value } = props;
  const canType = allowsCustomValue(input);
  const [typing, setTyping] = useState(
    () => canType && isCustomValue(input, value),
  );
  const example = input.options?.[0];
  const invalid =
    typing && value.trim() !== '' && !isAcceptedValue(input, value);

  const handleSelect = (next: string) => {
    if (next === CUSTOM_CHOICE) {
      setTyping(true);
      onChange('');
      return;
    }
    setTyping(false);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-2">
      <Select
        value={typing ? CUSTOM_CHOICE : value}
        onValueChange={handleSelect}
      >
        <SelectTrigger className="bg-card">
          <SelectValue placeholder="Select option" />
        </SelectTrigger>
        <SelectContent>
          {input.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
          {canType && (
            <SelectItem value={CUSTOM_CHOICE}>Custom version…</SelectItem>
          )}
        </SelectContent>
      </Select>

      {typing && (
        <>
          <Input
            autoFocus
            value={value}
            maxLength={MAX_CUSTOM_LENGTH}
            placeholder={example ? `For example ${example}` : undefined}
            aria-invalid={invalid}
            onChange={(event) => onChange(event.target.value)}
          />
          <span
            className={cn(
              'text-xs',
              invalid ? 'text-red-500' : 'text-primary/55',
            )}
          >
            {invalid
              ? `Use the same format as the listed versions${example ? `, such as ${example}` : ''}.`
              : 'Any release published upstream. The list shows the newest ones.'}
          </span>
        </>
      )}
    </div>
  );
}
