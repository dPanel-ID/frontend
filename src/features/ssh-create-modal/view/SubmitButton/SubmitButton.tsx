import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { useToaster } from '@/services/toaster';

import { ApiSecret } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useSSHCreateContext } from '../../model';

export default function SubmitButton() {
  const {
    algorithm,
    displayName,
    keyLength,
    props,
    isMutating,
    setIsMutating,
  } = useSSHCreateContext();
  const t = useDevetekTranslations();

  const [openToaster] = useToaster();
  const emitModal = useModalEmit();

  const needsKeyLength = algorithm === 'rsa';
  const canSubmit =
    Boolean(displayName) && (!needsKeyLength || Boolean(keyLength));

  const handleClick = async () => {
    if (!canSubmit) return;

    setIsMutating(true);
    emitModal('%%modal/allow-trivial-close', false);

    const response = await ApiSecret.SshKey.Create.doPost({
      algorithm,
      displayName,
      // Ed25519 has no size, and sending one would be meaningless.
      keyLength: needsKeyLength ? keyLength : undefined,
    });

    if (response.$status === 'failed') {
      openToaster({
        title: t('page.sshKeys.create.errorTitle', { name: displayName }),
        message: response.error.message,
        variant: 'error',
        duration: 5000,
      });

      setIsMutating(false);
      emitModal('%%modal/allow-trivial-close', true);
      return;
    }

    emitModal('%%modal/close', null);

    openToaster({
      variant: 'success',
      message: t('page.sshKeys.create.successMessage', { name: displayName }),
    });

    props.onSubmitSuccess?.();
  };

  return (
    <Button
      className="w-full"
      disabled={!canSubmit || isMutating}
      onClick={handleClick}
    >
      {isMutating ? (
        <Spinner className="text-white" />
      ) : (
        t('page.sshKeys.create.submit')
      )}
    </Button>
  );
}
