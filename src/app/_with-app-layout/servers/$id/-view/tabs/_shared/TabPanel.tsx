import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { SearchIcon, XIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { buildPaginationV2 } from '@/widgets/ui-atomic-builder/atom-pagination-v2';

/** Rows per page on tabs that paginate in the browser. */
export const TAB_PAGE_SIZE = 10;

interface TabPanelProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Buttons on the right of the header; the primary one goes last. */
  actions?: ReactNode;
  /** Three or four `StatTile size="sm"` summaries. */
  tiles?: ReactNode;
  /** Search, filters and a count; rendered in one row above the content. */
  toolbar?: ReactNode;
  /** Pagination and totals, under the content. */
  footer?: ReactNode;
  children: ReactNode;
}

/**
 * The anatomy every tab shares: header, summary tiles, toolbar, content,
 * footer. Tabs differ in data, never in structure, so switching between
 * them feels like staying on one page.
 */
export function TabPanel(props: TabPanelProps) {
  const {
    actions,
    children,
    description,
    footer,
    icon: Icon,
    tiles,
    title,
    toolbar,
  } = props;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
            <Icon className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-bold leading-tight">{title}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {description}
            </p>
          </div>
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            {actions}
          </div>
        )}
      </header>

      {tiles && (
        <div className="grid grid-cols-2 gap-2 border-t bg-background/40 p-3 sm:grid-cols-3 lg:grid-cols-4">
          {tiles}
        </div>
      )}

      {toolbar && (
        <div className="flex flex-col gap-2 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
          {toolbar}
        </div>
      )}

      <div className="border-t">{children}</div>

      {footer && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
          {footer}
        </div>
      )}
    </section>
  );
}

/** The search box every toolbar starts with. */
export function TabSearch(props: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  const { onChange, placeholder, value } = props;
  const t = useDevetekTranslations('page.serverDetail.tabsCommon');

  return (
    <label className="relative w-full sm:w-80">
      <span className="sr-only">{placeholder}</span>
      <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        className="h-9 pl-9 pr-8"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          aria-label={t('clearSearch')}
          title={t('clearSearch')}
          onClick={() => onChange('')}
          className="absolute right-2 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-primary"
        >
          <XIcon className="size-3.5" />
        </button>
      )}
    </label>
  );
}

/** Small right-aligned text in a toolbar or footer, for counts. */
export function TabMeta(props: { children: ReactNode }) {
  return <p className="text-xs text-muted-foreground">{props.children}</p>;
}

/** Loading, empty and failed states, all the same height and tone. */
export function TabState(props: {
  state: 'loading' | 'empty' | 'failed';
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  const { action, description, state, title } = props;

  return (
    <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 py-10 text-center">
      {state === 'loading' && <Spinner />}
      <div>
        <p
          className={cn(
            'text-sm font-semibold',
            state === 'failed' ? 'text-red-600 dark:text-red-300' : undefined,
          )}
        >
          {title}
        </p>
        {description && (
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

/** A retry button for failed states. */
export function TabRetry(props: { onClick: () => void }) {
  const t = useDevetekTranslations('page.serverDetail.tabsCommon');

  return (
    <Button
      buttonStyle="outline"
      buttonColor="secondary"
      size="sm"
      onClick={props.onClick}
    >
      {t('retry')}
    </Button>
  );
}

/** Table cell classes shared by every tab, so columns line up alike. */
export const tabTable = {
  head: 'h-auto bg-background/60 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground',
  cell: 'px-4 py-2.5 text-sm',
  mutedCell: 'px-4 py-2.5 text-sm text-muted-foreground',
  monoCell: 'px-4 py-2.5 font-mono text-xs',
};

const Pagination = buildPaginationV2({});

/** Footer pagination; renders nothing with a single page. */
export function TabPagination(props: {
  page: number;
  totalPage: number;
  onPageChange: (page: number) => void;
}) {
  const { onPageChange, page, totalPage } = props;
  const t = useDevetekTranslations('page.serverDetail.tabsCommon');

  if (totalPage <= 1) return null;

  return (
    <>
      <TabMeta>{t('pageOf', { page, total: totalPage })}</TabMeta>
      <Pagination
        alwaysShowPaginationRows
        currentPage={page}
        totalPage={totalPage}
        onClickBack={() => onPageChange(Math.max(1, page - 1))}
        onClickForward={() => onPageChange(Math.min(totalPage, page + 1))}
        onPageChange={onPageChange}
      />
    </>
  );
}

/** Browser-side paging over a list; the page resets when the list changes. */
export function usePagedList<T>(items: T[], pageSize = TAB_PAGE_SIZE) {
  // Remember which list the page belongs to, so a new list starts at page 1
  // without an effect.
  const [pageState, setPageState] = useState({ items, page: 1 });
  const totalPage = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(
    pageState.items === items ? pageState.page : 1,
    totalPage,
  );
  const pageItems = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  );

  return {
    page,
    totalPage,
    pageItems,
    setPage: (next: number) => setPageState({ items, page: next }),
  };
}
