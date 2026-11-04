import { useState } from 'react';

import { LoaderCircleIcon, PowerOffIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ConsequenceList } from '@/features/server-lifecycle-dialogs';

import { ApiCluster } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell } from './DialogShell';

type ClusterDialogKind = 'clusterUninstall' | 'clusterDelete';

/** Confirms Uninstall or Delete of the group's cluster. */
export function ClusterDialogs() {
  const t = useDevetekTranslations('page.serverGroups.cluster.dialogs');
  const { cluster, dialog, group, refreshCluster, refreshDetail, setDialog } =
    useGroupDetailModel();
  const [error, setError] = useState('');
  const [isBusy, setIsBusy] = useState(false);

  const kind: ClusterDialogKind | null =
    dialog?.kind === 'clusterUninstall' || dialog?.kind === 'clusterDelete'
      ? dialog.kind
      : null;
  const isUninstall = kind === 'clusterUninstall';

  const close = () => {
    setDialog(null);
    setError('');
  };

  const confirm = async () => {
    if (!cluster || !kind) return;

    setIsBusy(true);
    setError('');

    const response = isUninstall
      ? await ApiCluster.Create.doUninstall({ id: cluster.id })
      : await ApiCluster.Create.doDelete({ id: cluster.id });

    setIsBusy(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshDetail();
    if (isUninstall) refreshCluster();
  };

  const name = group?.name ?? '';
  const strong = (chunks: React.ReactNode) => (
    <strong className="text-primary">{chunks}</strong>
  );

  return (
    <DialogShell
      open={kind !== null}
      onClose={close}
      busy={isBusy}
      icon={isUninstall ? PowerOffIcon : Trash2Icon}
      tone="danger"
      title={isUninstall ? t('uninstallTitle') : t('deleteTitle')}
      description={
        isUninstall
          ? t.rich('uninstallDescription', {
              name,
              engine: cluster?.engine ?? '',
              strong,
            })
          : t.rich('deleteDescription', { name, strong })
      }
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
            className="bg-red-600 text-white hover:bg-red-500"
            disabled={isBusy}
            onClick={confirm}
          >
            {isBusy ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : isUninstall ? (
              <PowerOffIcon />
            ) : (
              <Trash2Icon />
            )}
            {isUninstall
              ? isBusy
                ? t('uninstalling')
                : t('uninstallConfirm')
              : isBusy
                ? t('deleting')
                : t('deleteConfirm')}
          </Button>
        </>
      }
    >
      <ConsequenceList
        tone="danger"
        title={t('happens')}
        items={
          isUninstall
            ? [t('uninstallStep1'), t('uninstallStep2')]
            : [t('deleteStep1'), t('deleteStep2')]
        }
      />
      <DialogError message={error} />
    </DialogShell>
  );
}
