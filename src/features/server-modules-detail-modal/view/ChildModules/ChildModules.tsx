import { useState } from 'react';

import { DatabaseIcon, PlusIcon, XIcon } from 'lucide-react';

import type { ServerModule } from '@/entities/server-modules/model/types';

import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';

import { BaseContext, useBaseContext } from '../../config/base-context';
import { Installation } from '../Installation';

/** The name an installation was created with, from its instance key. */
function instanceName(installationKey?: string) {
  if (!installationKey) return '';
  const at = installationKey.indexOf('@');
  return at >= 0 ? installationKey.slice(at + 1) : installationKey;
}

function isInstalled(module: ServerModule) {
  return (
    module.installation?.status === 'installed' ||
    Boolean(
      module.installations?.some(
        (installation) => installation.status === 'installed',
      ),
    )
  );
}

/**
 * Modules offered only from this one, such as the databases created on a
 * MariaDB or PostgreSQL server: what exists on the server, and a form to
 * create another, which is the child module's own install form.
 */
export default function ChildModules() {
  const context = useBaseContext();
  const { moduleInfo, serverID } = context;
  const children = moduleInfo.children ?? [];

  if (!serverID || children.length === 0 || !isInstalled(moduleInfo)) {
    return null;
  }

  return (
    <>
      {children.map((child) => (
        <ChildModule key={child.id} child={child} />
      ))}
    </>
  );
}

function ChildModule(props: { child: ServerModule }) {
  const { child } = props;
  const context = useBaseContext();
  const [isCreating, setIsCreating] = useState(false);
  const created = child.installations ?? [];

  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="flex items-center gap-2 text-sm font-bold">
            <DatabaseIcon className="size-4" aria-hidden />
            Databases
          </h3>
          <p className="text-xs text-muted-foreground">{child.description}</p>
        </div>
        <Button
          size="sm"
          variant={isCreating ? 'outline' : 'default'}
          onClick={() => setIsCreating((current) => !current)}
        >
          {isCreating ? <XIcon aria-hidden /> : <PlusIcon aria-hidden />}
          {isCreating ? 'Cancel' : 'Create database'}
        </Button>
      </div>

      {created.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No database created here yet.
        </p>
      ) : (
        <ul className="flex flex-col divide-y rounded-lg border">
          {created.map((installation) => (
            <li
              key={installation.installation_key}
              className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
            >
              <span className="font-mono">
                {instanceName(installation.installation_key)}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {installation.status}
              </span>
            </li>
          ))}
        </ul>
      )}

      {isCreating && (
        <BaseContext value={{ ...context, moduleInfo: child }}>
          <Installation />
        </BaseContext>
      )}
    </Card>
  );
}
