import { useEmit, useSubscribe } from './-model/events';
import useAddMemberUsecase from './-usecase/use-add-member';
import useDeleteMemberUsecase from './-usecase/use-delete-member';
import useEditTeamUsecase from './-usecase/use-edit-team';
import useManageMemberRolesUsecase from './-usecase/use-manage-member-roles';

export default function EventController() {
  const emit = useEmit();

  const handleDefaultSuccess = () => {
    emit('@team-members/data--refresh', null);
  };

  const [handleAddMember] = useAddMemberUsecase();
  const [handleDeleteMember] = useDeleteMemberUsecase({
    onSuccess: handleDefaultSuccess,
  });
  const [handleEditTeam] = useEditTeamUsecase();
  const [handleManageMemberRoles] = useManageMemberRolesUsecase({
    onSuccess: handleDefaultSuccess,
  });

  useSubscribe('@team-members/add-member', handleAddMember);
  useSubscribe('@team-members/member--delete', handleDeleteMember);
  useSubscribe('@team-members/member--manage-roles', handleManageMemberRoles);
  useSubscribe('@team-members/edit-team', handleEditTeam);

  return null;
}
