import { useState } from 'react';

import {
  LoaderCircleIcon,
  PlayIcon,
  PowerOffIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { clusterEngineLabel } from '@/features/server-groups/shared/lib/cluster';
import { ConsequenceList } from '@/features/server-lifecycle-dialogs';

import { ApiCluster } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell } from './DialogShell';

type ClusterDialogKind =
  | 'clusterInstall'
  | 'clusterUninstall'
  | 'clusterDelete';

const DIALOG_ICONS = {
  clusterInstall: PlayIcon,
  clusterUninstall: PowerOffIcon,
  clusterDelete: Trash2Icon,
} as const;

/** Confirms Install again, Uninstall or Delete of the group's cluster. */
export function ClusterDialogs() {
  const t = useDevetekTranslations('page.serverGroups.cluster.dialogs');
  const { cluster, dialog, group, refreshCluster, refreshDetail, setDialog } =
    useGroupDetailModel();
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const kind: ClusterDialogKind | null =
    dialog?.kind === 'clusterInstall' ||
    dialog?.kind === 'clusterUninstall' ||
    dialog?.kind === 'clusterDelete'
      ? dialog.kind
      : null;
  const isInstall = kind === 'clusterInstall';
  const isUninstall = kind === 'clusterUninstall';
  const Icon = DIALOG_ICONS[kind ?? 'clusterDelete'];

  const close = () => {
    setDialog(null);
    setError('');
  };

  const confirm = async () => {
    if (!cluster || !kind) return;

    setIsBusy(true);
    setError('');

    const response = isInstall
      ? await ApiCluster.Create.doInstall({ id: cluster.id })
      : isUninstall
        ? await ApiCluster.Create.doUninstall({ id: cluster.id })
        : await ApiCluster.Create.doDelete({ id: cluster.id });

    setIsBusy(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshDetail();
    if (isInstall || isUninstall) refreshCluster();
  };

  const name = group?.name ?? '';
  const engine = clusterEngineLabel(cluster?.engine);
  const strong = (chunks: React.ReactNode) => (
    <strong className="text-primary">{chunks}</strong>
  );

  const copy = isInstall
    ? {
        title: t('installTitle'),
        description: t.rich('installDescription', { name, engine, strong }),
        confirm: isBusy ? t('installing') : t('installConfirm'),
        steps: [t('installStep1'), t('installStep2')],
      }
    : isUninstall
      ? {
          title: t('uninstallTitle'),
          description: t.rich('uninstallDescription', { name, engine, strong }),
          confirm: isBusy ? t('uninstalling') : t('uninstallConfirm'),
          steps: [t('uninstallStep1'), t('uninstallStep2')],
        }
      : {
          title: t('deleteTitle'),
          description: t.rich('deleteDescription', { name, strong }),
          confirm: isBusy ? t('deleting') : t('deleteConfirm'),
          steps: [t('deleteStep1'), t('deleteStep2')],
        };

  return (
    <DialogShell
      open={kind !== null}
      onClose={close}
      busy={isBusy}
      icon={Icon}
      tone={isInstall ? 'sky' : 'danger'}
      title={copy.title}
      description={copy.description}
      footer={
        <>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isBusy}
            onClick={close}
          >
            {t('cancel')}
          </Button>
          <Button
            className={
              isInstall ? undefined : 'bg-red-600 text-white hover:bg-red-500'
            }
            disabled={isBusy}
            onClick={confirm}
          >
            {isBusy ? <LoaderCircleIcon className="animate-spin" /> : <Icon />}
            {copy.confirm}
          </Button>
        </>
      }
    >
      <ConsequenceList
        tone={isInstall ? 'info' : 'danger'}
        title={t('happens')}
        items={copy.steps}
      />
      <DialogError message={error} />
    </DialogShell>
  );
}
