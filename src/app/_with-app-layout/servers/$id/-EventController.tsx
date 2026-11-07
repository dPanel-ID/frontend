import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import { serverDisplayName } from '@/entities/server/lib/describeServer';

import { useItemStatusLogModal } from '@/features/item-status-log-modal';
import { useMigrateOwnershipModal } from '@/features/migrate-ownership-modal';
import { useServerEditSidepanel } from '@/features/server-edit-sidepanel';
import {
  DeleteServerDialog,
  ReinstallServerDialog,
  useDeleteServer,
  useReinstallServer,
} from '@/features/server-lifecycle-dialogs';

import useHandler from '@/shared/libs/react-hooks/useHandler';

import { useEmit, useSubscribe } from './-model/events';
import { useServerDataModel } from './-model/server-data';
import useFavoriteNavigationUsecase from './-usecase/favorite-navigation';

/** Wires page events to the shared server panels and dialogs. */
export default function EventController() {
  const emit = useEmit();
  const navigate = useNavigate();
  const t = useDevetekTranslations();
  const [detail] = useServerDataModel((s) => [s.detail]);
  const server = detail.$status === 'success' ? detail : undefined;

  const refreshDetail = () =>
    emit('@servers::detail/server-detail-refresh', null);

  const [handleFavoriteNavigation] = useFavoriteNavigationUsecase();
  useSubscribe(
    '@servers::detail/favorite-navigation',
    handleFavoriteNavigation,
  );

  const [openServerEditSidepanel] = useServerEditSidepanel();
  useSubscribe(
    '@servers::detail/server-edit',
    useHandler(() => {
      if (!server) return;
      openServerEditSidepanel({
        serverId: server.id,
        serverName: server.host.name,
        serverAddress: server.host.address,
        ssh: { port: server.ssh.port, username: server.ssh.defaultUser },
        onSuccess: refreshDetail,
      });
    }),
  );

  const [openMigrateOwnershipModal] = useMigrateOwnershipModal();
  useSubscribe(
    '@servers::detail/server-migrate-ownership',
    useHandler(() => {
      if (!server) return;
      openMigrateOwnershipModal({
        mod: {
          type: 'server',
          moduleId: server.id,
          moduleName: serverDisplayName(server),
          moduleTeam: server.ownership.team
            ? { name: server.ownership.team, id: server.ownership.teamId }
            : undefined,
        },
        onSuccess: refreshDetail,
      });
    }),
  );

  const [openItemStatusLogModal] = useItemStatusLogModal();
  useSubscribe(
    '@servers::detail/server-status-info',
    useHandler(() => {
      if (!server) return;
      openItemStatusLogModal({
        logTopicTitle: 'Server',
        logTopicMessage: `Server name: ${
          server.host.name || t('common.terms.unknown')
        }`,
        mainLogs: `Status: ${server.state.status}`,
        additionalLogs: server.state.message,
      });
    }),
  );

  const [requestReinstall, reinstall] = useReinstallServer({
    onSuccess: refreshDetail,
  });
  useSubscribe(
    '@servers::detail/server-reinstall',
    useHandler(() => {
      if (!server) return;
      requestReinstall({
        serverId: server.id,
        serverName: serverDisplayName(server),
        isPrivate: server.host.private,
      });
    }),
  );

  const [requestDelete, deletion] = useDeleteServer({
    // The server is gone or going; the list is the only sensible place to land.
    onSuccess: () => navigate({ to: '/servers' }),
  });
  useSubscribe(
    '@servers::detail/server-delete',
    useHandler(() => {
      if (!server) return;
      requestDelete({
        serverId: server.id,
        serverName: server.host.name,
        serverAddress: server.host.address,
        provider: server.cloud?.provider,
      });
    }),
  );

  return (
    <>
      <DeleteServerDialog
        target={deletion.target}
        forgetOffer={deletion.forgetOffer}
        isDeleting={deletion.isDeleting}
        onConfirm={deletion.confirm}
        onClose={deletion.close}
      />
      <ReinstallServerDialog
        target={reinstall.target}
        isSubmitting={reinstall.isSubmitting}
        onConfirm={reinstall.confirm}
        onClose={reinstall.close}
      />
    </>
  );
}
