import { useDevetekTranslations } from '@/services/i18n';

import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import type { SchemaServerParts } from '../../rules/schema';
import { SERVER_STATE_METADATA } from '../constants/state-metadata';

export interface ServerStatusPillProps {
  state: SchemaServerParts.State;
  size?: 'sm' | 'md';
  /** Opens the status log; the pill becomes a button. */
  onClick?: () => void;
  className?: string;
}

/** The status pill of a server, colored and animated by its state. */
export function ServerStatusPill(props: ServerStatusPillProps) {
  const { className, onClick, size, state } = props;
  const t = useDevetekTranslations();
  const metadata = SERVER_STATE_METADATA[state.status];

  return (
    <StatusPill
      className={className}
      icon={metadata.showIcon ? metadata.icon : undefined}
      label={t(metadata.i18n.statusLabel)}
      onClick={onClick}
      pulse={metadata.pulse}
      size={size}
      title={state.message || undefined}
      tone={metadata.tone}
    />
  );
}
