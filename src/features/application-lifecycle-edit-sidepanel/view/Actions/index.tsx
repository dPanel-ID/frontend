import { LoaderCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';

import { useApplicationLifecycleEditModel } from '../../model';
import { useEmit } from '../../model/events';

export default function Actions() {
  const { isSubmitting, hasChanges, hasErrors } =
    useApplicationLifecycleEditModel();
  const t = useDevetekTranslations();
  const emit = useEmit();

  return (
    <>
      <Button
        onClick={() =>
          emit('#application-lifecycle-edit-sidepanel/form-submit', null)
        }
        disabled={isSubmitting || !hasChanges || hasErrors}
      >
        {isSubmitting ? (
          <LoaderCircleIcon className="animate-spin" />
        ) : (
          t('common.actions.save')
        )}
      </Button>
      <Button
        className={cn(hasChanges && 'border-dashed border-yellow-500')}
        variant="outline"
        onClick={() =>
          emit('#application-lifecycle-edit-sidepanel/sidepanel-close', null)
        }
      >
        {t('common.actions.cancel')}
      </Button>
    </>
  );
}
