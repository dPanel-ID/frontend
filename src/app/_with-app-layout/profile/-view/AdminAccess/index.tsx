import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  BoxesIcon,
  ListChecksIcon,
  ShieldIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useAuthModel } from '@/services/auth/model';
import { useDevetekTranslations } from '@/services/i18n';

import { isDpanelAdmin } from '@/entities/user/lib/admin-role';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

/**
 * The only way into the administrator pages, shown to dpanel-admin accounts
 * alone. It sits in the main column because the aside is hidden on phones.
 * Hiding it is presentation only; the pages and the API check the role.
 */
export default function AdminAccess() {
  const t = useDevetekTranslations('page.profile.administrator');
  const { resUserProfile } = useAuthModel();

  const roles =
    resUserProfile.$status === 'success'
      ? resUserProfile.casdoor?.roles
      : undefined;

  if (!isDpanelAdmin(roles)) return null;

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <header className="border-b p-5">
        <h2 className="flex items-center gap-2 text-base font-bold">
          <ShieldIcon className="size-4 text-muted-foreground" aria-hidden />
          {t('title')}
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          {t('description')}
        </p>
      </header>

      <div className="divide-y">
        <AdminEntry
          icon={BoxesIcon}
          to="/administrator/resources"
          title={t('resourcesTitle')}
          description={t('resourcesDescription')}
          cta={t('resourcesCta')}
        />
        <AdminEntry
          icon={ListChecksIcon}
          to="/administrator/tasks"
          title={t('tasksTitle')}
          description={t('tasksDescription')}
          cta={t('tasksCta')}
        />
      </div>
    </section>
  );
}

interface AdminEntryProps {
  icon: LucideIcon;
  to: '/administrator/resources' | '/administrator/tasks';
  title: string;
  description: string;
  cta: string;
}

function AdminEntry(props: AdminEntryProps) {
  const { cta, description, icon: Icon, title, to } = props;

  return (
    <div className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl border',
            FLOW_ACCENTS.sky.icon,
          )}
          aria-hidden
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>

      <Button
        asChild
        size="sm"
        buttonStyle="outline"
        buttonColor="secondary"
        className="shrink-0"
      >
        <Link to={to}>
          {cta}
          <ArrowRightIcon />
        </Link>
      </Button>
    </div>
  );
}
