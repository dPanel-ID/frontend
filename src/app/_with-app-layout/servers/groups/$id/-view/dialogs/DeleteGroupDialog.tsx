import { useState } from 'react';

import { useNavigate } from '@tanstack/react-router';
import { LoaderCircleIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ConsequenceList } from '@/features/server-lifecycle-dialogs';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell } from './DialogShell';

export function DeleteGroupDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.delete');
  const navigate = useNavigate();
  const { dialog, group, setDialog } = useGroupDetailModel();
  const open = dialog?.kind === 'delete';
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const close = () => {
    setDialog(null);
    setError('');
  };

  const handleDelete = async () => {
    if (!group) return;

    setIsDeleting(true);
    setError('');

    const response = await ApiHostGroup.Create.doDelete({ id: group.id });

    setIsDeleting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    navigate({ to: '/servers/groups' });
  };

  return (
    <DialogShell
      open={open}
      onClose={close}
      busy={isDeleting}
      icon={Trash2Icon}
      tone="danger"
      title={t('title')}
      description={t.rich('description', {
        name: group?.name ?? '',
        strong: (chunks) => <strong className="text-primary">{chunks}</strong>,
      })}
      footer={
        <>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isDeleting}
            onClick={close}
          >
            {t('cancel')}
          </Button>
          <Button
            className="bg-red-600 text-white hover:bg-red-500"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? (
              <LoaderCircleIcon className="animate-spin" />
            ) : (
              <Trash2Icon />
            )}
            {isDeleting ? t('deleting') : t('confirm')}
          </Button>
        </>
      }
    >
      <ConsequenceList
        tone="danger"
        title={t('happens')}
        items={[t('servers'), t('history')]}
      />
      <DialogError message={error} />
    </DialogShell>
  );
}
