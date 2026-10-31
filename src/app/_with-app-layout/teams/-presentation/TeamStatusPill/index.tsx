import { useDevetekTranslations } from '@/services/i18n';

import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import type { StatusTone } from '@/shared/presentation/molecules/StatusPill';

const STATUS_TONES: Record<string, StatusTone> = {
  active: 'success',
  pending: 'info',
  suspended: 'warning',
  inactive: 'neutral',
  deleted: 'danger',
};

/** A team's status: active teams are green, anything else says what it is. */
export function TeamStatusPill(props: {
  status?: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { className, size = 'sm', status } = props;
  const t = useDevetekTranslations('page.teams.status');

  if (!status) return null;

  const key = status.trim().toLowerCase();
  const tone = STATUS_TONES[key] ?? 'neutral';

  return (
    <StatusPill
      className={className}
      size={size}
      tone={tone}
      label={key in STATUS_TONES ? t(key) : status}
    />
  );
}
