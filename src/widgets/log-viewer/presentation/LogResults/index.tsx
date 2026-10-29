import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { DataPanelState } from '@/shared/presentation/organisms/DataPanel';

import type { LogFilters } from '../../usecase/use-log-filters';
import LogLevelFilter from '../LogLevelFilter';
import LogTable from '../LogTable';
import type { LogTableProps } from '../LogTable';

interface LogResultsProps extends Omit<LogTableProps, 'entries'> {
  filters: LogFilters;
}

/**
 * Level chips over the standard log table, or a "nothing matches" state with
 * a way back when the filters hide every line.
 */
export default function LogResults(props: LogResultsProps) {
  const { filters, scrollResetKey, ...tableProps } = props;

  const t = useDevetekTranslations('common.logViewer');
  const tCommon = useDevetekTranslations('common.dataPanel');

  return (
    <>
      <LogLevelFilter filters={filters} />

      {filters.filteredEntries.length === 0 ? (
        <DataPanelState
          state="empty"
          title={t('noMatch')}
          action={
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              onClick={filters.clearFilters}
            >
              {tCommon('clearSearch')}
            </Button>
          }
        />
      ) : (
        <LogTable
          {...tableProps}
          entries={filters.filteredEntries}
          scrollResetKey={`${scrollResetKey ?? ''}:${filters.activeLevel}:${filters.search}`}
        />
      )}
    </>
  );
}
