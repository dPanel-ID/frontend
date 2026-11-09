import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';
import { useToaster } from '@/services/toaster';

import { ApiServiceAccounts } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import ExpirySelect from '../-presentation/ExpirySelect';
import Field from '../-presentation/Field';
import TokenReveal from '../-presentation/TokenReveal';
import { DEFAULT_EXPIRY_DAYS, schemaTokenForm } from '../../rules/types';

export interface CreateTokenModalProps {
  workspaceId: string;
  accountId: string;
  accountName: string;
  onSuccess?: () => void;
}

/** Adds a token to an account, then shows it once. */
export default function CreateTokenModal(props: CreateTokenModalProps) {
  const { accountId, accountName, onSuccess, workspaceId } = props;
  const t = useDevetekTranslations('widget.serviceAccounts');
  const emitModal = useModalEmit();
  const [openToaster] = useToaster();

  const [name, setName] = useState('');
  const [expiry, setExpiry] = useState<string>(DEFAULT_EXPIRY_DAYS);
  const [nameError, setNameError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const handleSubmit = async () => {
    const parsed = schemaTokenForm.safeParse({ name });
    if (!parsed.success) {
      setNameError(t('form.tokenNameInvalid'));
      return;
    }

    setNameError(undefined);
    setIsSubmitting(true);
    emitModal('%%modal/allow-trivial-close', false);

    const response = await ApiServiceAccounts.$Id.Tokens.Create.doPost({
      workspaceId,
      id: accountId,
      name: parsed.data.name,
      expiresInDays: Number(expiry),
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      emitModal('%%modal/allow-trivial-close', true);
      openToaster({
        variant: 'error',
        title: t('toaster.tokenError', { name: parsed.data.name }),
        message: getApiErrorDetail(response.error),
        duration: 6000,
      });
      return;
    }

    setToken(response.token);
    onSuccess?.();
  };

  if (token) {
    return (
      <ModalLayoutGeneral maxWidth="640px">
        <ModalLayoutGeneral.Title
          title={t('token.createdTitle', { name: accountName })}
        />
        <ModalLayoutGeneral.Content>
          <TokenReveal token={token} />
          <div className="mt-5 flex justify-end">
            <Button onClick={() => emitModal('%%modal/close', null)}>
              {t('reveal.done')}
            </Button>
          </div>
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    );
  }

  return (
    <ModalLayoutGeneral maxWidth="520px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('token.title', { name: accountName })}
        description={t('token.description')}
      />
      <ModalLayoutGeneral.Content>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!isSubmitting) void handleSubmit();
          }}
        >
          <Field
            label={t('form.tokenName')}
            hint={t('form.tokenNameHint')}
            error={nameError}
          >
            {(control) => (
              <Input
                {...control}
                value={name}
                maxLength={64}
                autoComplete="off"
                onChange={(event) => setName(event.target.value)}
              />
            )}
          </Field>

          <ExpirySelect value={expiry} onChange={setExpiry} />

          <div className="flex justify-end">
            <Button asChild disabled={isSubmitting}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner className="text-white" />
                ) : (
                  t('token.submit')
                )}
              </button>
            </Button>
          </div>
        </form>
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
