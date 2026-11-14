import type { ReactNode } from 'react';
import { useState } from 'react';

import { Check, ChevronsUpDown, SearchIcon } from 'lucide-react';

import useResizeObserver from '@/shared/libs/react-hooks/useResizeObserver';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/presentation/atoms/Popover';

import { filterComboboxItems } from './filter';

export default function Combobox<V>(props: ComboboxProps<V>) {
  const {
    classNameButton,
    items,
    placeholder,
    value,
    size = 'default',
    searchPlaceholder,
    emptySearchText,
    onChange,
  } = props;
  const searchable = searchPlaceholder !== undefined;
  const [query, setQuery] = useState('');
  const visibleItems = searchable
    ? filterComboboxItems(items ?? [], query)
    : items;

  const [popoverWidth, setPopoverWidth] = useState(0);

  const refButton = useResizeObserver<HTMLButtonElement>((entries) => {
    setPopoverWidth(Math.floor(entries[0]?.borderBoxSize[0]?.inlineSize || 0));
  });

  const [open, setOpen] = useState(false);

  const cnButton = cn(
    'w-[200px] justify-between dark:bg-secondary dark:hover:bg-accent',
    classNameButton,
  );
  const cnButtonText = cn({
    'opacity-50': !value,
    'text-xs': size === 'sm',
  });

  const selectedItemLabel = items?.find(
    (framework) => framework.value === value,
  )?.label;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setQuery('');
      }}
    >
      <PopoverTrigger asChild>
        <Button
          ref={refButton}
          // Opening the list must not submit the form it sits in.
          type="button"
          buttonStyle="outline"
          buttonColor="secondary"
          size={size === 'sm' ? 'sm' : 'default'}
          role="combobox"
          aria-expanded={open}
          className={cnButton}
        >
          <p className={cnButtonText}>
            {value ? selectedItemLabel : placeholder}
          </p>
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: popoverWidth }}>
        <div className="p-1 w-full flex flex-col gap-1.5 max-h-80 overflow-y-auto">
          {searchable && (
            <label className="sticky top-0 z-10 flex min-h-9 items-center gap-2 rounded-md border bg-popover px-2.5 focus-within:border-accent">
              <SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden />
              <input
                type="text"
                // Typing goes straight to the list, as in any combobox.
                autoFocus
                className="w-full bg-transparent text-sm outline-hidden"
                placeholder={searchPlaceholder}
                aria-label={searchPlaceholder}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  const first = visibleItems?.[0];
                  if (event.key === 'Enter' && first) {
                    event.preventDefault();
                    onChange?.(first.value);
                    setOpen(false);
                    setQuery('');
                  }
                }}
              />
            </label>
          )}
          {searchable && visibleItems?.length === 0 && (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">
              {emptySearchText}
            </p>
          )}
          {visibleItems?.map((item) => {
            return (
              <Button
                type="button"
                className="min-h-8 h-max py-1"
                key={String(item.value)}
                buttonStyle="ghost"
                buttonColor="secondary"
                size="sm"
                onClick={() => {
                  onChange?.(item.value);
                  setOpen(false);
                  setQuery('');
                }}
              >
                <p className="w-full text-start flex flex-col">
                  <span>{item.label}</span>

                  {item.description && <span>{item.description}</span>}
                </p>
                <Check
                  className={cn(
                    'ml-auto',
                    value === item.value ? 'opacity-100' : 'opacity-0',
                  )}
                />
              </Button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ComboboxProps<V> {
  classNameButton?: string;
  items?: Array<ComboboxItem<V>>;
  placeholder?: string;
  value?: V;
  onChange?: (value: V) => void;
  size?: 'default' | 'sm';
  /** Turns on a search box at the top of the list, with this hint. */
  searchPlaceholder?: string;
  /** Shown when the search matches nothing. */
  emptySearchText?: string;
}

export interface ComboboxItem<V> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
  /** Text the search box matches, for a label that is not plain text. */
  searchText?: string;
}
