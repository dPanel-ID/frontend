import { useMemo, useState } from 'react';

import type { LifecycleView } from '@/entities/application/lib/lifecycle';
import {
  parseSharedPathsText,
  releaseFoldersErrors,
} from '@/entities/application/lib/release-folders';
import type { ReleaseFoldersView } from '@/entities/application/lib/release-folders';

import { buildContext } from '@/shared/libs/react-factories/buildContext';

import { lifecycleErrors } from '../rules/form-schema';
import type { ApplicationLifecycleEditSidepanelProps } from '../rules/types';

/** Release folders as the form edits them: shared paths one per line. */
export interface ReleaseFoldersDraft {
  enabled: boolean;
  sharedPathsText: string;
  keepReleases: number;
}

function toFoldersView(draft: ReleaseFoldersDraft): ReleaseFoldersView {
  return {
    enabled: draft.enabled,
    sharedPaths: parseSharedPathsText(draft.sharedPathsText),
    keepReleases: draft.keepReleases,
  };
}

export const [
  ApplicationLifecycleEditModelProvider,
  useApplicationLifecycleEditModel,
] = buildContext(
  'ApplicationLifecycleEditModel',
  (props: ApplicationLifecycleEditSidepanelProps) => {
    const { onSuccess = () => {} } = props;
    const [draft, setDraft] = useState<LifecycleView>(props.lifecycle);
    const [foldersDraft, setFoldersDraft] = useState<ReleaseFoldersDraft>({
      enabled: props.releaseFolders.enabled,
      sharedPathsText: props.releaseFolders.sharedPaths.join('\n'),
      keepReleases: props.releaseFolders.keepReleases,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const folders = useMemo(() => toFoldersView(foldersDraft), [foldersDraft]);

    const errors = useMemo(
      () => ({
        ...lifecycleErrors({ ...draft, hasPort: props.hasPort }),
        ...Object.fromEntries(
          Object.entries(releaseFoldersErrors(folders)).map(([key, value]) => [
            `releaseFolders.${key}`,
            value,
          ]),
        ),
      }),
      [draft, folders, props.hasPort],
    );
    const hasChanges = useMemo(
      () =>
        JSON.stringify(draft) !== JSON.stringify(props.lifecycle) ||
        JSON.stringify(folders) !== JSON.stringify(props.releaseFolders),
      [draft, folders, props.lifecycle, props.releaseFolders],
    );

    return {
      props,
      draft,
      setDraft,
      foldersDraft,
      setFoldersDraft,
      folders,
      errors,
      hasErrors: Object.keys(errors).length > 0,
      hasChanges,
      isSubmitting,
      setIsSubmitting,
      onSuccess,
    };
  },
);
