import { useDevetekTranslations } from '@/services/i18n';

import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

const KNOWN_STATUSES = [
  'pending',
  'queued',
  'running',
  'succeeded',
  'failed',
  'cancelled',
  'expired',
] as const;

type KnownStatus = (typeof KNOWN_STATUSES)[number];

const TONE: Record<KnownStatus, { tone: StatusTone; pulse: boolean }> = {
  pending: { tone: 'neutral', pulse: true },
  queued: { tone: 'neutral', pulse: true },
  running: { tone: 'info', pulse: true },
  succeeded: { tone: 'success', pulse: false },
  failed: { tone: 'danger', pulse: false },
  cancelled: { tone: 'warning', pulse: false },
  expired: { tone: 'warning', pulse: false },
};

function normalize(status: string): KnownStatus | undefined {
  const value = status.toLowerCase();
  return KNOWN_STATUSES.find((known) => known === value);
}

/** The state of a group operation or one of its targets, as a pill. */
export function OperationStatusPill(props: {
  status: string;
  size?: 'sm' | 'md';
}) {
  const { size, status } = props;
  const t = useDevetekTranslations('page.serverGroups.operationStatus');
  const known = normalize(status);
  const meta = known ? TONE[known] : { tone: 'neutral' as const, pulse: false };

  return (
    <StatusPill
      size={size}
      tone={meta.tone}
      pulse={meta.pulse}
      label={known ? t(known) : status || t('unknown')}
    />
  );
}
