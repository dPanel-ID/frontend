import { useEffect, useMemo, useState } from 'react';

import { DownloadIcon, EyeIcon } from 'lucide-react';

import type { SchemaFilesystemContent } from '@/entities/file-manager/rules/schema';

import { iife } from '@/shared/libs/browser/fn';
import { useBreakpoint } from '@/shared/libs/react-hooks/useBreakpoint';
import { Button } from '@/shared/presentation/atoms/Button';
import { Dropdown } from '@/shared/presentation/atoms/Dropdown';
import { FailedState } from '@/widgets/failed-state';

import { useBrowserModel } from '../../model/browser';
import { useEmit } from '../../model/events';
import { useFilesystemModel } from '../../model/filesystem';
import FilesystemBrowser from '../_presentation/FilesystemBrowser';
import PathBreadcrumb from '../_presentation/PathBreadcrumb';

import { PlaceholderState } from './_Partials';

export default function Content() {
  const emit = useEmit();
  const mobileMode = !useBreakpoint('sm', false);

  const [selectedItem, searchQuery, viewMode] = useBrowserModel((s) => [
    s.selectedItem,
    s.searchQuery,
    s.viewMode,
  ]);
  const [registry, basePath, currentFullPath] = useFilesystemModel((s) => [
    s.registry,
    s.basePath,
    s.history.currentFullPath,
  ]);

  const [deferredSearchQuery, setDeferredSearchQuery] = useState('');
  const [actionMenuItem, setActionMenuItem] =
    useState<SchemaFilesystemContent | null>(null);
  const [actionMenuTarget, setActionMenuTarget] =
    useState<HTMLButtonElement | null>(null);
  const [actionMenuFullPath, setActionMenuFullPath] = useState<string | null>(
    null,
  );

  const refActionMenuTarget = useMemo(
    () => ({ current: actionMenuTarget }),
    [actionMenuTarget],
  );

  const isActionMenuOpen =
    actionMenuItem?.kind === 'file' && actionMenuFullPath === currentFullPath;

  if (!searchQuery && deferredSearchQuery) {
    setDeferredSearchQuery('');
  }

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDeferredSearchQuery(searchQuery);
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchQuery]);

  const closeActionMenu = () => {
    setActionMenuItem(null);
    setActionMenuTarget(null);
    setActionMenuFullPath(null);
  };

  const handleClickBrowserItem = (
    content: SchemaFilesystemContent,
    target: HTMLButtonElement,
  ) => {
    emit('#file-manager-sidepanel/browser-select-item', content);

    if (content.kind === 'file') {
      setActionMenuTarget(target);
      setActionMenuItem(content);
      setActionMenuFullPath(currentFullPath);
      return;
    }

    closeActionMenu();
  };

  const handleDoubleClickBrowserItem = (content: SchemaFilesystemContent) => {
    closeActionMenu();

    if (content.kind === 'folder') {
      emit(
        '#file-manager-sidepanel/filesystem-history-navigate-to',
        `${currentFullPath}/${content.name}`,
      );
    } else {
      emit('#file-manager-sidepanel/tool-selected-file-preview', content);
    }
  };

  const handleClickCopyPath = () => {
    emit('#file-manager-sidepanel/tool-current-path-copy', null);
  };

  const handleClickBrowserBackground = () => {
    emit('#file-manager-sidepanel/browser-select-item', null);
    closeActionMenu();
  };

  const handleClickFooterSegments = (newPath: string) => {
    closeActionMenu();
    emit('#file-manager-sidepanel/filesystem-history-navigate-to', newPath);
  };

  const handleClickPreviewFile = () => {
    if (!actionMenuItem || actionMenuItem.kind !== 'file') return;

    emit('#file-manager-sidepanel/tool-selected-file-preview', actionMenuItem);
    closeActionMenu();
  };

  const handleClickDownloadFile = () => {
    if (!actionMenuItem || actionMenuItem.kind !== 'file') return;

    emit('#file-manager-sidepanel/tool-selected-file-download', actionMenuItem);
    closeActionMenu();
  };

  const elContent = iife(() => {
    if (!currentFullPath) {
      return <PlaceholderState variant="initial" />;
    }

    const currentFolderMeta = registry.get(currentFullPath);
    if (currentFolderMeta == null) {
      return <PlaceholderState variant="loading" />;
    }

    if (currentFolderMeta.status !== 'success') {
      return (
        <FailedState.WallCentered
          errorPayload={currentFolderMeta.error.message}
        />
      );
    }

    return (
      <FilesystemBrowser
        contents={currentFolderMeta.contents}
        searchQuery={deferredSearchQuery}
        selectedItem={selectedItem}
        viewMode={mobileMode ? 'grid' : viewMode}
        onItemClick={handleClickBrowserItem}
        onItemDoubleClick={handleDoubleClickBrowserItem}
        onClickBackground={handleClickBrowserBackground}
      />
    );
  });

  return (
    <div className="h-full rounded-tl-xl bg-card grid grid-rows-[1fr_auto] overflow-hidden">
      {elContent}

      <Dropdown
        refTarget={refActionMenuTarget}
        isOpen={isActionMenuOpen}
        position="bottom"
        alignment="left"
        gapInPx={4}
        onClickOutside={closeActionMenu}
      >
        <div className="flex w-44 flex-col gap-1 p-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleClickPreviewFile}
          >
            <EyeIcon />
            Open
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="justify-start"
            onClick={handleClickDownloadFile}
          >
            <DownloadIcon />
            Download
          </Button>
        </div>
      </Dropdown>

      <div className="min-h-12 border-t grid grid-cols-[1fr_auto] overflow-hidden overflow-x-auto w-full">
        <PathBreadcrumb
          basePath={basePath}
          selectedFileName={
            selectedItem?.kind === 'file' ? selectedItem.name : undefined
          }
          fullPath={currentFullPath || basePath}
          onClickSegments={handleClickFooterSegments}
          onClickCopy={handleClickCopyPath}
        />
      </div>
    </div>
  );
}
