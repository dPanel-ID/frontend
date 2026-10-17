import { CheckIcon, DotIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

interface ConsequenceListProps {
  title: string;
  items: string[];
  tone: 'danger' | 'info';
  /** Shows step numbers instead of bullets. */
  numbered?: boolean;
}

/** "What happens" box of a confirmation dialog. */
export function ConsequenceList(props: ConsequenceListProps) {
  const { items, numbered = false, title, tone } = props;

  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        tone === 'danger' && 'border-red-400/30 bg-red-500/5',
        tone === 'info' && 'border-sky-400/30 bg-sky-500/5',
      )}
    >
      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <ol className="mt-2 grid gap-2 text-sm">
        {items.map((item, index) => (
          <li key={item} className="flex items-start gap-2">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border text-[0.65rem] font-bold',
                tone === 'danger' &&
                  'border-red-400/40 text-red-600 dark:text-red-300',
                tone === 'info' &&
                  'border-sky-400/40 text-sky-600 dark:text-sky-300',
              )}
              aria-hidden
            >
              {numbered ? (
                index + 1
              ) : tone === 'danger' ? (
                <DotIcon className="size-4" />
              ) : (
                <CheckIcon className="size-3" />
              )}
            </span>
            <span className="leading-relaxed">{item}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
