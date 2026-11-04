import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FolderTreeIcon,
  LoaderCircleIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiCluster } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';
import { FlowStepper } from '@/shared/presentation/organisms/FlowStepper';

import { StepConfigure } from './StepConfigure';
import { StepInstalling } from './StepInstalling';
import { StepReview } from './StepReview';
import { StepType } from './StepType';
import { useNewGroupWizard } from './use-new-group-wizard';
import type { WizardStep } from './use-new-group-wizard';

interface NewGroupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A group was created; open its page on the given tab. */
  onOpenGroup: (groupId: string, tab: 'members' | 'cluster') => void;
  /** A group was created and the wizard closed without opening it. */
  onCreated: () => void;
}

const CLUSTER_STEPS: WizardStep[] = ['type', 'configure', 'review', 'install'];
const GENERIC_STEPS: WizardStep[] = ['type', 'configure', 'review'];

/**
 * Servers → Groups → New group: Type, Configuration, Review and, for a
 * cluster, Installing. Generic groups keep today's behaviour: created empty,
 * then filled from the group page.
 */
export function NewGroupWizard(props: NewGroupWizardProps) {
  const { onCreated, onOpenChange, onOpenGroup, open } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard');

  const [kindsResponse, refreshKinds] = ApiCluster.Kinds.useGet({
    options: { skip: !open },
  });
  const kindsData =
    kindsResponse.$status === 'success'
      ? kindsResponse
      : kindsResponse.$status === 'loading'
        ? kindsResponse.prevData
        : undefined;
  const kinds = kindsData?.kinds ?? [];
  const kindsState =
    kindsResponse.$status === 'failed'
      ? 'failed'
      : kinds.length > 0 || kindsResponse.$status === 'success'
        ? 'ready'
        : 'loading';

  const wizard = useNewGroupWizard(kinds);
  const steps = wizard.kind ? CLUSTER_STEPS : GENERIC_STEPS;
  const stepIndex = steps.indexOf(wizard.step);
  const installing = wizard.step === 'install';

  const close = () => {
    const created = wizard.created;
    onOpenChange(false);
    wizard.reset();
    if (created) onCreated();
  };

  const goNext = () => {
    const next = steps[stepIndex + 1];
    if (next && next !== 'install' && wizard.canContinue) {
      wizard.setError('');
      wizard.setStep(next);
    }
  };

  const goBack = () => {
    const previous = steps[stepIndex - 1];
    if (previous) {
      wizard.setError('');
      wizard.setStep(previous);
    }
  };

  const submit = async () => {
    if (wizard.kind) {
      await wizard.createCluster();
      return;
    }

    const groupId = await wizard.createGeneric();
    if (!groupId) return;
    onOpenChange(false);
    wizard.reset();
    onOpenGroup(groupId, 'members');
  };

  const openCreatedGroup = () => {
    const groupId = wizard.created?.cluster.host_group_id;
    onOpenChange(false);
    wizard.reset();
    if (groupId) onOpenGroup(groupId, 'cluster');
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next || wizard.isSubmitting) return;
        close();
      }}
    >
      <DialogContent className="max-w-3xl gap-0 p-0">
        <DialogHeader className="border-b p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/10 text-sky-600 dark:text-sky-300">
              <FolderTreeIcon className="size-5" />
            </span>
            <div className="min-w-0 text-left">
              <DialogTitle>{t('title')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('description')}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid max-h-[70vh] gap-4 overflow-y-auto p-5">
          <FlowStepper
            items={steps.map((step, index) => ({
              key: step,
              label: t(`steps.${step}`),
              done: index < stepIndex,
              reachable: !installing && index < stepIndex,
            }))}
            activeKey={wizard.step}
            activeIndex={stepIndex}
            positionLabel={t('position', {
              current: stepIndex + 1,
              total: steps.length,
            })}
            onSelect={(key) => {
              const index = steps.indexOf(key as WizardStep);
              if (!installing && index >= 0 && index < stepIndex) {
                wizard.setStep(key as WizardStep);
              }
            }}
          />

          {wizard.step === 'type' && (
            <StepType
              kinds={kinds}
              kindsState={kindsState}
              onRetryKinds={() => refreshKinds()}
              selected={wizard.kindName}
              onSelect={wizard.chooseKind}
            />
          )}
          {wizard.step === 'configure' && <StepConfigure wizard={wizard} />}
          {wizard.step === 'review' && <StepReview wizard={wizard} />}
          {wizard.step === 'install' && wizard.created && (
            <StepInstalling created={wizard.created} />
          )}

          {wizard.error && (
            <p className="text-sm text-red-600 dark:text-red-300" role="alert">
              {wizard.error}
            </p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t p-5 sm:justify-between">
          {installing ? (
            <>
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                onClick={close}
              >
                {t('close')}
              </Button>
              <button
                type="button"
                className={flowCtaClassName('sky')}
                onClick={openCreatedGroup}
              >
                <FolderTreeIcon className="size-4" />
                {t('install.openGroup')}
              </button>
            </>
          ) : (
            <>
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                disabled={wizard.isSubmitting}
                onClick={stepIndex === 0 ? close : goBack}
              >
                {stepIndex > 0 && <ArrowLeftIcon className="size-4" />}
                {stepIndex === 0 ? t('cancel') : t('back')}
              </Button>
              {wizard.step === 'review' ? (
                <button
                  type="button"
                  className={flowCtaClassName('sky')}
                  disabled={wizard.isSubmitting}
                  onClick={submit}
                >
                  {wizard.isSubmitting ? (
                    <LoaderCircleIcon className="size-4 animate-spin" />
                  ) : (
                    <FolderTreeIcon className="size-4" />
                  )}
                  {wizard.isSubmitting
                    ? t('review.creating')
                    : wizard.kind
                      ? t('review.install')
                      : t('review.create')}
                </button>
              ) : (
                <button
                  type="button"
                  className={flowCtaClassName('sky')}
                  disabled={!wizard.canContinue}
                  onClick={goNext}
                >
                  {t('next')}
                  <ArrowRightIcon className="size-4" />
                </button>
              )}
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
