import { useMemo, useState } from 'react';

import {
  CheckIcon,
  CircleUserRoundIcon,
  PlusIcon,
  UsersIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { matchWithFuzzyBitap } from '@/shared/libs/browser/algorithms';
import { cn } from '@/shared/libs/tailwind/cn';
import { SearchInput } from '@/shared/presentation/atoms/SearchInput';

import type {
  RegisteredAction,
  TeamAction,
  TeamActionsOptionsProps,
  TeamsListProps,
  TeamsPopupProps,
} from './types';

const TeamsList = (props: TeamsListProps) => {
  const { teams, selectedTeamId, onClickTeam, onClickTeamDetails } = props;
  const t = useDevetekTranslations();

  return (
    <div className="flex flex-col max-h-[40svh] overflow-hidden overflow-y-auto pb-2">
      {teams.map((team) => {
        const { id, name } = team;

        const handleClick = () => {
          onClickTeam(team.id);
        };

        const handleClickDetails = () => {
          onClickTeamDetails(team.id);
        };

        return (
          <div
            key={id}
            className="p-2 hover:bg-primary/10 transition-all flex items-center justify-between gap-2 w-full text-left"
          >
            <button
              type="button"
              className="min-w-0 flex-1 cursor-pointer text-left"
              onClick={handleClick}
            >
              <div className="flex flex-col min-w-0">
                <p className="text-sm text-primary font-semibold truncate">
                  {name}
                </p>
                <p className="text-xs italic text-primary/70 truncate">
                  Team ID: {id}
                </p>
              </div>
            </button>

            <div className="flex items-center gap-1 shrink-0">
              {id === selectedTeamId && <CheckIcon className="size-4" />}
              <button
                type="button"
                className="size-8 rounded flex items-center justify-center cursor-pointer hover:bg-primary/10 text-primary/70"
                title={t('common.actions.details')}
                onClick={handleClickDetails}
              >
                <UsersIcon className="size-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const TeamActionsOptions = (props: TeamActionsOptionsProps) => {
  const { actions, onClickAction } = props;

  const t = useDevetekTranslations();

  return (
    <div className="border-t p-1.5 flex flex-col gap-y-0.5">
      {actions.map((action) => {
        const { id, icon: Icon, i18nKey, isDisabled } = action;

        const cnButtonRoot = cn(
          'rounded p-2 w-full transition-all',
          !isDisabled && 'cursor-pointer hover:bg-primary/10',
          isDisabled && 'cursor-no-drop',
        );

        const handleClick = () => {
          onClickAction?.(id);
        };

        return (
          <button
            key={id}
            className={cnButtonRoot}
            disabled={isDisabled}
            onClick={handleClick}
          >
            <div
              className="flex items-center gap-1.5 data-[disabled=true]:opacity-50"
              data-disabled={isDisabled}
            >
              <Icon className="size-4" />
              <p
                className="text-sm text-primary data-[disabled=true]:italic"
                data-disabled={isDisabled}
              >
                {t(i18nKey)}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default function TeamsPopup(props: TeamsPopupProps) {
  const {
    teams,
    selectedTeamId,
    onClickAddNewTeams,
    onClickPersonal,
    onClickTeam,
    onClickTeamDetails,
  } = props;

  const [searchQuery, setSearchQuery] = useState('');

  const filteredTeams = useMemo(
    () =>
      teams.filter((team) =>
        matchWithFuzzyBitap({
          query: searchQuery,
          sourceText: team.name,
        }).unwrap(),
      ),
    [searchQuery, teams],
  );

  const actions: TeamAction[] = [
    {
      id: 'use-personal-mode',
      i18nKey: selectedTeamId
        ? 'sidebar.teamsWidget.usePersonalMode'
        : 'sidebar.teamsWidget.usingPersonalMode',
      icon: CircleUserRoundIcon,
      isDisabled: !selectedTeamId,
    },
    {
      id: 'add-new-teams',
      i18nKey: 'sidebar.teamsWidget.addNewTeams',
      icon: PlusIcon,
    },
  ];

  const handleClickAction = (id: RegisteredAction) => {
    switch (id) {
      case 'add-new-teams':
        onClickAddNewTeams();
        break;

      case 'use-personal-mode':
        onClickPersonal();
        break;
    }
  };

  return (
    <>
      <div className="p-2">
        <SearchInput
          onChange={setSearchQuery}
          value={searchQuery}
          maxLength={15}
        />
      </div>

      <TeamsList
        teams={filteredTeams}
        selectedTeamId={selectedTeamId}
        onClickTeam={onClickTeam}
        onClickTeamDetails={onClickTeamDetails}
      />

      <TeamActionsOptions actions={actions} onClickAction={handleClickAction} />
    </>
  );
}
