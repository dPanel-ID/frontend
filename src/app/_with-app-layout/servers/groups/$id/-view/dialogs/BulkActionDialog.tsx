import { useState } from 'react';

import {
  CpuIcon,
  LoaderCircleIcon,
  PlayIcon,
  RefreshCwIcon,
  RotateCcwIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { isSemanticReleaseTag } from '@/features/server-groups/shared/lib/validation';
import { ConsequenceList } from '@/features/server-lifecycle-dialogs';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell, Field } from './DialogShell';

const ICONS = {
  inventory: RefreshCwIcon,
  reboot: RotateCcwIcon,
  upgrade: CpuIcon,
} as const;

/** Confirms an inventory refresh, reboot or agent upgrade for the group. */
export function BulkActionDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.bulk');
  const {
    canRunActions,
    dialog,
    group,
    groupId,
    refreshDetail,
    setDialog,
    showOperation,
  } = useGroupDetailModel();
  const action = dialog?.kind === 'bulk' ? dialog.action : null;
  const [version, setVersion] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    setDialog(null);
    setVersion('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!action || !canRunActions) return;
    if (action === 'upgrade' && !isSemanticReleaseTag(version)) {
      setError(t('upgrade.versionHint'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await ApiHostGroup.Operation.$Id.doPost({
      id: groupId,
      action,
      payload: action === 'upgrade' ? { version: version.trim() } : {},
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshDetail();
    if (response.operation_id) showOperation(response.operation_id);
  };

  const Icon = action ? ICONS[action] : PlayIcon;
  const memberCount = group?.memberCount ?? 0;

  return (
    <DialogShell
      open={action != null}
      onClose={close}
      busy={isSubmitting}
      icon={Icon}
      title={action ? t(`${action}.title`) : ''}
      description={t('targets', { count: memberCount })}
      footer={
        <>
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            disabled={isSubmitting}
            onClick={close}
          >
            {t('cancel')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('sky')}
            disabled={
              isSubmitting ||
              (action === 'upgrade' && !isSemanticReleaseTag(version))
            }
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <PlayIcon className="size-4" />
            )}
            {isSubmitting ? t('queueing') : t('queue')}
          </button>
        </>
      }
    >
      {action && (
        <ConsequenceList
          tone="info"
          numbered
          title={t(`${action}.happens`)}
          items={[t(`${action}.step1`), t(`${action}.step2`)]}
        />
      )}
      {action === 'upgrade' && (
        <Field
          label={t('upgrade.version')}
          hint={t('upgrade.versionHint')}
          required
        >
          <Input
            autoFocus
            value={version}
            placeholder={t('upgrade.versionPlaceholder')}
            onChange={(event) => setVersion(event.target.value)}
          />
        </Field>
      )}
      <DialogError message={error} />
    </DialogShell>
  );
}
