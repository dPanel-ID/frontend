import { CheckIcon, FolderOpenIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useFileManagerSidepanel } from '@/features/file-manager-sidepanel';
import { useFilePreviewSidepanel } from '@/features/file-preview-sidepanel';

import { cn } from '@/shared/libs/tailwind/cn';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { useServerDataModel } from '../../../-model/server-data';

/**
 * The file manager needs the whole screen, so this tab introduces it and
 * opens the panel rather than squeezing a tree and a table into a page.
 */
export default function FilesTab() {
  const t = useDevetekTranslations('page.serverDetail.files');
  const [serverId] = useServerDataModel((s) => [s.serverId]);
  const [openFileManagerSidepanel] = useFileManagerSidepanel();
  const [openFilePreviewSidepanel] = useFilePreviewSidepanel();

  const handleOpen = () => {
    openFileManagerSidepanel({
      serverId,
      onPreviewFile: (fullPath, selectedFile) => {
        openFilePreviewSidepanel({
          $mode: 'push',
          selectedFileFullPath: fullPath,
          selectedFile,
          serverId,
        });
      },
    });
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />
      <div className="relative grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="flex items-start gap-4">
          <span
            className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-xl border',
              FLOW_ACCENTS.sky.icon,
            )}
          >
            <FolderOpenIcon className="size-6" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-bold">{t('title')}</h2>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-muted-foreground">
              {t('description')}
            </p>
            <ul className="mt-3 grid gap-1.5 text-sm">
              {(['browse', 'upload', 'preview'] as const).map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckIcon className="size-4 shrink-0 text-emerald-500" />
                  {t(`features.${feature}`)}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <button
          type="button"
          className={flowCtaClassName('sky', 'w-full lg:w-auto')}
          onClick={handleOpen}
        >
          <FolderOpenIcon className="size-4" />
          {t('open')}
        </button>
      </div>
    </section>
  );
}
