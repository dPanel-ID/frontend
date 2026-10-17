import { LoaderCircleIcon, SaveIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useServerEditModel } from '../../model';
import { useEmit } from '../../model/events';

export default function Actions() {
  const { isSubmitting, hasChanges, isValid } = useServerEditModel();
  const t = useDevetekTranslations();

  const emit = useEmit();

  const handleClickSubmit = () => {
    emit('#server-edit-sidepanel/form-submit', null);
  };

  const handleClickCancel = () => {
    emit('#server-edit-sidepanel/sidepanel-close', null);
  };

  return (
    <>
      <button
        type="button"
        className={flowCtaClassName('sky', 'w-full py-2.5')}
        onClick={handleClickSubmit}
        disabled={isSubmitting || !hasChanges || !isValid}
      >
        {isSubmitting ? (
          <LoaderCircleIcon className="size-4 animate-spin" />
        ) : (
          <SaveIcon className="size-4" />
        )}
        {t('common.actions.save')}
      </button>
      <Button
        className={cn(hasChanges && 'border-dashed border-amber-500')}
        variant="outline"
        onClick={handleClickCancel}
      >
        {t('common.actions.cancel')}
      </Button>
    </>
  );
}
