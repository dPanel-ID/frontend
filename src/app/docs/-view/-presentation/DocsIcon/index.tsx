import {
  AppWindowIcon,
  BoxesIcon,
  Building2Icon,
  CircleHelpIcon,
  ClockIcon,
  CloudIcon,
  CloudUploadIcon,
  DownloadIcon,
  FileTextIcon,
  GaugeIcon,
  GitBranchIcon,
  GlobeIcon,
  HistoryIcon,
  KeyRoundIcon,
  LayoutDashboardIcon,
  LifeBuoyIcon,
  ListChecksIcon,
  LogInIcon,
  NetworkIcon,
  PackagePlusIcon,
  RocketIcon,
  ScrollTextIcon,
  ServerIcon,
  Settings2Icon,
  ShieldCheckIcon,
  SquarePlusIcon,
  SquareTerminalIcon,
  TerminalIcon,
  TimerIcon,
  Trash2Icon,
  UserCogIcon,
  UsersIcon,
  VariableIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/shared/libs/tailwind/cn';
import { CloudProviderLogo } from '@/shared/presentation/molecules/CloudProviderLogo';

import type {
  DocsColor,
  DocsIconName,
  DocsIcon as DocsIconValue,
} from '../../../-rules/content';

const ICONS: Record<DocsIconName, LucideIcon> = {
  'app-window': AppWindowIcon,
  boxes: BoxesIcon,
  'building-2': Building2Icon,
  'circle-help': CircleHelpIcon,
  clock: ClockIcon,
  cloud: CloudIcon,
  'cloud-upload': CloudUploadIcon,
  download: DownloadIcon,
  'file-text': FileTextIcon,
  gauge: GaugeIcon,
  'git-branch': GitBranchIcon,
  globe: GlobeIcon,
  history: HistoryIcon,
  'key-round': KeyRoundIcon,
  'layout-dashboard': LayoutDashboardIcon,
  'life-buoy': LifeBuoyIcon,
  'list-checks': ListChecksIcon,
  'log-in': LogInIcon,
  network: NetworkIcon,
  'package-plus': PackagePlusIcon,
  rocket: RocketIcon,
  'scroll-text': ScrollTextIcon,
  server: ServerIcon,
  'settings-2': Settings2Icon,
  'shield-check': ShieldCheckIcon,
  'square-plus': SquarePlusIcon,
  'square-terminal': SquareTerminalIcon,
  terminal: TerminalIcon,
  timer: TimerIcon,
  'trash-2': Trash2Icon,
  'user-cog': UserCogIcon,
  users: UsersIcon,
  variable: VariableIcon,
};

/**
 * Each section's accent, as whole class names so Tailwind can see them.
 * `icon` tints a page's icon, `tile` fills a section's icon tile, and
 * `active` marks the page being read.
 */
export const DOCS_COLOR_CLASSES: Record<
  DocsColor,
  { icon: string; tile: string; active: string }
> = {
  sky: {
    icon: 'text-sky-600 dark:text-sky-300',
    tile: 'bg-sky-500/15 text-sky-600 ring-sky-500/25 dark:text-sky-300',
    active: 'bg-sky-500/10 text-sky-700 ring-sky-500/30 dark:text-sky-200',
  },
  indigo: {
    icon: 'text-indigo-600 dark:text-indigo-300',
    tile: 'bg-indigo-500/15 text-indigo-600 ring-indigo-500/25 dark:text-indigo-300',
    active:
      'bg-indigo-500/10 text-indigo-700 ring-indigo-500/30 dark:text-indigo-200',
  },
  violet: {
    icon: 'text-violet-600 dark:text-violet-300',
    tile: 'bg-violet-500/15 text-violet-600 ring-violet-500/25 dark:text-violet-300',
    active:
      'bg-violet-500/10 text-violet-700 ring-violet-500/30 dark:text-violet-200',
  },
  emerald: {
    icon: 'text-emerald-600 dark:text-emerald-300',
    tile: 'bg-emerald-500/15 text-emerald-600 ring-emerald-500/25 dark:text-emerald-300',
    active:
      'bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-200',
  },
  amber: {
    icon: 'text-amber-600 dark:text-amber-300',
    tile: 'bg-amber-500/15 text-amber-600 ring-amber-500/25 dark:text-amber-300',
    active:
      'bg-amber-500/10 text-amber-700 ring-amber-500/30 dark:text-amber-200',
  },
  teal: {
    icon: 'text-teal-600 dark:text-teal-300',
    tile: 'bg-teal-500/15 text-teal-600 ring-teal-500/25 dark:text-teal-300',
    active: 'bg-teal-500/10 text-teal-700 ring-teal-500/30 dark:text-teal-200',
  },
  rose: {
    icon: 'text-rose-600 dark:text-rose-300',
    tile: 'bg-rose-500/15 text-rose-600 ring-rose-500/25 dark:text-rose-300',
    active: 'bg-rose-500/10 text-rose-700 ring-rose-500/30 dark:text-rose-200',
  },
};

interface DocsIconProps {
  icon?: DocsIconValue;
  color: DocsColor;
  className?: string;
}

/**
 * A page's or a section's icon, in its section's colour. A cloud provider's
 * page shows the provider's own logo instead, which readers find faster than
 * any glyph.
 */
export function DocsIcon(props: DocsIconProps) {
  const { className, color, icon } = props;

  if (icon?.startsWith('provider:')) {
    return (
      <CloudProviderLogo
        provider={icon.slice('provider:'.length)}
        className={cn('size-4 rounded p-0 shadow-none', className)}
      />
    );
  }

  const Icon = icon ? ICONS[icon as DocsIconName] : undefined;
  if (!Icon) {
    return (
      <span
        aria-hidden
        className={cn('size-4 shrink-0 rounded-full bg-current/20', className)}
      />
    );
  }

  return (
    <Icon
      aria-hidden
      className={cn(
        'size-4 shrink-0',
        DOCS_COLOR_CLASSES[color].icon,
        className,
      )}
    />
  );
}
