import { useNavigate } from '@tanstack/react-router';
import {
  BuildingIcon,
  CalendarIcon,
  PencilIcon,
  RefreshCwIcon,
  UserIcon,
} from 'lucide-react';
import { useMetaTags } from 'react-metatags-hook';

import { useDevetekLocale, useDevetekTranslations } from '@/services/i18n';

import { getBundleIcon, getSourceBadge } from '@/entities/application/ui/lib';

import { getDistanceFromNow } from '@/shared/libs/browser/date';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import FramedImageWithBadge from '@/shared/presentation/molecules/FramedImageWithBadge';
import {
  PageHeader,
  PageHeaderShimmer,
} from '@/shared/presentation/organisms/PageHeader';
import type { PageHeaderStatuses } from '@/shared/presentation/organisms/PageHeader/types';

import { useAppDataModel } from '../../-model/app-data';
import { useEmit } from '../../-model/events';

const FallbackLoading = () => (
  <PageHeaderShimmer hasHeadnote hasStatuses hasRightAppend />
);

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: FallbackLoading,
  fallbackError: FallbackLoading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

const HeaderBreadcrumb = () => {
  const t = useDevetekTranslations();

  return (
    <Breadcrumb
      items={[
        {
          text: t('sidebar.dashboard'),
          url: '/dashboard',
        },
        {
          text: t('page.applications.headerTitle'),
          url: '/applications',
        },
      ]}
    />
  );
};

const AppTitle = () => {
  const [appName] = useAppDetail((s) => [s.identity.name]);

  useMetaTags(
    {
      title: `${appName} | dnocs`,
    },
    [appName],
  );

  return appName;
};

const HeroIcon = () => {
  const [appIdentity] = useAppDetail((s) => [s.identity]);

  return (
    <FramedImageWithBadge
      image={getBundleIcon(appIdentity.bundleType)}
      badge={getSourceBadge(appIdentity)}
      sizeUnit={14}
    />
  );
};

const useHeaderStatus = (): PageHeaderStatuses => {
  const [ownership] = useAppDetail((s) => [s.ownership]);

  const statuses: PageHeaderStatuses = [];

  if (ownership.owner) {
    statuses.push({
      kind: 'status',
      icon: UserIcon,
      text: ownership.owner,
    });
  }

  if (ownership.team) {
    statuses.push({
      kind: 'status',
      icon: BuildingIcon,
      text: ownership.team,
    });
  }

  return statuses;
};

const HeaderFootnote = () => {
  const locale = useDevetekLocale();
  const t = useDevetekTranslations();
  const [timestamp] = useAppDetail((s) => [s.timestamp]);

  return (
    <div className="flex items-center gap-x-3 flex-wrap">
      <span className="flex items-center gap-1">
        <CalendarIcon className="size-3" />
        {`${t('common.terms.createdAt')} ${getDistanceFromNow(timestamp.created, locale)}`}
      </span>
      <span className="flex items-center gap-1">
        <CalendarIcon className="size-3" />
        {`${t('common.terms.lastUpdated')} ${getDistanceFromNow(timestamp.updated, locale)}`}
      </span>
    </div>
  );
};

const RefreshButton = () => {
  const emit = useEmit();
  const t = useDevetekTranslations();

  const handleRefresh = () => {
    emit('@applications::detail/app-detail-refresh', null);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRefresh}
      aria-label={t('common.actions.refresh')}
      title={t('common.actions.refresh')}
    >
      <RefreshCwIcon />
    </Button>
  );
};

const EditButton = () => {
  const navigate = useNavigate();
  const t = useDevetekTranslations();
  const [appId, appIdentity] = useAppDetail((s) => [s.id, s.identity]);

  const handleEdit = () => {
    if (appIdentity.source !== 'repository') return;

    navigate({
      to: '/applications/$id/update',
      params: {
        id: appId,
      },
    });
  };

  if (appIdentity.source !== 'repository') return null;

  return (
    <Button size="sm" onClick={handleEdit} title={t('common.actions.edit')}>
      <PencilIcon />
      {t('common.actions.edit')}
    </Button>
  );
};

export default guard(function Header() {
  const headerStatus = useHeaderStatus();

  return (
    <PageHeader
      headnote={<HeaderBreadcrumb />}
      title={<AppTitle />}
      heroIcon={HeroIcon}
      statuses={headerStatus}
      footnote={<HeaderFootnote />}
      footnoteAs="div"
      rightAppend={
        <div className="flex items-center gap-2">
          <RefreshButton />
          <EditButton />
        </div>
      }
    />
  );
});
