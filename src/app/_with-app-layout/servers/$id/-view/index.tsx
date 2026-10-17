import { useSearch } from '@tanstack/react-router';

import Guard from './_Guard';
import Hero from './Hero';
import TabNav from './TabNav';
import FilesTab from './tabs/FilesTab';
import LogsTab from './tabs/LogsTab';
import ModulesTab from './tabs/ModulesTab';
import NetworkTab from './tabs/NetworkTab';
import OverviewTab from './tabs/OverviewTab';
import ServicesTab from './tabs/ServicesTab';
import SettingsTab from './tabs/SettingsTab';
import UsersTab from './tabs/UsersTab';

const TAB_CONTENT = {
  overview: OverviewTab,
  modules: ModulesTab,
  services: ServicesTab,
  users: UsersTab,
  network: NetworkTab,
  files: FilesTab,
  logs: LogsTab,
  settings: SettingsTab,
} as const;

export default function ServerDetailView() {
  const { tab } = useSearch({ from: '/_with-app-layout/servers/$id/' });
  const TabContent = TAB_CONTENT[tab];

  return (
    <Guard>
      <div className="flex flex-col gap-4">
        <Hero />
        <TabNav active={tab} />
        <TabContent />
      </div>
    </Guard>
  );
}
