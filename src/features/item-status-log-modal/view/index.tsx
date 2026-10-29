import { useMemo, useState } from 'react';

import { useDevetekLocale } from '@/services/i18n';
import { ModalLayoutGeneral as Layout } from '@/services/modal/ui/presentation';

import { LogTable, toParsedLogLines } from '@/widgets/log-viewer';

import type { ItemStatusLogModalProps } from '../rules/types';

/** Status lines in the standard log table, one row per line. */
export default function ItemStatusLogModal(props: ItemStatusLogModalProps) {
  const { logTopicTitle, logTopicMessage, mainLogs, additionalLogs } = props;
  const locale = useDevetekLocale();
  const [nowMs] = useState(() => Date.now());

  const entries = useMemo(
    () =>
      toParsedLogLines(
        [mainLogs, additionalLogs]
          .flatMap((text) => (text ?? '').split('\n'))
          .filter((line) => line.trim())
          .map((line) => ({ line })),
        { fallbackSource: logTopicTitle, locale, nowMs },
      ),
    [additionalLogs, locale, logTopicTitle, mainLogs, nowMs],
  );

  return (
    <Layout maxWidth="960px">
      <Layout.Title
        canClickClose
        title={`${logTopicTitle}'s Status Log`}
        description={logTopicMessage}
      />

      <Layout.Content>
        <div className="overflow-hidden rounded-2xl border bg-card">
          <LogTable
            ariaLabel={`${logTopicTitle}'s Status Log`}
            entries={entries}
            followNewest={false}
            entryDetails="inline"
            className="max-h-[60vh]"
          />
        </div>
      </Layout.Content>
    </Layout>
  );
}
