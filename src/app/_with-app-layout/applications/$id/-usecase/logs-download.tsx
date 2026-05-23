import useHandler from '@/shared/libs/react-hooks/useHandler';

import {
  LS_ORGANIZATION_ID,
  normalizeWorkspaceOrganizationId,
} from '@/shared/libs/api-client/config';

import { useAppLogsModel } from '../-model/app-logs';

export default function useLogsDownloadUsecase() {
  const [logMetadata, logFilename] = useAppLogsModel((s) => [
    s.logMetadata,
    s.logFilename,
  ]);

  const handleUsecase = useHandler(() => {
    const orgId = normalizeWorkspaceOrganizationId(
      window.localStorage.getItem(LS_ORGANIZATION_ID),
    );
    if (!logFilename || !logMetadata || !orgId) return;

    const { appName, serverId, userName } = logMetadata;

    const workdir = `/home/${userName}/logs/${appName}`;

    window.open(
      `${import.meta.env.VITE_BACKEND}/v1/folder/origin/${serverId}/download?workdir=${encodeURIComponent(workdir)}&file=${encodeURIComponent(logFilename)}&organization_id=${encodeURIComponent(orgId)}`,
    );
  });

  return [handleUsecase] as const;
}
