import { useDevetekTranslations } from '@/services/i18n';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { DcProvider } from '../model';
import type { OrganizationPeopleCreateModalProps as Props } from '../model/types';

import { FindUsers } from './FindUsers';
import { Organization } from './Organization';
import { Roles } from './Roles';
import { SubmitButton } from './SubmitButton';

export default function OrganizationPeopleCreateModal(props: Props) {
  const t = useDevetekTranslations();

  return (
    <DcProvider {...props}>
      <ModalLayoutGeneral maxWidth="880px">
        <ModalLayoutGeneral.Title
          canClickClose
          title={t('modal.addTeamMember.title')}
          description={t('modal.addTeamMember.description')}
        />

        <ModalLayoutGeneral.Content className="flex flex-col gap-6">
          <Organization organization_id={props.organization_id} />
          <FindUsers />
          <Roles />
          <SubmitButton />
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    </DcProvider>
  );
}
