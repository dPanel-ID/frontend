import type { ReactNode } from 'react';

import { Link } from '@tanstack/react-router';
import {
  BuildingIcon,
  Clock3Icon,
  Code2Icon,
  GitBranchIcon,
  GithubIcon,
  GlobeIcon,
  MoreHorizontalIcon,
  NetworkIcon,
  PencilIcon,
  PlugZapIcon,
  RocketIcon,
  ServerIcon,
  Trash2Icon,
  UserIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import type { ApplicationCard } from '@/entities/application/rules/schema';
import { getBundleIcon, getSourceBadge } from '@/entities/application/ui/lib';
import { OwnerLink } from '@/entities/user/ui/OwnerLink';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import FramedImageWithBadge from '@/shared/presentation/molecules/FramedImageWithBadge';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  applicationSource,
  applicationStatusKey,
  applicationTone,
  isApplicationMoving,
} from '../../-lib/describe-application';
import type { AppLoadBalancer } from '../../-lib/load-balancer-index';

export interface AppRowProps {
  data: ApplicationCard;
  loadBalancers?: AppLoadBalancer[];

  onClickEdit?: () => void;
  onClickMigrateOwnership?: () => void;
  onClickDelete?: () => void;
}

/**
 * The desktop row, on the same anatomy as every other list in the product:
 * identity on the left, the facts on one wrapping line under it, actions on
 * the right. This module had no row view at all — `auto` fell through to a
 * three-column grid, which squeezed the same content into a third of the
 * width and read nothing like the servers or cloud-project lists.
 */
export default function AppRow(props: AppRowProps) {
  const {
    data,
    loadBalancers = [],
    onClickDelete,
    onClickEdit,
    onClickMigrateOwnership,
  } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const status = data.state.lastArtifact.status;
  const servers = data.additionalInfo.servers;
  const runtime = data.configDefs.lifecycle?.run;
  const language = data.configDefs.lifecycle?.setup.languages[0];
  const detailParams = { id: String(data.id) };

  const branch =
    data.additionalInfo.latestArtifactBranch ||
    data.additionalInfo.defaultBranch;

  const primaryServer = servers[0];
  const domains = loadBalancers.filter((one) => one.domain);

  return (
    <article
      className={cn(
        'group grid gap-3 rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center',
        status === 'failed' && 'border-red-400/40',
        status === 'progress' && 'border-sky-400/40',
        status === 'deleting' && 'border-dashed border-amber-400/50',
      )}
    >
      <div className="grid min-w-0 gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <FramedImageWithBadge
            image={getBundleIcon(data.identity.bundleType)}
            badge={getSourceBadge(data.identity)}
            sizeUnit={9}
          />

          <div className="min-w-0">
            <Link
              to="/applications/$id"
              params={detailParams}
              className="block max-w-full truncate text-base font-bold text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35"
            >
              {data.identity.name}
            </Link>

            <p className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
              {data.identity.source === 'repository' && (
                <GithubIcon className="size-3 shrink-0" aria-hidden />
              )}
              <span className="truncate">{applicationSource(data)}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <StatusPill
            tone={applicationTone(data)}
            pulse={isApplicationMoving(data)}
            label={t(applicationStatusKey(data))}
            size="sm"
          />

          {domains.length > 0 ? (
            <span className="inline-flex min-w-0 items-center gap-1.5 text-xs">
              <GlobeIcon
                className="size-3.5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <a
                href={domains[0]!.href}
                target="_blank"
                rel="noreferrer"
                className="truncate font-medium text-primary/80 underline-offset-2 hover:underline"
              >
                {domains[0]!.domain}
              </a>
              {domains.length > 1 && (
                <Link
                  to="/backend/load-balancers"
                  search={{ page: 1, viewMode: 'table' }}
                  className="shrink-0 text-muted-foreground hover:underline"
                >
                  +{domains.length - 1}
                </Link>
              )}
            </span>
          ) : (
            <Fact
              icon={NetworkIcon}
              label={t('page.applications.appCard.loadBalancers')}
              value={t('page.applications.appCard.noDomain')}
            />
          )}

          <Fact
            icon={ServerIcon}
            label={t('page.applications.table.servers')}
            value={
              primaryServer
                ? `${primaryServer.name ?? primaryServer.address ?? '—'}${
                    servers.length > 1 ? ` +${servers.length - 1}` : ''
                  }`
                : undefined
            }
          />
          <Fact
            icon={RocketIcon}
            label={t('page.applications.appCard.deployments')}
            value={String(data.additionalInfo.deploymentCount)}
          />
          <Fact
            icon={GitBranchIcon}
            label={t('common.terms.branch')}
            value={branch}
          />
          <Fact
            icon={Code2Icon}
            label={t('common.terms.language')}
            value={
              language
                ? `${capitalizeFirstLetter(language.name)} ${language.version}`
                : undefined
            }
          />
          <Fact
            icon={PlugZapIcon}
            label={t('common.terms.port')}
            value={runtime?.port ? String(runtime.port) : undefined}
          />
          <Fact
            icon={data.ownership.team ? BuildingIcon : UserIcon}
            label={t('common.terms.owner')}
            value={<OwnerLink ownership={data.ownership} preferTeam />}
          />
          <Fact
            icon={Clock3Icon}
            label={t('common.terms.lastUpdated')}
            value={getDistanceFromNow(data.timestamp.updated, locale)}
            showLabel
          />
        </div>
      </div>

      <div className="flex items-center gap-1.5 xl:shrink-0">
        <Button size="sm" buttonColor="secondary" buttonStyle="outline" asChild>
          <Link to="/applications/$id" params={detailParams}>
            {t('common.actions.details')}
          </Link>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon-sm"
              buttonColor="secondary"
              buttonStyle="outline"
              aria-label={t('common.actions.more')}
              title={t('common.actions.more')}
            >
              <MoreHorizontalIcon />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {onClickEdit && (
              <DropdownMenuItem onClick={onClickEdit}>
                <PencilIcon className="size-4" />
                {t('common.actions.edit')}
              </DropdownMenuItem>
            )}
            {onClickMigrateOwnership && (
              <DropdownMenuItem onClick={onClickMigrateOwnership}>
                <BuildingIcon className="size-4" />
                {t('common.actions.migrateOwnership')}
              </DropdownMenuItem>
            )}
            {onClickDelete && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={onClickDelete}>
                  <Trash2Icon className="size-4" />
                  {t('common.actions.delete')}
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  );
}

function Fact(props: {
  icon: LucideIcon;
  label: string;
  value?: ReactNode;
  showLabel?: boolean;
}) {
  const { icon: Icon, label, showLabel = false, value } = props;

  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      {showLabel ? (
        <span className="shrink-0">{label}</span>
      ) : (
        <span className="sr-only">{label}: </span>
      )}
      <span className="truncate font-medium text-primary/80">{value}</span>
    </span>
  );
}
