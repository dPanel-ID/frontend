import type { DTOs } from '@/shared/api';

export interface ModulesListProps {
  modules: DTOs.ModuleInstallationV1[];
  serverId: string;
  onDeleted: () => void;
}
