import {
  BracesIcon,
  Code2Icon,
  GitBranchIcon,
  Layers3Icon,
  LockIcon,
  RocketIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { StepCard } from '@/shared/presentation/organisms/StepCard';

import { useFlowReadiness } from '../../-model/flow-readiness';
import type { FlowStepKey } from '../../-model/flow-readiness';
import Step1Source from '../MainWizard/step-1-source';
import Step2Details from '../MainWizard/step-2-details';
import Step3Config from '../MainWizard/step-3-config';
import Step5Env from '../MainWizard/step-5-env';
import Step6Preview from '../MainWizard/step-6-preview';

const STEP_META: Record<
  FlowStepKey,
  { icon: LucideIcon; labelKey: string; descKey: string }
> = {
  '1-source': {
    icon: GitBranchIcon,
    labelKey: 'step1.title',
    descKey: 'step1.desc',
  },
  '2-server-dependencies': {
    icon: Layers3Icon,
    labelKey: 'step2.title',
    descKey: 'step2.desc',
  },
  '3-details': {
    icon: Code2Icon,
    labelKey: 'step3.title',
    descKey: 'step3.desc',
  },
  '4-env': {
    icon: BracesIcon,
    labelKey: 'step4.title',
    descKey: 'step4.desc',
  },
  '5-preview': {
    icon: RocketIcon,
    labelKey: 'step5.title',
    descKey: 'step5.desc',
  },
};

const STEP_BODY: Record<FlowStepKey, () => React.ReactElement | null> = {
  '1-source': Step1Source,
  '2-server-dependencies': Step2Details,
  '3-details': Step3Config,
  '4-env': Step5Env,
  '5-preview': Step6Preview,
};

/**
 * Every section of the flow, all visible at once.
 *
 * This replaces a wizard that showed one step at a time behind Back and
 * Continue. A section whose prerequisites are not met still appears, with
 * its body held back and a line saying which section to finish first — so
 * the shape of the whole job is visible from the start, which is the point
 * of showing readiness rather than steps.
 */
export default function MainFlow() {
  const t = useDevetekTranslations('page.applicationsCreate.progress');

  const { byStep, firstIncomplete, steps } = useFlowReadiness();

  return (
    <div className="flex flex-col gap-4">
      {steps.map((key, index) => {
        const meta = STEP_META[key];
        const Body = STEP_BODY[key];

        // A section opens once everything before it is satisfied.
        const blockedBy = steps
          .slice(0, index)
          .find((earlier) => !byStep[earlier]);

        return (
          <StepCard
            key={key}
            number={index + 1}
            icon={meta.icon}
            title={t(meta.labelKey)}
            description={t(meta.descKey)}
            done={byStep[key] && blockedBy == null}
            active={key === firstIncomplete}
            accent="sky"
          >
            {blockedBy ? (
              <LockedBody
                label={t(STEP_META[blockedBy].labelKey)}
                number={steps.indexOf(blockedBy) + 1}
              />
            ) : (
              <Body />
            )}
          </StepCard>
        );
      })}
    </div>
  );
}

function LockedBody(props: { label: string; number: number }) {
  const { label, number } = props;

  const t = useDevetekTranslations('page.applicationsCreate.progress');

  return (
    <div className="flex items-center gap-3 rounded-xl border border-dashed px-4 py-6">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
        <LockIcon className="size-4" />
      </span>
      <p className="text-sm text-muted-foreground">
        {t('blockedBy', { number, step: label })}
      </p>
    </div>
  );
}
