import { useEffect } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import SecretReveal from '../-presentation/SecretReveal';
import type { WorkerSecretResult } from '../../rules/types';

export interface WorkerTokenModalProps {
  result: WorkerSecretResult;
}

/**
 * A VM worker's new token after a rotation. It closes only through the
 * button, so a stray click cannot hide a token that is never shown again.
 */
export default function WorkerTokenModal(props: WorkerTokenModalProps) {
  const { result } = props;
  const t = useDevetekTranslations('widget.workers');
  const emitModal = useModalEmit();

  useEffect(() => {
    emitModal('%%modal/allow-trivial-close', false);
  }, [emitModal]);

  return (
    <ModalLayoutGeneral maxWidth="640px">
      <ModalLayoutGeneral.Title
        title={t('tokenModal.title', { name: result.worker.name })}
        description={t('tokenModal.description')}
      />
      <ModalLayoutGeneral.Content>
        <SecretReveal result={result} />

        <div className="mt-5 flex justify-end">
          <Button onClick={() => emitModal('%%modal/close', null)}>
            {t('secret.done')}
          </Button>
        </div>
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
