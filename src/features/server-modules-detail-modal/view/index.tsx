import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';

import { BaseContext } from '../config/base-context';
import { ModuleHero } from '../presentation/ModuleHero';

import { ChildModules } from './ChildModules';
import { Installation } from './Installation';
import type { ServerModulesDetailModalProps as Props } from './types';

export default function ServerModulesDetailModal(props: Props) {
  const { moduleInfo } = props;

  return (
    <BaseContext value={props}>
      <ModalLayoutGeneral
        className="h-[calc(100svh-2rem)] overflow-hidden"
        maxWidth="700px"
      >
        <ModalLayoutGeneral.Title canClickClose title="Server Role" />

        <ModalLayoutGeneral.Content
          className="flex h-full max-h-none min-h-0 flex-col gap-6 overflow-y-auto overscroll-contain pb-6"
          classNameWrapper="min-h-0 flex-1 overflow-hidden"
        >
          <ModuleHero
            moduleDescription={moduleInfo.description}
            moduleIcon={moduleInfo.logoUrl}
            moduleName={moduleInfo.name}
          />

          <Installation />

          <ChildModules />
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    </BaseContext>
  );
}
