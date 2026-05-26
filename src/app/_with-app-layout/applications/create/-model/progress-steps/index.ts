import {
  BracesIcon,
  Code2Icon,
  GitBranchIcon,
  Layers3Icon,
  RocketIcon,
} from 'lucide-react';

import type { Progress } from '../store/form.types';

export const APPLICATION_CREATE_STEPS: Array<{
  key: Progress;
  icon: typeof GitBranchIcon;
  labelKey: string;
  descKey: string;
}> = [
  {
    key: '1-source',
    icon: GitBranchIcon,
    labelKey: 'step1.title',
    descKey: 'step1.desc',
  },
  {
    key: '2-server-dependencies',
    icon: Layers3Icon,
    labelKey: 'step2.title',
    descKey: 'step2.desc',
  },
  {
    key: '3-details',
    icon: Code2Icon,
    labelKey: 'step3.title',
    descKey: 'step3.desc',
  },
  {
    key: '4-env',
    icon: BracesIcon,
    labelKey: 'step4.title',
    descKey: 'step4.desc',
  },
  {
    key: '5-preview',
    icon: RocketIcon,
    labelKey: 'step5.title',
    descKey: 'step5.desc',
  },
];

export function getApplicationCreateStepIndex(progress: Progress) {
  return APPLICATION_CREATE_STEPS.findIndex((step) => step.key === progress);
}
