import { useSearch } from '@tanstack/react-router';
import { ActivityIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { SectionTabs } from '@/shared/presentation/organisms/SectionTabs';
import { FailedState } from '@/widgets/failed-state';
import { FallbackState } from '@/widgets/fallback-state';

import { useGroupDetailModel } from '../-model/group';
import type { GroupDetailTab } from '../-rules/search';

import { BulkActionDialog } from './dialogs/BulkActionDialog';
import { DeleteGroupDialog } from './dialogs/DeleteGroupDialog';
import { DeployDialog } from './dialogs/DeployDialog';
import { EditGroupDialog } from './dialogs/EditGroupDialog';
import { InstallModuleDialog } from './dialogs/InstallModuleDialog';
import { RetryDialog } from './dialogs/RetryDialog';
import Hero, { HeroShimmer } from './Hero';
import MembersTab from './MembersTab';
import OperationsTab from './OperationsTab';

function isUnauthorizedStatus(status?: number | string) {
  const normalizedStatus = Number(status);
  return normalizedStatus === 401 || normalizedStatus === 403;
}

function isConfigDisabledMessage(message: string) {
  return /(disabled|not configured|unavailable)/i.test(message);
}

export default function ServerGroupDetailView() {
  const t = useDevetekTranslations('page.serverGroups');
  const { tab } = useSearch({ from: '/_with-app-layout/servers/groups/$id/' });
  const { detailResponse, goTo, group, operations, refreshDetail } =
    useGroupDetailModel();

  if (detailResponse.$status === 'loading' && !group) {
    return <HeroShimmer />;
  }

  if (detailResponse.$status === 'failed' && !group) {
    const message = getApiErrorDetail(detailResponse.error);
    const status =
      detailResponse.kind === 'api' ? detailResponse.error.status : undefined;

    if (isConfigDisabledMessage(message)) {
      return (
        <div className="rounded-2xl border border-dashed bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          {t('unavailable')}
        </div>
      );
    }

    return isUnauthorizedStatus(status) ? (
      <FallbackState.Unauthorized withCard />
    ) : (
      <FailedState.WallCentered.Retryable
        withCard
        errorPayload={message}
        onClickRetry={() => refreshDetail()}
      />
    );
  }

  if (!group) return null;

  const tabs = [
    {
      id: 'members' as const,
      label: t('detail.tabs.members'),
      icon: ServerIcon,
      count: group.memberCount,
    },
    {
      id: 'operations' as const,
      label: t('detail.tabs.operations'),
      icon: ActivityIcon,
      count: operations.length,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <Hero />
      <SectionTabs<GroupDetailTab>
        items={tabs}
        active={tab}
        ariaLabel={t('detail.tabs.ariaLabel')}
        onSelect={(next) => goTo({ tab: next })}
      />
      {tab === 'members' ? <MembersTab /> : <OperationsTab />}

      <EditGroupDialog />
      <DeleteGroupDialog />
      <BulkActionDialog />
      <DeployDialog />
      <RetryDialog />
      <InstallModuleDialog />
    </div>
  );
}
