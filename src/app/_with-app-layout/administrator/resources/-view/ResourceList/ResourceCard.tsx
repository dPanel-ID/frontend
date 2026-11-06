import type { ReactNode } from 'react';

import dayjs from 'dayjs';
import {
  AppWindowIcon,
  Clock3Icon,
  CloudIcon,
  CodeXmlIcon,
  CogIcon,
  GitBranchIcon,
  GlobeIcon,
  KeyRoundIcon,
  LayersIcon,
  NetworkIcon,
  PlugIcon,
  ServerIcon,
  TagIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { personOf } from '@/entities/user/lib/person';
import { UserLink } from '@/entities/user/ui/UserLink';

import type { AdminResourceV2 } from '@/shared/api/-dtos';
import type { AdminResourceType } from '@/shared/api/admin.resource.find';
import { getDistanceFromNow } from '@/shared/libs/browser/date';
import { cn } from '@/shared/libs/tailwind/cn';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import { WorkspaceBadge } from '../-presentation/WorkspaceBadge';
import { statusTone } from '../../-lib/resource-types';

const TYPE_ICONS: Record<AdminResourceType, LucideIcon> = {
  servers: ServerIcon,
  applications: AppWindowIcon,
  load_balancers: NetworkIcon,
  domains: GlobeIcon,
  ssh_keys: KeyRoundIcon,
};

const TYPE_TILES: Record<AdminResourceType, string> = {
  servers: 'bg-sky-500/10 text-sky-600 dark:text-sky-300',
  applications: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-300',
  load_balancers: 'bg-teal-500/10 text-teal-600 dark:text-teal-300',
  domains: 'bg-amber-500/10 text-amber-600 dark:text-amber-300',
  ssh_keys: 'bg-rose-500/10 text-rose-600 dark:text-rose-300',
};

/** Icons for the facts the API sends; an unknown key gets a tag. */
const FACT_ICONS: Record<string, LucideIcon> = {
  type: TagIcon,
  framework: CodeXmlIcon,
  source: GitBranchIcon,
  domain: GlobeIcon,
  engine: CogIcon,
  upstream: PlugIcon,
  provider: CloudIcon,
};

const RELATED_ICONS: Record<string, LucideIcon> = {
  servers: ServerIcon,
  applications: AppWindowIcon,
  load_balancers: NetworkIcon,
};

const KNOWN_FACTS = new Set(Object.keys(FACT_ICONS));
const KNOWN_RELATED = new Set(Object.keys(RELATED_ICONS));

interface ResourceCardProps {
  type: AdminResourceType;
  item: AdminResourceV2;
}

/**
 * One application, load balancer, domain or SSH key: what it is, what it is
 * tied to, whose it is and where it lives.
 */
export default function ResourceCard(props: ResourceCardProps) {
  const { item, type } = props;
  const t = useDevetekTranslations('page.adminResources');
  const locale = useDevetekLocale();
  const TypeIcon = TYPE_ICONS[type];
  const owner = personOf(item.owner);
  const facts = (item.facts ?? []).filter(
    (fact) => fact.key !== 'domain' || type !== 'domains',
  );
  const related = item.related ?? [];
  const subtitle =
    item.subtitle || (type === 'domains' ? item.detail : undefined);

  return (
    <article className="rounded-2xl border bg-card p-4 transition-colors hover:border-sky-400/40">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <div className="grid min-w-0 content-start gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-xl border',
                TYPE_TILES[type],
              )}
              aria-hidden
            >
              <TypeIcon className="size-6" />
            </span>
            <div className="grid min-w-0 gap-0.5">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h3 className="truncate text-base font-bold" title={item.name}>
                  {item.name || t('unnamed')}
                </h3>
                {item.status && (
                  <StatusPill
                    tone={statusTone(item.status)}
                    label={item.status}
                  />
                )}
                <WorkspaceBadge
                  type={item.workspace?.type}
                  name={item.workspace?.name}
                  id={item.workspace?.id}
                />
              </div>
              {subtitle && (
                <p className="truncate text-sm text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {facts.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              {facts.map((fact) => (
                <Fact
                  key={fact.key}
                  icon={FACT_ICONS[fact.key] ?? TagIcon}
                  label={
                    KNOWN_FACTS.has(fact.key)
                      ? t(`facts.${fact.key as 'type'}`)
                      : fact.key
                  }
                  value={fact.value}
                />
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-muted-foreground">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <span>{t('ownedBy')}</span>
              {owner ? (
                <UserLink {...owner} className="text-primary/80" />
              ) : (
                <span>{t('unknownOwner')}</span>
              )}
            </span>
            <span className="font-mono">#{item.id}</span>
            {item.created_at && (
              <Info icon={Clock3Icon}>
                {t('createdOn', {
                  date: dayjs(item.created_at).format('YYYY/MM/DD'),
                })}
              </Info>
            )}
            {item.updated_at && (
              <Info icon={LayersIcon}>
                {t('updated', {
                  distance: getDistanceFromNow(item.updated_at, locale),
                })}
              </Info>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <div className="grid content-start gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {related.map((entry) => (
              <Related
                key={entry.key}
                icon={RELATED_ICONS[entry.key] ?? LayersIcon}
                label={
                  KNOWN_RELATED.has(entry.key)
                    ? t(`related.${entry.key as 'servers'}`)
                    : entry.key
                }
                count={entry.count ?? 0}
                names={entry.names ?? []}
                none={t('related.none')}
                more={(count) => t('related.more', { count })}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function Fact(props: { icon: LucideIcon; label: string; value: string }) {
  const { icon: Icon, label, value } = props;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5" title={label}>
      <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
      <span className="sr-only">{label}</span>
      <span className="truncate font-medium text-primary/80">{value}</span>
    </span>
  );
}

function Info(props: { icon: LucideIcon; children: ReactNode }) {
  const { children, icon: Icon } = props;

  return (
    <span className="inline-flex min-w-0 items-center gap-1.5">
      <Icon className="size-3.5 shrink-0" aria-hidden />
      <span className="truncate">{children}</span>
    </span>
  );
}

interface RelatedProps {
  icon: LucideIcon;
  label: string;
  count: number;
  names: string[];
  none: string;
  more: (count: number) => string;
}

/** How many of a related kind, and the first few by name. */
function Related(props: RelatedProps) {
  const { count, icon: Icon, label, more, names, none } = props;
  const rest = count - names.length;

  return (
    <div className="flex min-w-0 items-start gap-3 rounded-xl border bg-background/50 p-3">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-muted-foreground"
        aria-hidden
      >
        <Icon className="size-4" />
      </span>
      <div className="grid min-w-0 gap-1">
        <p className="text-sm">
          <span className="font-bold tabular-nums">{count}</span>{' '}
          <span className="text-muted-foreground">{label}</span>
        </p>
        {names.length > 0 ? (
          <div className="flex min-w-0 flex-wrap gap-1">
            {names.map((name) => (
              <span
                key={name}
                className="max-w-full truncate rounded-md border bg-card px-1.5 py-0.5 font-mono text-[0.7rem] text-primary/80"
                title={name}
              >
                {name}
              </span>
            ))}
            {rest > 0 && (
              <span className="px-1 py-0.5 text-[0.7rem] text-muted-foreground">
                {more(rest)}
              </span>
            )}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">{none}</p>
        )}
      </div>
    </div>
  );
}
