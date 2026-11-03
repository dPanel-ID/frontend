import type { KeyboardEvent, MouseEvent } from 'react';
import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ExecutionErrorBanner } from '@/entities/shared/ui/ExecutionErrorBanner';
import { ExecutionErrorDialog } from '@/entities/shared/ui/ExecutionErrorDialog';

import type { SchemaLoadBalancerParts } from '../../rules/schema';

interface LoadBalancerErrorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The load balancer's domain. */
  domain: string;
  state: SchemaLoadBalancerParts.State;
}

/** The full, redacted error detail of a failed load balancer. */
export function LoadBalancerErrorDialog(props: LoadBalancerErrorDialogProps) {
  const { domain, onOpenChange, open, state } = props;
  const t = useDevetekTranslations('page.loadBalancers.failure');

  return (
    <ExecutionErrorDialog
      open={open}
      onOpenChange={onOpenChange}
      title={t('dialogTitle')}
      subject={domain}
      state={state}
    />
  );
}

/**
 * Why a load balancer failed, the way a failed server says it: a banner with
 * the first useful line and a button to the full detail. Renders nothing
 * unless the load balancer failed.
 */
export function LoadBalancerFailure(props: {
  domain: string;
  state: SchemaLoadBalancerParts.State;
  className?: string;
}) {
  const { className, domain, state } = props;
  const t = useDevetekTranslations('page.loadBalancers.failure');
  const [isOpen, setIsOpen] = useState(false);

  if (state.status !== 'failed') return null;

  // The banner sits inside clickable cards; the dialog is portalled, but
  // React still bubbles its clicks through here, so stop them.
  const stop = (event: MouseEvent | KeyboardEvent) => event.stopPropagation();

  return (
    <div className={className} onClick={stop} onKeyDown={stop}>
      <ExecutionErrorBanner
        title={t('title')}
        state={state}
        onClickDetail={() => setIsOpen(true)}
      />
      <LoadBalancerErrorDialog
        open={isOpen}
        onOpenChange={setIsOpen}
        domain={domain}
        state={state}
      />
    </div>
  );
}
