import { useId, useState } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { Input } from '@/shared/presentation/atoms/Input';
import type { InputProps } from '@/shared/presentation/atoms/Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Label for the reveal button, for people using a screen reader. */
  revealLabel?: string;
  hideLabel?: string;
}

/**
 * A masked field with a reveal toggle, for secrets someone types in. The value
 * stays uncontrolled by this component: callers own it as they would an Input.
 */
export function PasswordInput(props: PasswordInputProps) {
  const {
    className,
    hideLabel = 'Hide password',
    revealLabel = 'Show password',
    ...rest
  } = props;
  const [isRevealed, setIsRevealed] = useState(false);
  const describedById = useId();

  const ToggleIcon = isRevealed ? EyeOffIcon : EyeIcon;

  return (
    <div className="relative">
      <Input
        {...rest}
        type={isRevealed ? 'text' : 'password'}
        autoComplete="new-password"
        spellCheck={false}
        aria-describedby={describedById}
        className={cn('pr-10', className)}
      />
      <button
        type="button"
        id={describedById}
        aria-label={isRevealed ? hideLabel : revealLabel}
        aria-pressed={isRevealed}
        onClick={() => setIsRevealed((current) => !current)}
        className={cn(
          'absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-r-md',
          'text-muted-foreground transition-colors hover:text-primary',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        )}
      >
        <ToggleIcon className="size-4" />
      </button>
    </div>
  );
}
