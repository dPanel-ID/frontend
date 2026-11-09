import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';
import { useToaster } from '@/services/toaster';

import { ApiServiceAccounts } from '@/shared/api';
import { PERSONAL_WORKSPACE_ID } from '@/shared/libs/api-client/config';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import ExpirySelect from '../-presentation/ExpirySelect';
import Field from '../-presentation/Field';
import TokenReveal from '../-presentation/TokenReveal';
import {
  DEFAULT_EXPIRY_DAYS,
  DEFAULT_WORKSPACE_ROLE,
  WORKSPACE_ROLES,
  schemaAccountForm,
} from '../../rules/types';

export interface CreateAccountModalProps {
  workspaceId: string;
  onSuccess?: () => void;
}

/** Creates a service account, then shows its first token once. */
export default function CreateAccountModal(props: CreateAccountModalProps) {
  const { onSuccess, workspaceId } = props;
  const t = useDevetekTranslations('widget.serviceAccounts');
  const emitModal = useModalEmit();
  const [openToaster] = useToaster();

  const isWorkspace = workspaceId !== PERSONAL_WORKSPACE_ID;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [role, setRole] = useState<string>(DEFAULT_WORKSPACE_ROLE);
  const [expiry, setExpiry] = useState<string>(DEFAULT_EXPIRY_DAYS);
  const [nameError, setNameError] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{
    name: string;
    token: string;
  } | null>(null);

  const handleSubmit = async () => {
    const parsed = schemaAccountForm.safeParse({ name, description });
    if (!parsed.success) {
      setNameError(t('form.nameInvalid'));
      return;
    }

    setNameError(undefined);
    setIsSubmitting(true);
    emitModal('%%modal/allow-trivial-close', false);

    const response = await ApiServiceAccounts.Create.doPost({
      workspaceId,
      name: parsed.data.name,
      description: parsed.data.description,
      role: isWorkspace ? role : undefined,
      expiresInDays: Number(expiry),
    });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      emitModal('%%modal/allow-trivial-close', true);
      openToaster({
        variant: 'error',
        title: t('toaster.createError', { name: parsed.data.name }),
        message: getApiErrorDetail(response.error),
        duration: 6000,
      });
      return;
    }

    setCreated({ name: parsed.data.name, token: response.token });
    onSuccess?.();
  };

  if (created) {
    return (
      <ModalLayoutGeneral maxWidth="640px">
        <ModalLayoutGeneral.Title
          title={t('create.createdTitle', { name: created.name })}
        />
        <ModalLayoutGeneral.Content>
          <TokenReveal token={created.token} />
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
    <ModalLayoutGeneral maxWidth="560px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('create.title')}
        description={
          isWorkspace
            ? t('create.descriptionWorkspace')
            : t('create.descriptionPersonal')
        }
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
            label={t('form.name')}
            hint={t('form.nameHint')}
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

          <Field label={t('form.description')} hint={t('form.descriptionHint')}>
            {(control) => (
              <Input
                {...control}
                value={description}
                maxLength={255}
                autoComplete="off"
                onChange={(event) => setDescription(event.target.value)}
              />
            )}
          </Field>

          {isWorkspace && (
            <Field label={t('form.role')} hint={t(`roleHints.${role}`)}>
              {({ id }) => (
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {WORKSPACE_ROLES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {t(`roles.${item}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          )}

          <ExpirySelect value={expiry} onChange={setExpiry} />

          <div className="flex justify-end">
            <Button asChild disabled={isSubmitting}>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Spinner className="text-white" />
                ) : (
                  t('create.submit')
                )}
              </button>
            </Button>
          </div>
        </form>
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}
