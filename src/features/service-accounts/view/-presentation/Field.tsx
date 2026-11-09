import { useId } from 'react';
import type { ReactNode } from 'react';

interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldControlProps) => ReactNode;
}

/** A labelled control with its hint, and the error in place of the hint. */
export default function Field(props: FieldProps) {
  const { children, error, hint, label } = props;
  const id = useId();
  const describedBy = `${id}-description`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}
      <p
        id={describedBy}
        className={
          error
            ? 'text-xs text-red-600 dark:text-red-400'
            : 'text-xs leading-relaxed text-muted-foreground'
        }
      >
        {error ?? hint}
      </p>
    </div>
  );
}
