import { LoaderCircleIcon, PlusIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useServerFirewallRuleModel } from '../../model';
import { useEmit } from '../../model/events';

export default function Actions() {
  const { hasChanges, isSubmitting, isValid } = useServerFirewallRuleModel();
  const t = useDevetekTranslations();
  const emit = useEmit();

  return (
    <>
      <button
        type="button"
        className={flowCtaClassName('sky', 'w-full py-2.5')}
        onClick={() =>
          emit('#server-firewall-rule-sidepanel/form-submit', null)
        }
        disabled={isSubmitting || !hasChanges || !isValid}
      >
        {isSubmitting ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <PlusIcon className="size-4" />
        )}
        {t('sidepanel.firewallRule.submit')}
      </button>
      <Button
        className={cn(hasChanges && 'border-dashed border-amber-500')}
        variant="outline"
        onClick={() =>
          emit('#server-firewall-rule-sidepanel/sidepanel-close', null)
        }
      >
        {t('common.actions.cancel')}
      </Button>
    </>
  );
}
