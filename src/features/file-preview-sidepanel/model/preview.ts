import { useMemo } from 'react';

import { ApiFolder } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import {
  LS_ORGANIZATION_ID,
  normalizeWorkspaceOrganizationId,
} from '@/shared/libs/api-client/config';
import buildSelector from '@/shared/libs/react-factories/buildSelector';

import { FILEMATCH_REGISTRY } from '../config';
import type { PreviewConfig } from '../config';
import type { FilePreviewSidepanelProps as Props } from '../rules/types';

import { useSubscribe } from './events';

export const [PreviewModelProvider, usePreviewModel] = buildSelector(
  'FileManagerSidepanelPreviewModel',
)((props: Props) => {
  const { serverId, selectedFile, selectedFileFullPath } = props;

  const matchedConfig = useMemo(() => {
    for (const [k, v] of Object.entries(FILEMATCH_REGISTRY)) {
      const matcher = new RegExp(k);

      if (matcher.test(selectedFile.name)) {
        return v;
      }
    }
  }, [selectedFile.name]);

  const previewConfig = useMemo<PreviewConfig>(
    () => matchedConfig ?? { kind: 'code' },
    [matchedConfig],
  );

  const [responseFileContent, getFileContent] =
    ApiFolder.Origin.$ServerId.Content.useGet({
      serverId,
      fileFullName: selectedFile.name,
      fullFolderPath: selectedFileFullPath,
      options: {
        skip: previewConfig.kind !== 'code',
      },
    });

  const imagePreviewURL = useMemo(() => {
    if (previewConfig.kind !== 'image-blob') return undefined;

    const queryParams = new URLSearchParams({
      workdir: selectedFileFullPath,
      file: selectedFile.name,
    });

    if (typeof window !== 'undefined') {
      const organizationId = normalizeWorkspaceOrganizationId(
        window.localStorage.getItem(LS_ORGANIZATION_ID),
      );

      if (organizationId) {
        queryParams.set('organization_id', organizationId);
      }
    }

    return `${import.meta.env.VITE_BACKEND}/v1/folder/origin/${serverId}/download?${queryParams.toString()}`;
  }, [previewConfig.kind, selectedFile.name, selectedFileFullPath, serverId]);

  useSubscribe('#file-preview-sidepanel/preview-get', () => {
    getFileContent();
  });

  const fileContent = useAdapter(responseFileContent, (raw) => {
    return {
      content: raw.content,
    };
  });

  return {
    fileContent,
    imagePreviewURL,
    matchedConfig: previewConfig,
  };
});
