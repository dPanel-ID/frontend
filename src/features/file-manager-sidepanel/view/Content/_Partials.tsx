import { RocketIcon } from 'lucide-react';

import { Spinner } from '@/shared/presentation/atoms/Spinner';

import type { PlaceholderStateProps } from './types';

export function PlaceholderState(props: PlaceholderStateProps) {
  const { variant } = props;

  switch (variant) {
    case 'initial':
      return (
        <div className="flex h-full w-full flex-col items-center justify-center px-6 text-center">
          <div className="flex size-16 items-center justify-center rounded-lg border border-dashed bg-background">
            <RocketIcon className="size-8 text-muted-foreground" />
          </div>

          <p className="mt-4 text-sm font-medium text-muted-foreground">
            Please select a directory first.
          </p>
        </div>
      );

    case 'loading':
      return (
        <div className="flex h-full items-center justify-center">
          <Spinner />
        </div>
      );
  }
}
