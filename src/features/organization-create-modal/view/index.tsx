import { Building2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { DcProvider } from '../model';
import type { OrganizationCreateModalProps as Props } from '../model/types';

import { Name } from './Name';
import { SubmitButton } from './SubmitButton';

export default function DbUserGrantModal(props: Props) {
  const t = useDevetekTranslations();
  const emitModal = useModalEmit();

  return (
    <DcProvider {...props}>
      <ModalLayoutGeneral
        maxWidth="640px"
        className="overflow-hidden rounded-xl bg-background"
      >
        <ModalLayoutGeneral.Title
          canClickClose
          title={
            <span className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-lg border bg-card">
                <Building2Icon className="size-4 text-primary/75" />
              </span>
              {t('modal.createTeam.title')}
            </span>
          }
          description={t('modal.createTeam.description')}
        />

        <ModalLayoutGeneral.Content className="flex flex-col gap-5">
          <section className="rounded-lg border bg-card p-4">
            <Name />
          </section>
          <footer className="flex items-center justify-end gap-2">
            <Button
              buttonStyle="ghost"
              buttonColor="secondary"
              onClick={() => emitModal('%%modal/close', null)}
            >
              {t('common.actions.cancel')}
            </Button>
            <SubmitButton />
          </footer>
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    </DcProvider>
  );
}
