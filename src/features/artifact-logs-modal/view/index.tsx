import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { FailedState } from '@/widgets/failed-state';

import type { ArtifactLogsModalProps } from '../rules/types';

import LogViewer from './LogViewer';

const BUILD_LOG_LINE_LIMIT = 100;

const Content = (props: ArtifactLogsModalProps) => {
  const { applicationId, artifactId, serverId } = props;
  const t = useDevetekTranslations('page.applicationDetail.artifactsHistory');

  const [responseLog, refreshLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    artifactId,
    limit: BUILD_LOG_LINE_LIMIT,
    machineId: serverId,
    options: {
      refreshIntervalMs: 2000,
    },
  });
  const responseLogLines = useAdapter(
    responseLog,
    ApiApplication.Logs.$Id.normalizeLogLines,
  );

  const buffer =
    responseLogLines.$status === 'success'
      ? responseLogLines
      : responseLogLines.$status === 'loading' && responseLogLines.prevData
        ? responseLogLines.prevData
        : [];

  if (responseLogLines.$status === 'failed') {
    return <FailedState.BannerRetryable onClickRetry={refreshLog} />;
  }

  return (
    <LogViewer
      ariaLabel={t('artifactLogOutput')}
      emptyLabel={t('artifactLogEmpty')}
      lineLimit={BUILD_LOG_LINE_LIMIT}
      lines={buffer}
    />
  );
};

export default function ArtifactLogsModal(props: ArtifactLogsModalProps) {
  const { commitHead } = props;
  const t = useDevetekTranslations('page.applicationDetail.artifactsHistory');

  return (
    <ModalLayoutGeneral maxWidth="1280px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('artifactLogsTitle')}
        description={t('artifactLogsDescription', { commit: commitHead })}
      />

      <ModalLayoutGeneral.Content className="min-h-0 overflow-hidden">
        <Content {...props} />
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
