import { useMemo, useState } from 'react';

import type { LifecycleView } from '@/entities/application/lib/lifecycle';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { lifecycleErrors } from '../rules/form-schema';
import type { ApplicationLifecycleEditSidepanelProps } from '../rules/types';

export const [
  ApplicationLifecycleEditModelProvider,
  useApplicationLifecycleEditModel,
] = buildContext(
  'ApplicationLifecycleEditModel',
  (props: ApplicationLifecycleEditSidepanelProps) => {
    const { onSuccess = () => {} } = props;
    const [draft, setDraft] = useState<LifecycleView>(props.lifecycle);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const errors = useMemo(
      () => lifecycleErrors({ ...draft, hasPort: props.hasPort }),
      [draft, props.hasPort],
    );
    const hasChanges = useMemo(
      () => JSON.stringify(draft) !== JSON.stringify(props.lifecycle),
      [draft, props.lifecycle],
    );

    return {
      props,
      draft,
      setDraft,
      errors,
      hasErrors: Object.keys(errors).length > 0,
      hasChanges,
      isSubmitting,
      setIsSubmitting,
      onSuccess,
    };
  },
);
