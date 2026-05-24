import type { MouseEventHandler } from 'react';
import { useRef } from 'react';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';

import type { BaseButtonProps, GridItemProps, RowItemProps } from './types';

export const CN_CONTENT_ITEM_BASE = cn(
  'text-primary',
  'data-[selected=true]:bg-border! data-[selected=true]:text-primary! transition-all',
  'hover:bg-border/50 select-none',
);

export const RowHeader = () => (
  <div className="grid grid-cols-[minmax(220px,2.5fr)_96px_140px_140px] gap-x-2 border-b bg-background/60 px-4 py-2">
    <p className="flex items-center pl-6 text-[11px] font-semibold uppercase text-muted-foreground">
      Name
    </p>
    <p className="flex items-center text-[11px] font-semibold uppercase text-muted-foreground">
      Size
    </p>
    <p className="flex items-center text-[11px] font-semibold uppercase text-muted-foreground">
      Kind
    </p>
    <p className="flex items-center text-[11px] font-semibold uppercase text-muted-foreground">
      Last Modified
    </p>
  </div>
);

const BaseButton = (props: BaseButtonProps) => {
  const { children, onClick, onDoubleClick, ...rest } = props;

  const refLastTap = useRef(0);
  const refTapTimeout = useRef<number | null>(null);

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const target = e.currentTarget;
    const now = Date.now();
    const diff = now - refLastTap.current;

    if (diff < 250) {
      if (refTapTimeout.current) {
        clearTimeout(refTapTimeout.current);
      }

      onDoubleClick?.(target);
    } else {
      refTapTimeout.current = window.setTimeout(() => {
        onClick?.(target);
      }, 250);
    }

    refLastTap.current = now;
  };

  return (
    <button
      {...rest}
      onClick={handleClick}
      onDoubleClick={(e) => e.preventDefault()}
    >
      {children}
    </button>
  );
};

export const RowItem = (props: RowItemProps) => {
  const {
    icon: Icon,
    isOdd,
    isSelected,
    contentName,
    contentFileSizeFormatted,
    contentLastUpdated,
    contentFileExtension,
    onClick,
    onDoubleClick,
  } = props;

  const cnContentItemTable = cn(
    CN_CONTENT_ITEM_BASE,
    'w-full rounded-md px-2 py-1.5 text-left text-primary data-[odd=true]:bg-background group',
    'grid grid-cols-[minmax(220px,2.5fr)_96px_140px_140px] gap-x-2 [&>p]:flex [&>p]:items-center',
  );

  return (
    <BaseButton
      className={cnContentItemTable}
      data-odd={isOdd}
      data-selected={isSelected}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <p className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0" />
        <span className="truncate">{contentName}</span>
      </p>

      <p
        className="truncate text-sm text-muted-foreground"
        data-selected={isSelected}
      >
        {contentFileSizeFormatted}
      </p>
      <p
        className="truncate text-sm text-muted-foreground"
        data-selected={isSelected}
      >
        {contentFileExtension}
      </p>
      <p
        className="truncate text-sm text-muted-foreground"
        data-selected={isSelected}
      >
        {getDistanceFromNow(contentLastUpdated)}
      </p>
    </BaseButton>
  );
};

export const GridItem = (props: GridItemProps) => {
  const { contentName, icon: Icon, isSelected, onClick, onDoubleClick } = props;

  const cnContentItemTile = cn(
    CN_CONTENT_ITEM_BASE,
    'flex min-h-24 flex-col items-center justify-center gap-y-2 rounded-lg border bg-background px-2 py-4 text-sm',
  );

  return (
    <BaseButton
      className={cnContentItemTile}
      data-selected={isSelected}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
    >
      <Icon className="size-6 shrink-0" />
      {contentName}
    </BaseButton>
  );
};
