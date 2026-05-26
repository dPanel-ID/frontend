import { PencilLineIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Input } from '@/shared/presentation/atoms/Input';

import useProgressCta from '../../../-model/progress-cta';
import { useFormStore } from '../../../-model/store/form';
import { CtaBar } from '../../../-presentation/CtaBar';
import { Sectioned } from '../../../-presentation/Sectioned';
import { CommandSettingsSection, useCommandPortState } from '../step-4-deploy';

export default function Step3Config() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step3.sectionDetails',
  );
  const { goToNext, goToPrevious, isNextDisabled, isPreviousHidden } =
    useProgressCta();
  const [appName, setAppName] = useFormStore((s) => [s.appName, s.setAppName]);
  const portState = useCommandPortState();
  const isContinueDisabled = isNextDisabled || portState.isPortUsed;

  return (
    <div className="flex flex-col gap-4">
      <CtaBar
        placement="top"
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isContinueDisabled}
        isPreviousHidden={isPreviousHidden}
      />

      <Sectioned
        withinCard
        sectionIcon={PencilLineIcon}
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        classNameContent="grid gap-4"
      >
        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('inputAppName')}</span>
          <Input
            className="w-full"
            placeholder={t('inputAppNamePlaceholder')}
            value={appName}
            onChange={(event) => setAppName(event.target.value)}
          />
        </label>
      </Sectioned>

      <CommandSettingsSection portState={portState} />

      <CtaBar
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isContinueDisabled}
        isPreviousHidden={isPreviousHidden}
      />
    </div>
  );
}
