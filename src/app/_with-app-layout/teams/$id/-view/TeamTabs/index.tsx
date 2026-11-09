import { useNavigate, useSearch } from '@tanstack/react-router';
import { BotIcon, ServerCogIcon, UsersRoundIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { SectionTabs } from '@/shared/presentation/organisms/SectionTabs';

import type { TeamTab } from '../../-rules/qs';
import MembersPanel from '../MembersPanel';
import ServiceAccounts from '../ServiceAccounts';
import Workers from '../Workers';

/** A team's sections. The active one lives in the URL, so it can be shared. */
export default function TeamTabs() {
  const t = useDevetekTranslations('page.teamDetail.tabs');
  const navigate = useNavigate({ from: '/teams/$id' });
  const { tab = 'members' } = useSearch({
    from: '/_with-app-layout/teams/$id/',
  });

  const handleSelect = (next: TeamTab) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        tab: next === 'members' ? undefined : next,
      }),
      replace: true,
    });
  };

  return (
    <>
      <SectionTabs<TeamTab>
        ariaLabel={t('ariaLabel')}
        active={tab}
        onSelect={handleSelect}
        items={[
          { id: 'members', label: t('members'), icon: UsersRoundIcon },
          { id: 'workers', label: t('workers'), icon: ServerCogIcon },
          {
            id: 'service-accounts',
            label: t('serviceAccounts'),
            icon: BotIcon,
          },
        ]}
      />

      {tab === 'members' && <MembersPanel />}
      {tab === 'workers' && <Workers />}
      {tab === 'service-accounts' && <ServiceAccounts />}
    </>
  );
}
