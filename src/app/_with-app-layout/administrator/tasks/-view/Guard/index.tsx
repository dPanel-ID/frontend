import type { ReactNode } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import { FallbackState } from '@/widgets/fallback-state';

import { TaskListState } from '../-presentation/TaskListState';
import { useAdminTasksDataModel } from '../../-model/tasks-data';
import { isAccessDenied } from '../../../-lib/access-error';
import { useAdminAccess } from '../../../-model/access';

interface GuardProps {
  children: ReactNode;
}

function Unauthorized() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();

  return (
    <FallbackState.Unauthorized
      withCard
      ctaLabel={t('common.actions.backToDashboard')}
      ctaOnClick={() => navigate({ replace: true, to: '/dashboard' })}
    />
  );
}

/**
 * Only dpanel-admin accounts see the page. Children (and the task request)
 * mount only once the profile confirms the role; until then a shimmer shows.
 */
export function AccessGuard(props: GuardProps) {
  const access = useAdminAccess();

  if (access === 'checking') return <TaskListState.Loading />;
  if (access === 'denied') return <Unauthorized />;

  return <>{props.children}</>;
}

/**
 * The API is the authority: when it answers 401 or 403 the page shows the
 * unauthorized state, even if the profile said the account was an admin.
 */
export function ApiAccessGuard(props: GuardProps) {
  const denied = useAdminTasksDataModel((s) => {
    const { tasks } = s;
    if (tasks.$status === 'failed') return isAccessDenied(tasks);
    if (tasks.$status === 'loading' && tasks.prevError) {
      return isAccessDenied(tasks.prevError);
    }
    return false;
  });

  if (denied) return <Unauthorized />;

  return <>{props.children}</>;
}
