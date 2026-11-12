import type { DTOs } from '@/shared/api';

import type { ModuleHealthIndex } from '../../../../-lib/module-health';

export interface ModulesListProps {
  modules: DTOs.ModuleInstallationV1[];
  /** Whether each installed module's services run, by installation ID. */
  moduleHealth?: ModuleHealthIndex;
  serverId: string;
  onDeleted: () => void;
}
