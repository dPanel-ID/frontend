import { CrownIcon, ShieldCheckIcon, UserIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';

import type { TeamAccess } from '../../-lib/team-roles';

const ACCESS_STYLE: Record<
  TeamAccess,
  { icon: typeof CrownIcon; className: string }
> = {
  owner: {
    icon: CrownIcon,
    className:
      'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  admin: {
    icon: ShieldCheckIcon,
    className:
      'border-violet-500/30 bg-violet-500/10 text-violet-700 dark:text-violet-300',
  },
  member: {
    icon: UserIcon,
    className: 'border-border bg-background text-muted-foreground',
  },
};

const ACCESS_LABEL_KEYS: Record<TeamAccess, string> = {
  owner: 'page.teamDetail.roleOwner',
  admin: 'page.teamDetail.roleAdmin',
  member: 'page.teamDetail.roleMember',
};

const ACCESS_HINT_KEYS: Record<TeamAccess, string> = {
  owner: 'page.teamDetail.roleOwnerHint',
  admin: 'page.teamDetail.roleAdminHint',
  member: 'page.teamDetail.roleMemberHint',
};

/** Owner, admin or member: what someone can do in a team. */
export function TeamAccessBadge(props: {
  access: TeamAccess;
  /** Overrides the access name, e.g. with a custom role's own name. */
  label?: string;
  className?: string;
}) {
  const { access, className, label } = props;
  const t = useDevetekTranslations();
  const { className: tone, icon: Icon } = ACCESS_STYLE[access];

  return (
    <span
      title={t(ACCESS_HINT_KEYS[access])}
      className={cn(
        'inline-flex max-w-full items-center gap-1 rounded-md border px-1.5 py-0.5 text-[11px] font-semibold',
        tone,
        className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      <span className="truncate">{label ?? t(ACCESS_LABEL_KEYS[access])}</span>
    </span>
  );
}
