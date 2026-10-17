import { useState } from 'react';

import { LoaderCircleIcon, RotateCcwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  buildModuleRetryRequirements,
  parseModuleRetryPayload,
} from '@/features/server-groups/shared/lib/retry';

import { ApiHostGroup } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { flowCtaClassName } from '@/shared/presentation/organisms/FlowHero';

import { useGroupDetailModel } from '../../-model/group';

import { DialogError, DialogShell, Field } from './DialogShell';

function isModuleOperation(type: string) {
  return type.startsWith('module.');
}

/** Re-runs a finished operation on the servers that failed. */
export function RetryDialog() {
  const t = useDevetekTranslations('page.serverGroups.detail.dialogs.retry');
  const { dialog, operation, refreshHistory, setDialog, showOperation } =
    useGroupDetailModel();
  const open = dialog?.kind === 'retry';
  const isModule = operation ? isModuleOperation(operation.type) : false;
  const requirements =
    operation && isModule
      ? buildModuleRetryRequirements(operation.request)
      : null;

  const [variablesText, setVariablesText] = useState(
    requirements?.defaultVariablesText ?? '',
  );
  const [refText, setRefText] = useState(requirements?.defaultRefText ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const close = () => {
    setDialog(null);
    setError('');
  };

  const handleRetry = async () => {
    if (!operation) return;

    let variables: Record<string, unknown> | undefined;
    let ref:
      | { type?: string; name?: string; expected_commit?: string }
      | undefined;

    try {
      if (isModule) {
        ({ ref, variables } = parseModuleRetryPayload(
          operation.request,
          variablesText,
          refText,
        ));
      }
    } catch (parseError) {
      setError(
        parseError instanceof Error ? parseError.message : String(parseError),
      );
      return;
    }

    setIsSubmitting(true);
    setError('');

    const response = await ApiHostGroup.Operation.$Id.retryPost({
      id: operation.id,
      ref,
      variables,
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      setError(getApiErrorDetail(response.error));
      return;
    }

    close();
    refreshHistory();
    showOperation(response.id);
  };

  return (
    <DialogShell
      open={open}
      onClose={close}
      busy={isSubmitting}
      icon={RotateCcwIcon}
      title={t('title')}
      description={t('description')}
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
            disabled={isSubmitting}
            onClick={handleRetry}
          >
            {isSubmitting ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : (
              <RotateCcwIcon className="size-4" />
            )}
            {isSubmitting ? t('retrying') : t('retry')}
          </button>
        </>
      }
    >
      {requirements && (
        <>
          {requirements.requiresVariablesResubmission && (
            <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              {t('variablesNote')}
            </p>
          )}
          {requirements.requiresPinnedRef && (
            <p className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
              {t('refNote')}
            </p>
          )}
          <Field label={t('variables')}>
            <TextArea
              className="font-mono text-xs"
              value={variablesText}
              onChange={(event) => setVariablesText(event.target.value)}
            />
          </Field>
          <Field label={t('ref')}>
            <TextArea
              className="font-mono text-xs"
              value={refText}
              onChange={(event) => setRefText(event.target.value)}
            />
          </Field>
        </>
      )}
      <DialogError message={error} />
    </DialogShell>
  );
}
