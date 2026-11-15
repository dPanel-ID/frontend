import { useId } from 'react';
import type { MouseEvent, ReactNode } from 'react';

import { CircleHelpIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { Tooltip } from '@/shared/presentation/atoms/Tooltip';

export interface DashboardSectionProps {
  title: string;
  /** A sentence under the title, for cards whose header has room for it. */
  description?: string;
  /**
   * The same explanation behind a "?" beside the title instead. Use it when
   * the header also holds controls, where a visible description gets
   * squeezed into a tall, narrow column.
   */
  help?: {
    text: string;
    /** Accessible name of the help button, such as "About resource usage". */
    label: string;
  };
  /**
   * Controls such as a range picker: right-aligned on the title row when they
   * fit, wrapped onto the next line when they do not.
   */
  action?: ReactNode;
  /**
   * A chart legend, drawn on its own row directly above the content instead
   * of competing with the title and controls for the header's width.
   */
  legend?: ReactNode;
  children: ReactNode;
}

/** The standard panel shell every dashboard section sits in. */
export default function DashboardSection(props: DashboardSectionProps) {
  const { action, children, description, help, legend, title } = props;

  return (
    <section className="rounded-lg border bg-card p-4">
      {/*
        The title never shrinks or truncates: the controls sit beside it only
        while both fit, and wrap onto the next line otherwise.
      */}
      <div
        className={cn(
          'mb-4 flex flex-wrap justify-between gap-x-4 gap-y-2',
          description ? 'items-start' : 'items-center',
        )}
      >
        <div
          className={cn(
            description ? 'min-w-0 flex-[1_1_15rem]' : 'max-w-full shrink-0',
          )}
        >
          <div className="flex items-center gap-1.5">
            <h2 className="shrink-0 text-base font-bold text-primary">
              {title}
            </h2>
            {help && <SectionHelp text={help.text} label={help.label} />}
          </div>
          {description && (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          )}
        </div>
        {action && <div className="max-w-full shrink-0">{action}</div>}
      </div>
      {legend && <div className="mb-3">{legend}</div>}
      {children}
    </section>
  );
}

/**
 * A "?" that reveals the section's explanation on hover, keyboard focus and
 * tap. The text is also linked to the button for screen readers, so it is
 * read whether or not the tooltip is showing.
 */
function SectionHelp(props: { text: string; label: string }) {
  const { label, text } = props;
  const descriptionId = useId();

  // Tapping a button does not focus it on every mobile browser, so focus it
  // here: focus opens the tooltip and tapping anywhere else closes it.
  const focusOnTap = (event: MouseEvent<HTMLButtonElement>) => {
    event.currentTarget.focus();
  };

  return (
    <>
      <Tooltip
        as="button"
        asProps={{
          type: 'button',
          'aria-label': label,
          'aria-describedby': descriptionId,
          onClick: focusOnTap,
        }}
        className="inline-flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
        classNameTooltip="z-50 max-w-xs px-2 py-1.5 text-xs font-normal leading-relaxed"
        message={text}
        gap={6}
        delayMs={100}
        openOnFocus
      >
        <CircleHelpIcon aria-hidden className="size-4" />
      </Tooltip>
      <span id={descriptionId} className="sr-only">
        {text}
      </span>
    </>
  );
}
