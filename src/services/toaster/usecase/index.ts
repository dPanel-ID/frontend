import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useToasterEmit } from '../model/toasterEvent';
import type { PushToast, ToasterItem, ToasterVariant } from '../rules/types';

export function useToaster() {
  const emit = useToasterEmit();

  // A function declaration here compiles to a memo slot the first render never
  // fills, so `useHandler` captures `undefined` and every later call throws.
  // Keep this an arrow function assigned to a const.
  const stablePushToast = useHandler(
    (param1: ToasterItem | ToasterVariant, param2?: string) => {
      if (typeof param1 === 'object') {
        emit('%%toaster/push', param1);
        return;
      }

      emit('%%toaster/push', {
        message: param2,
        variant: param1,
        duration: 3000,
      });
    },
  ) as PushToast;

  const closeAllToasts = useHandler(() => {
    emit('%%toaster/clear-all', null);
  });

  return [stablePushToast, closeAllToasts] as const;
}
