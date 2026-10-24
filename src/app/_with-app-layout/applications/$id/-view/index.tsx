import { useSearch } from '@tanstack/react-router';

import Guard from './_Guard';
import BannerGithubLogin from './BannerGithubLogin';
import Hero from './Hero';
import TabNav from './TabNav';
import DeploymentsTab from './tabs/DeploymentsTab';
import LogsTab from './tabs/LogsTab';
import OverviewTab from './tabs/OverviewTab';
import SettingsTab from './tabs/SettingsTab';

const TAB_CONTENT = {
  overview: OverviewTab,
  deployments: DeploymentsTab,
  logs: LogsTab,
  settings: SettingsTab,
} as const;

export default function ApplicationsDetailView() {
  const { tab } = useSearch({ from: '/_with-app-layout/applications/$id/' });
  const TabContent = TAB_CONTENT[tab];

  return (
    <Guard>
      <div className="flex flex-col gap-4">
        <Hero />
        <BannerGithubLogin />
        <TabNav active={tab} />
        <TabContent />
      </div>
    </Guard>
  );
}
