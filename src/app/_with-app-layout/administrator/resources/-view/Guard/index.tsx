import type { ReactNode } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { useDevetekTranslations } from '@/services/i18n';

import { FallbackState } from '@/widgets/fallback-state';

import { useAdminResourcesDataModel } from '../../-model/resources-data';
import { isAccessDenied } from '../../../-lib/access-error';
import { useAdminAccess } from '../../../-model/access';
import { ResourceListState } from '../ResourceListState';

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
 * Only dpanel-admin accounts see the page. The list is requested only once
 * the profile confirms the role; until then a shimmer shows.
 */
export function AccessGuard(props: GuardProps) {
  const access = useAdminAccess();

  if (access === 'checking') return <ResourceListState.Loading />;
  if (access === 'denied') return <Unauthorized />;

  return <>{props.children}</>;
}

/** The API is the authority: a 401 or 403 shows the unauthorized state. */
export function ApiAccessGuard(props: GuardProps) {
  const denied = useAdminResourcesDataModel((s) => {
    const { resources } = s;
    if (resources.$status === 'failed') return isAccessDenied(resources);
    if (resources.$status === 'loading' && resources.prevError) {
      return isAccessDenied(resources.prevError);
    }
    return false;
  });

  if (denied) return <Unauthorized />;

  return <>{props.children}</>;
}
