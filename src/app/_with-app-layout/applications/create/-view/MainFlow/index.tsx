import {
  BracesIcon,
  Code2Icon,
  GitBranchIcon,
  Layers3Icon,
  RocketIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { useFlowNav } from '../../-model/flow-nav';
import type { FlowStepKey } from '../../-model/flow-readiness';
import FlowActions from '../../-presentation/FlowActions';
import FlowStepper from '../../-presentation/FlowStepper';
import { useSubmitFlow } from '../../-usecase/submit-flow';
import Step1Source from '../MainWizard/step-1-source';
import Step2Details from '../MainWizard/step-2-details';
import Step3Config from '../MainWizard/step-3-config';
import Step5Env from '../MainWizard/step-5-env';
import Step6Preview from '../MainWizard/step-6-preview';

interface StepMeta {
  icon: LucideIcon;
  labelKey: string;
  descKey: string;
  /** Named in the "why is Continue disabled" hint. */
  blockedKey: string;
  Body: () => React.ReactElement | null;
}

const STEPS: Record<FlowStepKey, StepMeta> = {
  '1-source': {
    icon: GitBranchIcon,
    labelKey: 'step1.title',
    descKey: 'step1.desc',
    blockedKey: 'blocked.source',
    Body: Step1Source,
  },
  '2-server-dependencies': {
    icon: Layers3Icon,
    labelKey: 'step2.title',
    descKey: 'step2.desc',
    blockedKey: 'blocked.server',
    Body: Step2Details,
  },
  '3-details': {
    icon: Code2Icon,
    labelKey: 'step3.title',
    descKey: 'step3.desc',
    blockedKey: 'blocked.details',
    Body: Step3Config,
  },
  '4-env': {
    icon: BracesIcon,
    labelKey: 'step4.title',
    descKey: 'step4.desc',
    blockedKey: 'blocked.env',
    Body: Step5Env,
  },
  '5-preview': {
    icon: RocketIcon,
    labelKey: 'step5.title',
    descKey: 'step5.desc',
    blockedKey: 'blocked.preview',
    Body: Step6Preview,
  },
};

/**
 * One section at a time: where you are, the section, and one row of
 * actions. Showing all five at once made the page far too long to scroll
 * on a phone, so the flow walks again — but with the standard's surfaces,
 * a stepper that marks what is finished, and a single sticky action row
 * rather than a Back/Continue bar above and below every form.
 */
export default function MainFlow() {
  const t = useDevetekTranslations('page.applicationsCreate.progress');
  const tCreate = useDevetekTranslations('page.applicationsCreate');

  const nav = useFlowNav();
  const { isSubmitting, isUpdate, submit } = useSubmitFlow();

  const meta = STEPS[nav.current];
  const Icon = meta.icon;
  const Body = meta.Body;

  const submitLabel = isUpdate
    ? tCreate('actions.update')
    : tCreate('actions.deploy');

  return (
    <div className="flex flex-col gap-4">
      <FlowStepper
        items={nav.steps.map((key, index) => ({
          key,
          label: t(STEPS[key].labelKey),
          done: nav.byStep[key] && index < nav.index,
          reachable: nav.canGoToStep(key),
        }))}
        activeKey={nav.current}
        activeIndex={nav.index}
        positionLabel={t('position', {
          step: nav.index + 1,
          total: nav.steps.length,
        })}
        onSelect={(key) => nav.goToStep(key as FlowStepKey)}
      />

      <section className="relative overflow-hidden rounded-2xl border bg-card">
        <div
          className={cn(
            'pointer-events-none absolute inset-0',
            FLOW_ACCENTS.sky.glow,
          )}
        />

        <header className="relative flex items-start gap-3 border-b p-4 sm:p-5">
          <span
            className={cn(
              'flex size-10 shrink-0 items-center justify-center rounded-xl border',
              FLOW_ACCENTS.sky.icon,
            )}
          >
            <Icon className="size-5" />
          </span>

          <div className="min-w-0">
            <h2 className="text-lg font-bold sm:text-xl">{t(meta.labelKey)}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t(meta.descKey)}
            </p>
          </div>
        </header>

        <div className="relative p-4 sm:p-5">
          <Body />
        </div>
      </section>

      <FlowActions
        isBackHidden={nav.isFirst}
        isBackDisabled={isSubmitting}
        isNextDisabled={nav.isLast ? !nav.ready : !nav.canContinue}
        isNextLoading={nav.isLast && isSubmitting}
        isSubmit={nav.isLast}
        backLabel={tCreate('actions.back')}
        nextLabel={nav.isLast ? submitLabel : tCreate('actions.continue')}
        blockedHint={t(meta.blockedKey)}
        onBack={nav.goToPrevious}
        onNext={() => {
          if (nav.isLast) {
            void submit();
            return;
          }

          nav.goToNext();
        }}
      />
    </div>
  );
}
