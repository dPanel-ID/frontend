import {
  CalendarIcon,
  Clock3Icon,
  FolderTreeIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PlusIcon,
  ReplaceIcon,
  ServerIcon,
  Trash2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { useSelectMachineModal } from '@/features/select-machine-modal';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FLOW_ACCENTS,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { FailedState } from '@/widgets/failed-state';

import { useGroupDetailModel } from '../-model/group';

/** Who the group is and what can be done to it. */
export default function Hero() {
  const t = useDevetekTranslations('page.serverGroups.detail.hero');
  const tPage = useDevetekTranslations();
  const locale = useDevetekLocale();
  const { group, isDetailDegraded, members, refreshDetail, setDialog } =
    useGroupDetailModel();
  const { openMembersPicker } = useMembersPicker();

  useMetaTags({ title: `${group?.name ?? ''} | dPanel` }, [group?.name]);

  if (!group) return null;

  return (
    <header className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />

      <div className="relative flex flex-col gap-4 p-5 sm:p-6">
        <Breadcrumb
          items={[
            { text: tPage('sidebar.dashboard'), url: '/dashboard' },
            { text: tPage('page.servers.headerTitle'), url: '/servers' },
            { text: tPage('page.serverGroups.title'), url: '/servers/groups' },
          ]}
        />

        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl border',
                FLOW_ACCENTS.sky.icon,
              )}
            >
              <FolderTreeIcon className="size-6" />
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
                {group.name}
              </h1>
              <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                {group.description || t('noDescription')}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <ActionIcon
              icon={PencilIcon}
              title={t('edit')}
              onClick={() => setDialog({ kind: 'edit' })}
            />
            <button
              type="button"
              className={flowCtaClassName('sky')}
              disabled={members.isMutatingMembers}
              onClick={() => openMembersPicker('add')}
            >
              <PlusIcon className="size-4" />
              {t('addServers')}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={t('more')}
                  title={t('more')}
                  className="inline-flex size-9 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
                >
                  <MoreHorizontalIcon className="size-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  disabled={members.isMutatingMembers}
                  onClick={() => openMembersPicker('replace')}
                >
                  <ReplaceIcon className="size-4" />
                  {t('replaceServers')}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => setDialog({ kind: 'delete' })}
                >
                  <Trash2Icon className="size-4" />
                  {t('delete')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs font-medium text-muted-foreground">
          <Fact
            icon={ServerIcon}
            value={t('members', { count: group.memberCount })}
          />
          <Fact
            icon={CalendarIcon}
            value={t('created', {
              when: getDistanceFromNow(group.timestamp.created, locale),
            })}
          />
          <Fact
            icon={Clock3Icon}
            value={t('updated', {
              when: getDistanceFromNow(group.timestamp.updated, locale),
            })}
          />
        </div>

        {isDetailDegraded && (
          <FailedState.BannerRetryable onClickRetry={() => refreshDetail()} />
        )}
      </div>
    </header>
  );
}

/** Opens the server picker in add or replace mode for this group. */
export function useMembersPicker() {
  const t = useDevetekTranslations('page.serverGroups.detail.members.picker');
  const { group, members } = useGroupDetailModel();
  const [openSelectMachineModal] = useSelectMachineModal();

  const openMembersPicker = (mode: 'add' | 'replace') => {
    const memberIds = group?.members.map((member) => member.id) ?? [];
    const groupName = group?.name ?? '';

    openSelectMachineModal({
      title: mode === 'replace' ? t('replaceTitle') : t('addTitle'),
      description:
        mode === 'replace'
          ? t('replaceDescription', { group: groupName })
          : t('addDescription', { group: groupName }),
      confirmLabel: mode === 'replace' ? t('replaceConfirm') : t('addConfirm'),
      allowEmptySelection: mode === 'replace',
      disabledMachineIds: mode === 'add' ? memberIds : [],
      disabledReason: t('alreadyMember'),
      initialSelectedMachineIds: mode === 'replace' ? memberIds : [],
      onMachinesSelected: async (machineIds) => {
        await members.submitMembers(machineIds, mode);
      },
      selectionMode: 'multiple',
    });
  };

  return { openMembersPicker };
}

export function HeroShimmer() {
  return (
    <div className="rounded-2xl border bg-card p-5 sm:p-6">
      <div className="h-4 w-56 animate-pulse rounded bg-border/60" />
      <div className="mt-4 flex items-center gap-4">
        <div className="size-12 animate-pulse rounded-xl bg-border/60" />
        <div className="grid gap-2">
          <div className="h-7 w-64 animate-pulse rounded bg-border/60" />
          <div className="h-3 w-80 animate-pulse rounded bg-border/60" />
        </div>
      </div>
    </div>
  );
}

function Fact(props: { icon: LucideIcon; value: string }) {
  const { icon: Icon, value } = props;

  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" />
      {value}
    </span>
  );
}

function ActionIcon(props: {
  icon: LucideIcon;
  title: string;
  onClick: () => void;
}) {
  const { icon: Icon, onClick, title } = props;

  return (
    <button
      type="button"
      aria-label={title}
      title={title}
      onClick={onClick}
      className="inline-flex size-9 items-center justify-center rounded-lg border bg-background/50 text-primary/65 transition-colors hover:bg-border/40 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
    >
      <Icon className="size-4" />
    </button>
  );
}
