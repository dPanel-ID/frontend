import useProgressCta from '../../../-model/progress-cta';
import { CtaBar } from '../../../-presentation/CtaBar';

import { SectionSourceGithub } from './SectionSourceGithub';

export default function Step1Source() {
  const { goToNext, goToPrevious, isPreviousHidden, isNextDisabled } =
    useProgressCta();

  return (
    <div className="flex flex-col gap-4">
      <CtaBar
        placement="top"
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isNextDisabled}
        isPreviousHidden={isPreviousHidden}
      />

      <SectionSourceGithub />

      <CtaBar
        goToNext={goToNext}
        goToPrevious={goToPrevious}
        isNextDisabled={isNextDisabled}
        isPreviousHidden={isPreviousHidden}
      />
    </div>
  );
}
