import { useState } from 'react';

import { ScrollTextIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import { usePublicEndpoint } from '../../../-usecase/public-url';
import AppLogs from '../../AppLogs';

import LoadBalancerLogs from './LoadBalancerLogs';

type LogSource = 'runtime' | 'loadBalancer';

/**
 * Two things can produce logs for an application: the service itself and
 * the load balancer in front of it. The second source only appears when
 * there is actually a load balancer attached — a tab that opens onto a
 * permanent "nothing here" is not worth the click.
 */
export default function LogsTab() {
  const t = useDevetekTranslations('page.applicationDetail.logs');

  const [source, setSource] = useState<LogSource>('runtime');

  const loadBalancer = usePublicEndpoint();

  const sources: LogSource[] = loadBalancer
    ? ['runtime', 'loadBalancer']
    : ['runtime'];

  return (
    <div className="flex flex-col gap-4">
      {sources.length > 1 && (
        <div
          role="group"
          aria-label={t('sourceLabel')}
          className="inline-flex w-max items-center gap-1 rounded-xl border bg-card/60 p-1"
        >
          {sources.map((one) => {
            const isActive = one === source;

            return (
              <button
                key={one}
                type="button"
                aria-pressed={isActive}
                onClick={() => setSource(one)}
                className={cn(
                  'inline-flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                  isActive
                    ? 'bg-background text-primary shadow-sm ring-1 ring-sky-400/40'
                    : 'text-muted-foreground hover:bg-background/60 hover:text-primary',
                )}
              >
                <ScrollTextIcon className="size-4" />
                {t(one)}
              </button>
            );
          })}
        </div>
      )}

      {source === 'loadBalancer' && loadBalancer ? (
        <LoadBalancerLogs
          loadBalancerId={loadBalancer.id}
          domain={loadBalancer.domain}
        />
      ) : (
        <AppLogs />
      )}
    </div>
  );
}
