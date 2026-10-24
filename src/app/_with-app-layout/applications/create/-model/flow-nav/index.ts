import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useFlowReadiness } from '../flow-readiness';
import type { FlowStepKey } from '../flow-readiness';
import { useFormStore } from '../store/form';

export interface FlowNav {
  /** The sections this flow shows, in order. */
  steps: FlowStepKey[];
  current: FlowStepKey;
  /** Zero-based position of `current` within `steps`. */
  index: number;
  isFirst: boolean;
  isLast: boolean;
  /** Whether each section has what it needs. */
  byStep: Record<FlowStepKey, boolean>;
  /** True once every section is satisfied, so the flow can be submitted. */
  ready: boolean;
  /** False while the current section is still missing something. */
  canContinue: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
  /** Jumping is allowed backwards, and forwards only over finished sections. */
  goToStep: (step: FlowStepKey) => void;
  canGoToStep: (step: FlowStepKey) => boolean;
}

/**
 * One section at a time, with the readiness rules deciding what is done.
 *
 * Showing every section at once made the page very long, which reads badly
 * on a phone, so the flow walks step by step again. What it keeps from the
 * other shape is honesty: the stepper marks what is finished, and Continue
 * says why it is disabled rather than just being grey.
 */
export function useFlowNav(): FlowNav {
  const [progress, setProgress] = useFormStore((s) => [
    s.progress,
    s.setProgress,
  ]);

  const { byStep, ready, steps } = useFlowReadiness();

  const rawIndex = steps.indexOf(progress as FlowStepKey);
  const index = rawIndex < 0 ? 0 : rawIndex;
  const current = steps[index]!;

  const canGoToStep = (step: FlowStepKey) => {
    const target = steps.indexOf(step);
    if (target < 0) return false;
    if (target <= index) return true;

    // Forwards only once everything in between is satisfied.
    return steps.slice(index, target).every((key) => byStep[key]);
  };

  const goToStep = useHandler((step: FlowStepKey) => {
    if (!canGoToStep(step)) return;
    setProgress(step);
  });

  const goToNext = useHandler(() => {
    const next = steps[index + 1];
    if (!next || !byStep[current]) return;
    setProgress(next);
  });

  const goToPrevious = useHandler(() => {
    const previous = steps[index - 1];
    if (!previous) return;
    setProgress(previous);
  });

  return {
    steps,
    current,
    index,
    isFirst: index === 0,
    isLast: index === steps.length - 1,
    byStep,
    ready,
    canContinue: byStep[current],
    goToNext,
    goToPrevious,
    goToStep,
    canGoToStep,
  };
}
