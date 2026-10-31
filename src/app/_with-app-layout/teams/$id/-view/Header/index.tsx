import { PencilIcon, UserPlusIcon, UsersIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/Button';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';

import { useEmit } from '../../-model/events';
import { useMembersDataModel } from '../../-model/members-data';

/** The team's opening, in the same language as the teams list. */
export default function Header() {
  const emit = useEmit();
  const t = useDevetekTranslations();
  const { members, organization, orgId } = useMembersDataModel();

  const orgName =
    (organization.$status === 'success' && organization.name) ||
    (members.$status === 'success' && members.orgName) ||
    undefined;
  const orgDescription =
    (organization.$status === 'success' && organization.description) ||
    (members.$status === 'success' && members.orgDescription) ||
    undefined;

  return (
    <FlowHero
      accent="violet"
      icon={UsersIcon}
      headnote={
        <Breadcrumb
          items={[
            { text: t('sidebar.dashboard'), url: '/dashboard' },
            { text: t('common.terms.teams'), url: '/teams' },
            { text: orgName ?? `#${orgId}` },
          ]}
        />
      }
      title={orgName ?? '…'}
      description={orgDescription || t('page.teamDetail.hero.description')}
      aside={
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => emit('@team-members/edit-team', undefined)}
          >
            <PencilIcon />
            {t('common.actions.edit')}
          </Button>
          <button
            type="button"
            className={flowCtaClassName('violet')}
            onClick={() => emit('@team-members/add-member', undefined)}
          >
            <UserPlusIcon className="size-4" />
            {t('page.teamDetail.addMember')}
          </button>
        </div>
      }
    />
  );
}
