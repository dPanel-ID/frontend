import { Fragment } from 'react';

import { cn } from '@/shared/libs/tailwind/cn';

import type { ToolbarButtonGroupProps as Props } from './types';

export default function ToolbarButtonGroup(props: Props) {
  const { actions } = props;

  const allDisabled = actions.find((action) => !action.isDisabled) == null;

  const cnContainer = cn(
    'flex h-9 shrink-0 items-center overflow-hidden rounded-lg border bg-card transition-all',
    !allDisabled && 'shadow-sm',
  );

  const cnButtonBase = cn(
    'flex items-center justify-center h-full p-1',
    'transition-all group disabled:cursor-no-drop',
    'data-[l=true]:rounded-l-lg',
    'data-[r=true]:rounded-r-lg',
  );

  const cnIconWrapperBase = cn('data-[active=true]:bg-border p-1 rounded-md');

  const cnSeparatorWrapper = cn(
    'flex h-full w-px items-center bg-border/70 data-[disabled=true]:bg-border/40',
  );

  return (
    <div className={cnContainer}>
      {actions.map((action, index) => {
        const {
          ref,
          ariaLabel,
          isActive,
          icon: Icon,
          iconColor = 'normal',
          isDisabled,
          onClick,
        } = action;

        const cnButton = cn(
          cnButtonBase,
          !isDisabled && 'bg-card active:bg-border/70',
        );

        const cnIconWrapper = cn(
          cnIconWrapperBase,
          !isDisabled && 'group-hover:bg-border/50',
        );

        const cnIconColorNormal = cn(
          'data-[disabled=true]:text-primary/30 text-primary/70 group-hover:text-black data-[active=true]:text-black',
          'data-[disabled=false]:dark:group-hover:text-white data-[active=true]:dark:text-white',
        );

        const cnIconColorDanger = cn(
          'data-[disabled=true]:text-red-500/30 text-red-500/70 group-hover:text-red-500 data-[active=true]:text-red-500',
        );

        const cnIcon = cn('size-5', {
          [cnIconColorNormal]: iconColor === 'normal',
          [cnIconColorDanger]: iconColor === 'danger',
        });

        return (
          <Fragment key={index}>
            <button
              ref={ref}
              type="button"
              aria-label={ariaLabel}
              title={ariaLabel}
              disabled={isDisabled}
              data-l={index === 0}
              data-r={index === actions.length - 1}
              className={cnButton}
              onClick={onClick}
            >
              <span className={cnIconWrapper} data-active={isActive}>
                <Icon
                  data-disabled={isDisabled}
                  data-active={isActive}
                  className={cnIcon}
                />
              </span>
            </button>

            {index < actions.length - 1 && (
              <div className={cnSeparatorWrapper} data-disabled={isDisabled}>
                <div className="w-full h-[60%] bg-border" />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
