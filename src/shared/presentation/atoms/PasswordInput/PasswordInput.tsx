import { useId, useState } from 'react';

import {
  CheckIcon,
  CopyIcon,
  EyeIcon,
  EyeOffIcon,
  TriangleAlertIcon,
  WandSparklesIcon,
} from 'lucide-react';

import { secretFieldAutofillProps } from '@/shared/libs/browser/autofill';
import { cn } from '@/shared/libs/tailwind/cn';
import { Input } from '@/shared/presentation/atoms/Input';
import type { InputProps } from '@/shared/presentation/atoms/Input';

export interface PasswordInputProps extends Omit<InputProps, 'type'> {
  /** Label for the reveal button, for people using a screen reader. */
  revealLabel?: string;
  hideLabel?: string;
  /**
   * Shows a Generate button. It returns the new password after handing it
   * to the caller's own state (the field stays caller-owned), or undefined
   * when none could be made; the field then reveals it, offers a copy button
   * and asks the user to save it.
   */
  onGenerate?: () => string | undefined;
  generateLabel?: string;
  copyLabel?: string;
  copiedLabel?: string;
  /** Shown under a generated password. */
  generatedNote?: string;
}

/**
 * A masked field with a reveal toggle, for secrets someone types in, and an
 * optional Generate action. The value stays uncontrolled by this component:
 * callers own it as they would an Input.
 */
export function PasswordInput(props: PasswordInputProps) {
  const {
    className,
    copiedLabel = 'Copied',
    copyLabel = 'Copy password',
    generateLabel = 'Generate',
    generatedNote = "Save this password now. dPanel doesn't show it again.",
    hideLabel = 'Hide password',
    onGenerate,
    revealLabel = 'Show password',
    ...rest
  } = props;
  const [isRevealed, setIsRevealed] = useState(false);
  const [generated, setGenerated] = useState<string>();
  const [copied, setCopied] = useState(false);
  const describedById = useId();
  const noteId = useId();

  // The note and copy button belong to the generated value only; once the
  // user types over it, the field is theirs again.
  const showGenerated =
    generated !== undefined && String(rest.value ?? '') === generated;

  const ToggleIcon = isRevealed ? EyeOffIcon : EyeIcon;

  const handleGenerate = () => {
    const next = onGenerate?.();
    if (!next) return;
    setGenerated(next);
    setIsRevealed(true);
    setCopied(false);
  };

  const handleCopy = () => {
    if (!generated) return;
    void navigator.clipboard.writeText(generated).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const field = (
    <div className="relative min-w-0 flex-1">
      <Input
        {...rest}
        type={isRevealed ? 'text' : 'password'}
        {...secretFieldAutofillProps}
        spellCheck={false}
        aria-describedby={
          showGenerated ? `${describedById} ${noteId}` : describedById
        }
        className={cn(showGenerated ? 'pr-20' : 'pr-10', className)}
      />
      <div className="absolute inset-y-0 right-0 flex items-center">
        {showGenerated && (
          <button
            type="button"
            aria-label={copied ? copiedLabel : copyLabel}
            title={copied ? copiedLabel : copyLabel}
            onClick={handleCopy}
            className={iconButtonClassName}
          >
            {copied ? (
              <CheckIcon className="size-4" />
            ) : (
              <CopyIcon className="size-4" />
            )}
          </button>
        )}
        <button
          type="button"
          id={describedById}
          aria-label={isRevealed ? hideLabel : revealLabel}
          title={isRevealed ? hideLabel : revealLabel}
          aria-pressed={isRevealed}
          onClick={() => setIsRevealed((current) => !current)}
          className={cn(iconButtonClassName, 'rounded-r-md')}
        >
          <ToggleIcon className="size-4" />
        </button>
      </div>
    </div>
  );

  if (!onGenerate) {
    return field;
  }

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        {field}
        <button
          type="button"
          title={generateLabel}
          onClick={handleGenerate}
          className={cn(
            'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-lg border bg-background px-3 text-sm font-medium',
            'text-primary transition-colors hover:bg-muted',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
        >
          <WandSparklesIcon className="size-4" aria-hidden />
          <span>{generateLabel}</span>
        </button>
      </div>
      {showGenerated && (
        <p
          id={noteId}
          role="status"
          className="flex items-start gap-1.5 rounded-lg border border-amber-400/30 bg-amber-500/10 px-2.5 py-1.5 text-xs leading-relaxed text-amber-700 dark:text-amber-300"
        >
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{generatedNote}</span>
        </p>
      )}
    </div>
  );
}

const iconButtonClassName = cn(
  'flex h-full w-10 items-center justify-center',
  'text-muted-foreground transition-colors hover:text-primary',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
);
