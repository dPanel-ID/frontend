import type { ReactNode } from 'react';

import type { LucideIcon } from 'lucide-react';

interface Props {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: ReactNode;
}

/** A centred notice for states where the conversation cannot be shown. */
export default function PanelNotice(props: Props) {
  const { icon: Icon, title, body, action } = props;

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-2 text-center">
      <span className="flex size-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-200">
        <Icon className="size-5" aria-hidden />
      </span>
      <h4 className="text-base font-bold">{title}</h4>
      <p className="max-w-[32ch] text-sm text-muted-foreground">{body}</p>
      {action}
    </div>
  );
}
