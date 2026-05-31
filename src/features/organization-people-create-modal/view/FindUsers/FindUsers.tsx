import { useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { UserDirectoryPicker } from '@/shared/presentation/molecules/UserDirectoryPicker';
import type { UserDirectoryPickerUser } from '@/shared/presentation/molecules/UserDirectoryPicker';

import { useDcContext } from '../../model';

export default function FindUsers() {
  const { form } = useDcContext();
  const t = useDevetekTranslations();
  const [selectedUser, setSelectedUser] =
    useState<UserDirectoryPickerUser | null>(null);

  return (
    <UserDirectoryPicker
      label={t('common.terms.user')}
      selectedUser={selectedUser}
      placeholder={t('modal.addTeamMember.selectUser')}
      searchPlaceholder={t('modal.addTeamMember.searchByUsername')}
      emptyText={t('modal.addTeamMember.noUsersFound')}
      loadingText={t('modal.addTeamMember.loading')}
      pageSize={5}
      errorMessage={form.formState.errors.user_id?.message}
      onSelect={(user) => {
        setSelectedUser(user);
        form.setValue('user_id', String(user.id), {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }}
    />
  );
}
