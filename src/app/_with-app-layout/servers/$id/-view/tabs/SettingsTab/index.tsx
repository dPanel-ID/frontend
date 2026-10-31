import type { ReactNode } from 'react';

import {
  BuildingIcon,
  PencilIcon,
  RotateCcwIcon,
  SettingsIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { canReinstallServer } from '@/entities/server/lib/describeServer';

import { isMigrateOwnershipVisible } from '@/features/migrate-ownership-modal';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { DataPanel } from '@/shared/presentation/organisms/DataPanel';

import { useEmit } from '../../../-model/events';
import { useServerDataModel } from '../../../-model/server-data';

/** The rarely needed actions, each with what it does spelled out. */
export default function SettingsTab() {
  const t = useDevetekTranslations('page.serverDetail.settings');
  const emit = useEmit();
  const [detail] = useServerDataModel((s) => [s.detail]);
  const server = detail.$status === 'success' ? detail : undefined;
  const busy = server?.state.status === 'progress';

  return (
    <DataPanel
      icon={SettingsIcon}
      title={t('title')}
      description={t('description')}
    >
      <div className="grid gap-3 p-4 lg:grid-cols-2">
        <SettingCard
          icon={PencilIcon}
          title={t('connection.title')}
          description={t('connection.description')}
          action={
            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              size="sm"
              disabled={busy}
              onClick={() => emit('@servers::detail/server-edit', null)}
            >
              <PencilIcon />
              {t('connection.action')}
            </Button>
          }
        />
        {server && canReinstallServer(server) && (
          <SettingCard
            icon={RotateCcwIcon}
            title={t('setup.title')}
            description={t('setup.description')}
            action={
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                size="sm"
                onClick={() => emit('@servers::detail/server-reinstall', null)}
              >
                <RotateCcwIcon />
                {t('setup.action')}
              </Button>
            }
          />
        )}
        {isMigrateOwnershipVisible() && (
          <SettingCard
            icon={BuildingIcon}
            title={t('ownership.title')}
            description={t('ownership.description', {
              owner: server?.ownership.team || server?.ownership.owner || '-',
            })}
            action={
              <Button
                buttonStyle="outline"
                buttonColor="secondary"
                size="sm"
                onClick={() =>
                  emit('@servers::detail/server-migrate-ownership', null)
                }
              >
                <BuildingIcon />
                {t('ownership.action')}
              </Button>
            }
          />
        )}
        <SettingCard
          icon={Trash2Icon}
          tone="danger"
          title={t('danger.title')}
          description={t('danger.description')}
          action={
            <Button
              className="bg-red-600 text-white hover:bg-red-500"
              size="sm"
              onClick={() => emit('@servers::detail/server-delete', null)}
            >
              <Trash2Icon />
              {t('danger.action')}
            </Button>
          }
        />
      </div>
    </DataPanel>
  );
}

function SettingCard(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  action: ReactNode;
  tone?: 'default' | 'danger';
}) {
  const { action, description, icon: Icon, title, tone = 'default' } = props;

  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-xl border bg-background/50 p-4',
        tone === 'danger' && 'border-red-400/40',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-lg border',
            tone === 'danger'
              ? 'border-red-400/30 bg-red-500/10 text-red-600 dark:text-red-300'
              : 'bg-background text-muted-foreground',
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <div className="mt-auto flex justify-end">{action}</div>
    </section>
  );
}
