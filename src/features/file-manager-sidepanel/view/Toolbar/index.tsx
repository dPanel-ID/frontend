import { useRef, useState } from 'react';

import {
  BellIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  DownloadIcon,
  EyeIcon,
  FolderPlusIcon,
  GridIcon,
  ListIcon,
  TrashIcon,
  UploadIcon,
} from 'lucide-react';

import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import { SearchInput } from '@/shared/presentation/atoms/SearchInput';

import { useBrowserModel } from '../../model/browser';
import { useEmit } from '../../model/events';
import { useFilesystemModel } from '../../model/filesystem';
import type { ViewMode } from '../../rules/types';
import ToolbarButtonGroup from '../_presentation/Toolbar/ButtonGroup';

import DeletePopup from './DeletePopup';
import NewFolderPopup from './NewFolderPopup';
import OperationsPopup from './OperationsPopup';

export default function Toolbar() {
  const emit = useEmit();
  const mobileMode = !useBreakpoint('sm', false);

  const [refButtonDelete, setRefButtonDelete] =
    useState<HTMLButtonElement | null>(null);

  const [refButtonOperations, setRefButtonOperations] =
    useState<HTMLButtonElement | null>(null);

  const refNewFolderPopup = useRef<HTMLButtonElement | null>(null);

  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);

  const [selectedItem, searchQuery, viewMode] = useBrowserModel((s) => [
    s.selectedItem,
    s.searchQuery,
    s.viewMode,
  ]);

  const [currentFullPath, canGoBack, canGoForward] = useFilesystemModel((s) => [
    s.history.currentFullPath,
    s.history.canGoBack,
    s.history.canGoForward,
  ]);

  const handleClickViewMode = (newViewMode: ViewMode) => {
    return () => {
      emit('#file-manager-sidepanel/browser-view-mode', newViewMode);
    };
  };

  const handleClickBack = () => {
    emit('#file-manager-sidepanel/filesystem-history-navigate', 'back');
  };

  const handleClickForward = () => {
    emit('#file-manager-sidepanel/filesystem-history-navigate', 'forward');
  };

  const handleClickPreview = () => {
    emit('#file-manager-sidepanel/tool-selected-file-preview', null);
  };

  const handleClickDownload = () => {
    emit('#file-manager-sidepanel/tool-selected-file-download', null);
  };

  const handleClickUpload = () => {
    emit('#file-manager-sidepanel/tool-current-path-upload', null);
  };

  const handleClickNewFolder = () => {
    setIsNewFolderOpen((prev) => !prev);
  };

  return (
    <>
      <div className="flex items-center w-full overflow-hidden overflow-x-auto">
        <div className="w-full min-w-max flex items-center gap-4 px-2 py-3.5">
          <ToolbarButtonGroup
            actions={[
              {
                ariaLabel: 'Go back',
                icon: ChevronLeftIcon,
                isDisabled: !canGoBack,
                onClick: handleClickBack,
              },
              {
                ariaLabel: 'Go forward',
                icon: ChevronRightIcon,
                isDisabled: !canGoForward,
                onClick: handleClickForward,
              },
            ]}
          />

          {!mobileMode && (
            <ToolbarButtonGroup
              actions={[
                {
                  ariaLabel: 'Grid view',
                  isActive: viewMode === 'grid',
                  icon: GridIcon,
                  onClick: handleClickViewMode('grid'),
                },
                {
                  ariaLabel: 'List view',
                  isActive: viewMode === 'table',
                  icon: ListIcon,
                  onClick: handleClickViewMode('table'),
                },
              ]}
            />
          )}

          <div className="grow shrink-0" />

          {selectedItem != null && (
            <ToolbarButtonGroup
              actions={[
                {
                  ariaLabel: 'Preview selected file',
                  icon: EyeIcon,
                  isDisabled: selectedItem.kind !== 'file',
                  onClick: handleClickPreview,
                },
                {
                  ariaLabel: 'Download selected file',
                  icon: DownloadIcon,
                  isDisabled: selectedItem.kind !== 'file',
                  onClick: handleClickDownload,
                },
                {
                  ariaLabel: 'Delete selected item',
                  ref: setRefButtonDelete,
                  icon: TrashIcon,
                  iconColor: 'danger',
                  isDisabled: false,
                },
              ]}
            />
          )}

          <div className="grow shrink-0" />

          <ToolbarButtonGroup
            actions={[
              {
                ariaLabel: 'Upload files',
                icon: UploadIcon,
                isDisabled: !currentFullPath,
                onClick: handleClickUpload,
              },
              {
                ariaLabel: 'New folder',
                icon: FolderPlusIcon,
                ref: refNewFolderPopup,
                onClick: handleClickNewFolder,
              },
              {
                ariaLabel: 'File operations',
                icon: BellIcon,
                ref: setRefButtonOperations,
              },
            ]}
          />
        </div>

        <SearchInput
          classNameWrapper="min-w-[200px]"
          value={searchQuery}
          onChange={(value) => {
            emit('#file-manager-sidepanel/browser-search-query', value);
          }}
        />
      </div>

      <DeletePopup refTarget={refButtonDelete} />
      <NewFolderPopup
        refTarget={refNewFolderPopup}
        isOpen={isNewFolderOpen}
        onOpenChange={setIsNewFolderOpen}
      />
      <OperationsPopup refTarget={refButtonOperations} />
    </>
  );
}
