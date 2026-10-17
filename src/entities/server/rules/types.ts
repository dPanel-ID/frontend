import type { ReactNode } from 'react';

import type { LucideProps } from 'lucide-react';

import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

export interface ServerStateMetadata {
  color: string;
  /** Color family of the status pill. */
  tone: StatusTone;
  /** True while the state is still changing, so the pill's dot pulses. */
  pulse: boolean;
  /** When true the pill shows the icon instead of the dot. */
  showIcon: boolean;
  icon: (props: LucideProps) => ReactNode;
  i18n: {
    statusLabel: string;
  };
}

export interface ServerProviderMetadata {
  imageSrc: string;
  i18n: {
    label: string;
  };
}
