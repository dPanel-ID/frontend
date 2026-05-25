'use client';

import type { ServerModule } from '@/entities/server-modules/model/types';

import { useServerModulesDetailModal } from '@/features/server-modules-detail-modal';

import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';

import { useServerDetailContext } from '../../../-model/server-detail';

import { InstalledVersions } from './_presentation/InstalledVersions';
import { ModuleHero } from './_presentation/ModuleHero';

export default function ModuleCard(props: Props) {
  const { moduleInfo, selectedForPlaybook, onTogglePlaybook } = props;

  const { serverDetail } = useServerDetailContext();
  const { id: serverId } =
    serverDetail.$status === 'success' ? serverDetail : {};

  const [openServerModulesDetailModal] = useServerModulesDetailModal();

  const handleClickMoreDetail = (moduleID: number) => {
    openServerModulesDetailModal({
      moduleInfo: {
        ...moduleInfo,
        moduleID: moduleID !== -1 ? moduleID : moduleInfo.moduleID,
      },
      serverID: serverId ? Number(serverId) : undefined,
    });
  };

  const installedModuleID = moduleInfo.moduleID ?? -1;
  const isInstalled = moduleInfo.installationStatus === 'installed';
  const versions =
    moduleInfo.installation?.module_source_commit != null
      ? [{ version: moduleInfo.installation.module_source_commit.slice(0, 7) }]
      : [];

  return (
    <Card className="shadow-none rounded-xl p-3 flex flex-col justify-between h-full">
      <div className="w-full">
        <ModuleHero
          moduleName={moduleInfo.name}
          moduleDescription={moduleInfo.description}
          moduleIcon={moduleInfo.logoUrl}
          isInstalled={isInstalled}
        />

        {versions.length > 0 && <InstalledVersions versions={versions} />}
      </div>

      <div className="w-full flex flex-col gap-2">
        {onTogglePlaybook && (
          <Button
            className="w-full"
            variant={selectedForPlaybook ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTogglePlaybook(moduleInfo.id)}
          >
            {selectedForPlaybook ? 'Added to playbook' : 'Add to playbook'}
          </Button>
        )}
        <Button
          className="w-full"
          variant="secondary"
          size="sm"
          onClick={() => handleClickMoreDetail(installedModuleID)}
        >
          More Detail
        </Button>
      </div>
    </Card>
  );
}

interface Props {
  moduleInfo: ServerModule;
  selectedForPlaybook?: boolean;
  onTogglePlaybook?: (moduleId: string) => void;
}
