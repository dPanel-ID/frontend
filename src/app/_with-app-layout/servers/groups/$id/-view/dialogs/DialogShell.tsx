import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';

interface DialogShellProps {
  open: boolean;
  onClose: () => void;
  /** Blocks closing while a request is in flight. */
  busy?: boolean;
  icon: LucideIcon;
  tone?: 'sky' | 'danger';
  title: string;
  description: ReactNode;
  footer?: ReactNode;
  className?: string;
  children?: ReactNode;
}

/** The group dialogs' common frame: icon tile, title, body, footer. */
export function DialogShell(props: DialogShellProps) {
  const {
    busy = false,
    children,
    className,
    description,
    footer,
    icon: Icon,
    onClose,
    open,
    title,
    tone = 'sky',
  } = props;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !busy) onClose();
      }}
    >
      <DialogContent className={cn('max-w-lg gap-0 p-0', className)}>
        <DialogHeader className="border-b p-5">
          <div className="flex items-start gap-3">
            <span
              className={cn(
                'flex size-11 shrink-0 items-center justify-center rounded-xl border',
                tone === 'danger'
                  ? 'border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300'
                  : 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
              )}
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {children && <div className="grid gap-4 p-5">{children}</div>}

        {footer && (
          <DialogFooter className="gap-2 border-t p-5 sm:justify-end">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function DialogError(props: { message?: string }) {
  if (!props.message) return null;

  return (
    <p className="text-sm text-red-600 dark:text-red-300" role="alert">
      {props.message}
    </p>
  );
}

export function Field(props: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}) {
  const { children, hint, label, required } = props;

  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-primary/80">
        {label}
        {required && <span className="font-bold text-red-500">*</span>}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
