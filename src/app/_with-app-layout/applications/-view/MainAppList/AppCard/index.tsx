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
import { StatTile } from '@/shared/presentation/molecules/StatTile';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import {
  applicationSource,
  applicationStatusKey,
  applicationTone,
  isApplicationMoving,
} from '../../../-lib/describe-application';
import type { AppLoadBalancer } from '../../../-lib/load-balancer-index';

import type { AppCardProps } from './types';

/**
 * `StatTile` renders a plain div when it has no `onClick`, so wrapping it
 * in a link keeps the markup valid and gives the browser's own context
 * menu something to act on.
 */
const TILE_LINK_CLASS =
  'rounded-xl transition-all hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 [&>*]:hover:border-sky-400/40 [&>*]:hover:shadow-lg [&>*]:hover:shadow-black/5';

/**
 * One application, on the same anatomy as a server card: identity and
 * state, then tiles that link out to the resources it depends on, then the
 * addresses it answers on, then its meta line.
 *
 * The previous card was built on `ResourceCard.Compact`, which gave this
 * list a different shape from every other list in the product and had no
 * room for the load balancers — so the way from an application to its
 * domain had quietly disappeared.
 */
export default function AppCard(props: AppCardProps) {
  const {
    data,
    loadBalancers = [],
    onClickDelete,
    onClickDetails,
    onClickEdit,
    onClickMigrateOwnership,
  } = props;

  const t = useDevetekTranslations();
  const locale = useDevetekLocale();

  const status = data.state.lastArtifact.status;
  const servers = data.additionalInfo.servers;
  const runtime = data.configDefs.lifecycle?.run;
  const language = data.configDefs.lifecycle?.setup.languages[0];

  const autoDeploy = data.configDefs.cicd.autoDeploy;
  const branch =
    (autoDeploy.enabled ? autoDeploy.fromBranch : undefined) ||
    data.additionalInfo.latestArtifactBranch ||
    data.additionalInfo.defaultBranch;

  const detailParams = { id: String(data.id) };

  return (
    <article
      className={cn(
        'group relative flex flex-col gap-3 overflow-hidden rounded-2xl border bg-card p-4 transition-colors hover:border-sky-400/40',
        status === 'failed' && 'border-red-400/40',
        status === 'progress' && 'border-sky-400/40',
        status === 'deleting' && 'border-dashed border-amber-400/50',
      )}
    >
      {status === 'progress' && (
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_0%_0%,rgba(56,189,248,0.10),transparent_60%)]" />
      )}

      <div className="relative flex items-start gap-3">
        <FramedImageWithBadge
          image={getBundleIcon(data.identity.bundleType)}
          badge={getSourceBadge(data.identity)}
          sizeUnit={9}
        />

        <div className="min-w-0 flex-1">
          {/* An anchor, so the browser's own "open in new tab" works. */}
          <Link
            to="/applications/$id"
            params={detailParams}
            onClick={onClickDetails}
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

        <StatusPill
          tone={applicationTone(data)}
          pulse={isApplicationMoving(data)}
          label={t(applicationStatusKey(data))}
          size="sm"
        />
      </div>

      <div className="relative grid gap-2 sm:grid-cols-3">
        <Link to="/servers" className={TILE_LINK_CLASS}>
          <StatTile
            size="sm"
            icon={ServerIcon}
            label={t('page.applications.appCard.servers')}
            value={servers.length}
          />
        </Link>

        <Link
          to="/backend/load-balancers"
          search={{ page: 1, viewMode: 'table' }}
          className={TILE_LINK_CLASS}
        >
          <StatTile
            size="sm"
            icon={NetworkIcon}
            label={t('page.applications.appCard.loadBalancers')}
            value={loadBalancers.length}
          />
        </Link>

        <Link
          to="/applications/$id"
          params={detailParams}
          className={TILE_LINK_CLASS}
        >
          <StatTile
            size="sm"
            icon={RocketIcon}
            label={t('page.applications.appCard.deployments')}
            value={data.additionalInfo.deploymentCount}
          />
        </Link>
      </div>

      <DomainStrip loadBalancers={loadBalancers} />

      <div className="relative flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-muted-foreground">
        <InlineInfo
          icon={data.ownership.team ? BuildingIcon : UserIcon}
          value={<OwnerLink ownership={data.ownership} preferTeam />}
        />
        <InlineInfo icon={GitBranchIcon} value={branch} />
        <InlineInfo
          icon={Code2Icon}
          value={
            language
              ? `${capitalizeFirstLetter(language.name)} ${language.version}`
              : undefined
          }
        />
        <InlineInfo
          icon={PlugZapIcon}
          value={runtime?.port ? String(runtime.port) : undefined}
        />
        <InlineInfo
          icon={Clock3Icon}
          value={getDistanceFromNow(data.timestamp.updated, locale)}
        />
      </div>

      <div className="relative flex items-center justify-end gap-1.5">
        <Button size="sm" buttonColor="secondary" buttonStyle="outline" asChild>
          <Link
            to="/applications/$id"
            params={detailParams}
            onClick={onClickDetails}
          >
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

/** The addresses this application answers on, as links out to each one. */
function DomainStrip(props: { loadBalancers: AppLoadBalancer[] }) {
  const { loadBalancers } = props;

  const t = useDevetekTranslations('page.applications.appCard');

  const withDomain = loadBalancers.filter((one) => one.domain);

  if (withDomain.length === 0) {
    return (
      <p className="relative flex items-center gap-1.5 rounded-xl border border-dashed px-3 py-2 text-xs text-muted-foreground">
        <GlobeIcon className="size-3.5 shrink-0" />
        {t('noDomain')}
      </p>
    );
  }

  return (
    <div className="relative flex flex-wrap gap-1.5">
      {withDomain.map((one) => (
        <a
          key={one.id}
          href={one.href}
          target="_blank"
          rel="noreferrer"
          onClick={(event) => event.stopPropagation()}
          className={cn(
            'inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background/60 px-2.5 py-1 text-xs font-semibold transition-colors',
            'hover:border-sky-400/50 hover:text-sky-600 dark:hover:text-sky-300',
            one.status && one.status !== 'ready' && 'border-dashed opacity-70',
          )}
        >
          <GlobeIcon className="size-3 shrink-0" />
          <span className="truncate">{one.domain}</span>
        </a>
      ))}
    </div>
  );
}

function InlineInfo(props: { icon: LucideIcon; value?: ReactNode }) {
  const { icon: Icon, value } = props;

  if (!value) return null;

  return (
    <span className="inline-flex min-w-0 items-center gap-1">
      <Icon className="size-3 shrink-0" />
      <span className="truncate">{value}</span>
    </span>
  );
}
