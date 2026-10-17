import { useState } from 'react';

import { LoaderCircleIcon, PencilIcon, SaveIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell, Field } from './DialogShell';

export function EditGroupDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.edit');
  const { dialog, group, setDialog } = useGroupDetailModel();
  const open = dialog?.kind === 'edit';

  const close = () => setDialog(null);

  return (
    <DialogShell
      open={open}
      onClose={close}
      icon={PencilIcon}
      title={t('title')}
      description={t('description')}
      footer={null}
    >
      {open && group ? <EditGroupForm /> : null}
    </DialogShell>
  );
}

function EditGroupForm() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.edit');
  const { group, refreshDetail, setDialog } = useGroupDetailModel();
  const [name, setName] = useState(group?.name ?? '');
  const [description, setDescription] = useState(group?.description ?? '');
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const close = () => setDialog(null);

  const handleSave = async () => {
    if (!group) return;
    if (!name.trim()) {
      setError(t('nameRequired'));
      return;
    }

    setIsSaving(true);
    setError('');

    const response = await ApiHostGroup.Create.doPatch({
      id: group.id,
      name: name.trim(),
      description: description.trim() || undefined,
    });

    setIsSaving(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshDetail();
  };

  const isDirty =
    name.trim() !== (group?.name ?? '') ||
    description.trim() !== (group?.description ?? '');

  return (
    <>
      <Field label={t('name')} required>
        <Input
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </Field>
      <Field label={t('descriptionLabel')}>
        <TextArea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </Field>
      <DialogError message={error} />
      <div className="flex justify-end gap-2">
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          disabled={isSaving}
          onClick={close}
        >
          {t('cancel')}
        </Button>
        <button
          type="button"
          className={flowCtaClassName('sky')}
          disabled={isSaving || !isDirty || !name.trim()}
          onClick={handleSave}
        >
          {isSaving ? (
            <LoaderCircleIcon className="size-4 animate-spin" />
          ) : (
            <SaveIcon className="size-4" />
          )}
          {isSaving ? t('saving') : t('save')}
        </button>
      </div>
    </>
  );
}
