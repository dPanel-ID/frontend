import { useDevetekTranslations } from '@/services/i18n';

import { useArtifactLogsModal } from '@/features/artifact-logs-modal';
import { useItemStatusLogModal } from '@/features/item-status-log-modal';

import {
  buildStatusKey,
  releaseStatusOfArtifact,
} from '../../-lib/describe-detail';
import { useAppDataModel } from '../../-model/app-data';
import { useEmit } from '../../-model/events';

import { ArtifactCard } from './_presentation';
import type { ArtifactsHistoryListProps } from './types';

export function ArtifactsHistoryList(props: ArtifactsHistoryListProps) {
  const { list, deploymentList, lastDeployment } = props;

  const emit = useEmit();
  const t = useDevetekTranslations('page.applicationDetail');
  const selectedServerId = useAppDataModel((s) => s.selectedServerId);

  const [openArtifactLogsModal] = useArtifactLogsModal();
  const [openItemStatusLogModal] = useItemStatusLogModal();

  return list.map((artifact) => {
    const openLogsForMachine = (machineId: string) => {
      openArtifactLogsModal({
        applicationId: artifact.pointerIds.application,
        artifactId: artifact.id,
        serverId: machineId,
        commitHead: artifact.commitMetadata.head,
      });
    };

    const related = deploymentList.filter(
      (d) => d.pointerIds.artifact === artifact.id,
    );

    const logsOptions =
      related.length > 1
        ? related.map((d) => ({
            label: d.serverSnapshot.hostName,
            machineId: d.pointerIds.machine,
            onClick: () => openLogsForMachine(d.pointerIds.machine),
          }))
        : undefined;

    const artifactMachineId =
      artifact.pointerIds.machine !== 'unknown'
        ? artifact.pointerIds.machine
        : undefined;
    const fallbackMachineId = selectedServerId || artifactMachineId;
    const canOpenLogs = Boolean(
      related[0]?.pointerIds.machine || fallbackMachineId,
    );

    const handleClickLogs = () => {
      if (related.length === 0) {
        if (fallbackMachineId) openLogsForMachine(fallbackMachineId);
        return;
      }
      const machine = related[0]?.pointerIds.machine;
      if (machine) openLogsForMachine(machine);
    };

    const releaseStatus = releaseStatusOfArtifact({ artifact, lastDeployment });

    // The same words as the badge: the build's own state ("Passed") and the
    // release's ("Releasing"), never a raw "Status: ready" beside them.
    const handleClickStatus = () => {
      openItemStatusLogModal({
        logTopicTitle: t('statusLog.title'),
        logTopicMessage: t('statusLog.commit', {
          commit: artifact.commitMetadata.head.slice(0, 7),
        }),
        mainLogs: [
          t('statusLog.build', {
            status: t(`buildStatus.${buildStatusKey(artifact.state.status)}`),
          }),
          t('statusLog.release', {
            status: t(`releaseStatus.${releaseStatus}`),
          }),
        ].join('\n'),
        additionalLogs: artifact.state.message,
      });
    };

    const handleClickDelete = () => {
      emit('@applications::detail/artifact-delete', {
        artifactId: artifact.id,
      });
    };

    const handleClickRollback = () => {
      emit('@applications::detail/artifact-rollback', {
        commitHead: artifact.commitMetadata.head,
        artifactId: artifact.id,
        applicationId: artifact.pointerIds.application,
      });
    };

    const isUsed = related.length > 0;
    const isDeploying = related.some((d) => d.state.status === 'progress');

    return (
      <ArtifactCard
        key={artifact.id}
        data={artifact}
        releaseStatus={releaseStatus}
        isUsed={isUsed}
        isDeploying={isDeploying}
        onClickLogs={handleClickLogs}
        logsDisabled={!canOpenLogs}
        logsOptions={logsOptions}
        onClickStatus={handleClickStatus}
        onClickDelete={handleClickDelete}
        onClickRollback={handleClickRollback}
      />
    );
  });
}
