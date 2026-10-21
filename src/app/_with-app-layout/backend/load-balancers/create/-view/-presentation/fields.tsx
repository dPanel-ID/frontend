import type { ReactNode } from 'react';

import { CheckCircle2Icon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';

import type { IconComponent } from '../../-model/form';

export function SectionIntro(props: {
  icon: IconComponent;
  title: string;
  description: string;
}) {
  const { description, icon: Icon, title } = props;

  return (
    <div className="flex flex-col gap-4 rounded-lg border bg-background p-5 sm:flex-row sm:items-start">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border bg-card">
        <Icon className="size-6" />
      </span>
      <span className="min-w-0">
        <h3 className="text-2xl font-bold tracking-normal">{title}</h3>
        <p className="mt-2 max-w-5xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </span>
    </div>
  );
}

export function FormField(props: {
  label: string;
  description?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const { children, description, label, required } = props;

  return (
    <label className="grid gap-2">
      <span className="grid gap-1">
        <span className="text-sm font-bold">
          {label}
          {required && <span className="text-destructive">*</span>}
        </span>
        {description && (
          <span className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </span>
        )}
      </span>
      {children}
    </label>
  );
}

export function ChoiceButton(props: {
  icon: IconComponent;
  selected: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  const { description, icon: Icon, onClick, selected, title } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        'rounded-lg border bg-background p-4 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md border bg-card">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block font-bold">{title}</span>
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {description}
          </span>
        </span>
        {selected && (
          <CheckCircle2Icon className="ml-auto size-5 text-primary" />
        )}
      </span>
    </button>
  );
}

export function StateBlock(props: { children: ReactNode }) {
  return (
    <div className="flex min-h-24 items-center justify-center gap-2 rounded-lg border border-dashed bg-background p-4 text-sm text-muted-foreground">
      {props.children}
    </div>
  );
}
