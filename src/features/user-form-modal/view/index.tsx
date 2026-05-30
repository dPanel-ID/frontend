import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { DcProvider } from '../model';
import type { UserFormModalProps as Props } from '../model/types';

import { AvatarUrl } from './AvatarUrl';
import { Fullname } from './Fullname';
import { PasswordFields } from './PasswordFields';
import { SubmitButton } from './SubmitButton';
import { Username } from './Username';

export default function UserFormModal(props: Props) {
  const { user } = props;
  const t = useDevetekTranslations();

  return (
    <DcProvider {...props}>
      <ModalLayoutGeneral>
        <ModalLayoutGeneral.Title
          canClickClose
          title={t('page.profile.modal.title')}
          description={t('page.profile.modal.description')}
        />

        <ModalLayoutGeneral.Content className="flex flex-col gap-4">
          {user.email && (
            <section className="flex flex-col gap-1.5">
              <span className="text-sm font-medium">
                {t('page.profile.modal.email')}
              </span>
              <p className="text-sm px-3 py-2 rounded-md border bg-muted text-muted-foreground">
                {user.email}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('page.profile.modal.emailReadonly')}
              </p>
            </section>
          )}

          <Fullname />
          <Username value={user.username} />
          <AvatarUrl />
          <PasswordFields />
          <SubmitButton />
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    </DcProvider>
  );
}
