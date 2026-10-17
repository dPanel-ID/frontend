import { cn } from '@/shared/libs/tailwind/cn';

/** Color family of a flow: sky for cloud, violet for your own server. */
export type FlowAccent = 'sky' | 'violet';

export interface FlowAccentClasses {
  /** Radial glow laid over a card's background. */
  glow: string;
  /** Hover border for cards that act as links. */
  border: string;
  /** Icon tile. */
  icon: string;
  /** Pill badge. */
  badge: string;
  /** Primary call to action. */
  cta: string;
  /** Ring and border of a selected choice. */
  selected: string;
  /** Hover state of a selectable choice. */
  hover: string;
  /** Focus ring. */
  ring: string;
  /** Accent text. */
  text: string;
}

export const FLOW_ACCENTS: Record<FlowAccent, FlowAccentClasses> = {
  sky: {
    glow: 'bg-[radial-gradient(120%_80%_at_0%_0%,rgba(56,189,248,0.16),transparent_60%)]',
    border: 'hover:border-sky-400/40',
    icon: 'border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300',
    badge: 'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    cta: 'bg-sky-500 text-white hover:bg-sky-400 dark:bg-sky-400 dark:text-sky-950 dark:hover:bg-sky-300 focus-visible:ring-sky-400',
    selected:
      'border-sky-400/70 bg-sky-500/10 shadow-sm shadow-sky-500/10 ring-1 ring-sky-400/40',
    hover: 'hover:border-sky-400/50 hover:bg-sky-500/5',
    ring: 'focus-visible:ring-sky-400/50',
    text: 'text-sky-600 dark:text-sky-300',
  },
  violet: {
    glow: 'bg-[radial-gradient(120%_80%_at_0%_0%,rgba(167,139,250,0.14),transparent_60%)]',
    border: 'hover:border-violet-400/40',
    icon: 'border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
    badge:
      'border-violet-400/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
    cta: 'bg-violet-500 text-white hover:bg-violet-400 dark:bg-violet-400 dark:text-violet-950 dark:hover:bg-violet-300 focus-visible:ring-violet-400',
    selected:
      'border-violet-400/70 bg-violet-500/10 shadow-sm shadow-violet-500/10 ring-1 ring-violet-400/40',
    hover: 'hover:border-violet-400/50 hover:bg-violet-500/5',
    ring: 'focus-visible:ring-violet-400/50',
    text: 'text-violet-600 dark:text-violet-300',
  },
};

/** Classes for a flow's primary call to action, as a link or a button. */
export function flowCtaClassName(accent: FlowAccent, className?: string) {
  return cn(
    'group/cta inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    'disabled:cursor-not-allowed disabled:opacity-50',
    FLOW_ACCENTS[accent].cta,
    className,
  );
}
