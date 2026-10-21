import { KeyRoundIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { SSHCreateProvider } from '../model';
import type { SSHCreateModalProps as Props } from '../model/types';

import { DisplayName } from './DisplayName';
import { KeyLength } from './KeyLength';
import { SubmitButton } from './SubmitButton';

export default function SSHKeyCreateModal(props: Props) {
  const t = useDevetekTranslations();

  return (
    <SSHCreateProvider {...props}>
      <ModalLayoutGeneral>
        <ModalLayoutGeneral.Title
          canClickClose
          title={t('page.sshKeys.create.title')}
        />

        <ModalLayoutGeneral.Content>
          <Note
            icon={KeyRoundIcon}
            title={t('page.sshKeys.create.introTitle')}
            message={t('page.sshKeys.create.intro')}
          />

          <section className="mt-5 flex flex-col gap-1.5">
            <DisplayName />
          </section>

          <section className="mt-5 flex flex-col gap-1.5">
            <KeyLength />
          </section>

          <section className="mt-5">
            <Note
              icon={ServerIcon}
              title={t('page.sshKeys.create.nextTitle')}
              message={t('page.sshKeys.create.next')}
            />
          </section>

          <section className="mt-5">
            <SubmitButton />
          </section>
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    </SSHCreateProvider>
  );
}

interface NoteProps {
  icon: typeof KeyRoundIcon;
  title: string;
  message: string;
}

/** A short explainer block; the modal uses one before and one after the form. */
function Note(props: NoteProps) {
  const { icon: Icon, message, title } = props;

  return (
    <div className="flex items-start gap-3 rounded-lg border bg-background/60 p-3">
      <Icon
        className="mt-0.5 size-6 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <div className="flex flex-col gap-0.5">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {message}
        </p>
      </div>
    </div>
  );
}
