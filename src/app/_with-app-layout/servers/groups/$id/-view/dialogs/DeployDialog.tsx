import { useState } from 'react';

import { HardDriveUploadIcon, LoaderCircleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { useRetainedResponseData } from '@/features/server-groups/usecase/use-retained-response-data';

import { ApiApplication, ApiArtifact, ApiDeploy } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell, Field } from './DialogShell';

/** Picks an application build and deploys it to every server in the group. */
export function DeployDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.deploy');
  const {
    canRunActions,
    dialog,
    group,
    groupId,
    refreshDetail,
    setDialog,
    showOperation,
  } = useGroupDetailModel();
  const open = dialog?.kind === 'deploy';

  const [applicationId, setApplicationId] = useState('');
  const [artifactId, setArtifactId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [applicationsResponse, refreshApplications] =
    ApiApplication.Find.useGet({
      page: 1,
      limit: 100,
      options: { skip: !open },
    });
  const [artifactsResponse, refreshArtifacts] = ApiArtifact.Find.useGet({
    applicationId: applicationId || groupId,
    limit: 50,
    page: 1,
    options: { skip: !open || !applicationId },
  });
  const applications = useRetainedResponseData(applicationsResponse);
  const artifacts = useRetainedResponseData(artifactsResponse);
  const applicationList = applications.data?.applications ?? [];
  const artifactList = artifacts.data?.artifacts ?? [];

  const close = () => {
    setDialog(null);
    setApplicationId('');
    setArtifactId('');
    setError('');
  };

  const handleDeploy = async () => {
    if (!canRunActions) return;
    if (!applicationId || !artifactId) {
      setError(t('selectBoth'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await ApiDeploy.Create.doPost({
      applicationId,
      artifactId,
      workerId: '',
      target: { type: 'hostgroup', id: groupId },
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshDetail();
    if ('operation_id' in response && response.operation_id) {
      showOperation(response.operation_id);
    }
  };

  return (
    <DialogShell
      open={open}
      onClose={close}
      busy={isSubmitting}
      icon={HardDriveUploadIcon}
      title={t('title')}
      description={t('description', { name: group?.name ?? '' })}
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
            disabled={isSubmitting || !applicationId || !artifactId}
            onClick={handleDeploy}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <HardDriveUploadIcon className="size-4" />
            )}
            {isSubmitting ? t('queueing') : t('deploy')}
          </button>
        </>
      }
    >
      {(applicationsResponse.$status === 'failed' ||
        applications.isDegraded) && (
        <FailedState.BannerRetryable
          onClickRetry={() => refreshApplications()}
        />
      )}

      <Field label={t('application')} required>
        <Select
          disabled={applicationsResponse.$status === 'loading'}
          value={applicationId}
          onValueChange={(value) => {
            setApplicationId(value);
            setArtifactId('');
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('applicationPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {applicationList.map((application) => (
              <SelectItem
                key={String(application.id ?? '')}
                value={String(application.id ?? '')}
              >
                {application.name ||
                  application.domain ||
                  String(application.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {applicationsResponse.$status !== 'loading' &&
          applicationList.length === 0 && (
            <span className="text-xs text-muted-foreground">
              {t('noApplications')}
            </span>
          )}
      </Field>

      <Field label={t('artifact')} required>
        {applicationId &&
          (artifactsResponse.$status === 'failed' || artifacts.isDegraded) && (
            <FailedState.BannerRetryable
              onClickRetry={() => refreshArtifacts()}
            />
          )}
        <Select
          disabled={!applicationId || artifactsResponse.$status === 'loading'}
          value={artifactId}
          onValueChange={setArtifactId}
        >
          <SelectTrigger>
            <SelectValue placeholder={t('artifactPlaceholder')} />
          </SelectTrigger>
          <SelectContent>
            {artifactList.map((artifact) => (
              <SelectItem
                key={String(artifact.id ?? '')}
                value={String(artifact.id ?? '')}
              >
                {artifact.head || artifact.branch || `Artifact ${artifact.id}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {applicationId &&
          artifactsResponse.$status !== 'loading' &&
          artifactList.length === 0 && (
            <span className="text-xs text-muted-foreground">
              {t('noArtifacts')}
            </span>
          )}
      </Field>

      <DialogError message={error} />
    </DialogShell>
  );
}
