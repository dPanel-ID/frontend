import { useDevetekTranslations } from '@/services/i18n';

import {
  APPLICATION_CREATE_STEPS,
  getApplicationCreateStepIndex,
} from '../../-model/progress-steps';
import { useFormStore } from '../../-model/store/form';
import { StepSurface } from '../../-presentation/StepSurface';

import Step1Source from './step-1-source';
import Step2Details from './step-2-details';
import Step3Config from './step-3-config';
import Step5Env from './step-5-env';
import Step6Preview from './step-6-preview';

export default function MainWizard() {
  const [progress] = useFormStore((s) => [s.progress]);
  const t = useDevetekTranslations('page.applicationsCreate.progress');
  const stepIndex = Math.max(0, getApplicationCreateStepIndex(progress));
  const step =
    APPLICATION_CREATE_STEPS[stepIndex] ?? APPLICATION_CREATE_STEPS[0]!;
  let content = null;

  switch (progress) {
    case '1-source':
      content = <Step1Source />;
      break;

    case '2-server-dependencies':
      content = <Step2Details />;
      break;

    case '3-details':
      content = <Step3Config />;
      break;

    case '4-env':
      content = <Step5Env />;
      break;

    case '5-preview':
      content = <Step6Preview />;
      break;

    default:
      return null;
  }

  return (
    <StepSurface
      eyebrow={t('stepLabel', { step: stepIndex + 1 })}
      title={t(step.labelKey)}
      description={t(step.descKey)}
    >
      {content}
    </StepSurface>
  );
}
