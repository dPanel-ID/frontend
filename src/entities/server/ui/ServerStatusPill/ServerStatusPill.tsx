import { useDevetekTranslations } from '@/services/i18n';

import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import type { SchemaServerParts } from '../../rules/schema';
import { SERVER_STATE_METADATA } from '../constants/state-metadata';

export interface ServerStatusPillProps {
  state: SchemaServerParts.State;
  size?: 'sm' | 'md';
  /** A private server waiting for its agent reads so instead of "In Progress". */
  awaitingAgent?: boolean;
  /** Opens the status log; the pill becomes a button. */
  onClick?: () => void;
  className?: string;
}

/** The status pill of a server, colored and animated by its state. */
export function ServerStatusPill(props: ServerStatusPillProps) {
  const { awaitingAgent, className, onClick, size, state } = props;
  const t = useDevetekTranslations();
  const metadata = SERVER_STATE_METADATA[state.status];
  const waiting = awaitingAgent && state.status === 'progress';

  return (
    <StatusPill
      className={className}
      icon={metadata.showIcon ? metadata.icon : undefined}
      label={
        waiting
          ? t('common.terms.waitingForAgent')
          : t(metadata.i18n.statusLabel)
      }
      onClick={onClick}
      pulse={metadata.pulse}
      size={size}
      title={
        waiting
          ? t('common.terms.waitingForAgentHint')
          : state.message || undefined
      }
      tone={metadata.tone}
    />
  );
}
