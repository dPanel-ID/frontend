import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { ApiApplication } from '@/shared/api';

import type { ArtifactLogsModalProps } from '../rules/types';

import LogViewer from './LogViewer';

const ARTIFACT_LOG_LINE_COUNT = 1000;

const Content = (props: ArtifactLogsModalProps) => {
  const { applicationId, artifactId, serverId } = props;
  const t = useDevetekTranslations('page.applicationDetail.artifactsHistory');

  const [responseLog] = ApiApplication.Logs.$Id.useGet({
    applicationId,
    artifactId,
    machineId: serverId,
    line: ARTIFACT_LOG_LINE_COUNT,
    options: {
      refreshIntervalMs: 2000,
    },
  });

  const buffer =
    responseLog.$status === 'success'
      ? responseLog.join('\n')
      : responseLog.$status === 'loading' && responseLog.prevData
        ? responseLog.prevData.join('\n')
        : '';

  return <LogViewer ariaLabel={t('artifactLogOutput')} log={buffer} />;
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
