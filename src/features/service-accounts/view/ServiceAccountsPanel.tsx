import { BotIcon, PlusIcon, RefreshCwIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { PERSONAL_WORKSPACE_ID } from '@/shared/libs/api-client/config';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import Shimmer from '@/shared/presentation/atoms/Shimmer';
import SpinnerOverlay from '@/shared/presentation/atoms/SpinnerOverlay';
import { FailedState } from '@/widgets/failed-state';

import {
  ServiceAccountsModelProvider,
  useServiceAccountsModel,
} from '../model';
import type { ServiceAccountsPanelProps } from '../rules/types';
import useDeleteAccountUsecase from '../usecase/use-delete-account';
import useRevokeTokenUsecase from '../usecase/use-revoke-token';

import AccountCard from './-presentation/AccountCard';
import { useCreateAccountModal } from './CreateAccountModal';
import { useCreateTokenModal } from './CreateTokenModal';

/**
 * The service accounts of a person or a team, and their tokens. Shown on the
 * profile for the person and on a team page for owners and admins.
 */
export default function ServiceAccountsPanel(props: ServiceAccountsPanelProps) {
  return (
    <ServiceAccountsModelProvider key={props.workspaceId} {...props}>
      <ServiceAccountsBody />
    </ServiceAccountsModelProvider>
  );
}

function ServiceAccountsBody() {
  const t = useDevetekTranslations('widget.serviceAccounts');
  const { accounts, refresh, workspaceId } = useServiceAccountsModel();

  const onSuccess = () => refresh();
  const [openCreateAccount] = useCreateAccountModal();
  const [openCreateToken] = useCreateTokenModal();
  const [handleDelete] = useDeleteAccountUsecase({ workspaceId, onSuccess });
  const [handleRevoke] = useRevokeTokenUsecase({ workspaceId, onSuccess });

  const rows =
    accounts.$status === 'success'
      ? accounts
      : accounts.$status === 'loading'
        ? accounts.prevData
        : undefined;
  const isRefetching = accounts.$status === 'loading' && Boolean(rows);
  const isPersonal = workspaceId === PERSONAL_WORKSPACE_ID;
  const handleCreate = () => openCreateAccount({ workspaceId, onSuccess });

  return (
    <section
      className="overflow-hidden rounded-2xl border bg-card"
      aria-labelledby="service-accounts-title"
    >
      <header className="flex flex-col gap-3 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2
            id="service-accounts-title"
            className="flex items-center gap-2 text-base font-bold"
          >
            <BotIcon className="size-4 text-muted-foreground" aria-hidden />
            {t('title')}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {isPersonal ? t('descriptionPersonal') : t('descriptionWorkspace')}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('refresh')}
            title={t('refresh')}
            onClick={() => refresh()}
          >
            <RefreshCwIcon />
          </Button>
          {rows && rows.length > 0 && (
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon />
              {t('create.open')}
            </Button>
          )}
        </div>
      </header>

      <div className="p-5">
        {accounts.$status === 'failed' && !rows ? (
          <FailedState.WallCentered.Retryable
            errorPayload={getApiErrorDetail(accounts.error)}
            onClickRetry={() => refresh()}
          />
        ) : !rows ? (
          <div className="flex flex-col gap-3" aria-busy>
            <Shimmer className="h-28 w-full rounded-xl" />
            <Shimmer className="h-28 w-full rounded-xl" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-8 text-center">
            <BotIcon className="size-8 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-sm font-semibold">{t('empty.title')}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {isPersonal
                  ? t('empty.descriptionPersonal')
                  : t('empty.descriptionWorkspace')}
              </p>
            </div>
            <Button size="sm" onClick={handleCreate}>
              <PlusIcon />
              {t('create.open')}
            </Button>
          </div>
        ) : (
          <SpinnerOverlay loading={isRefetching}>
            <div className="flex flex-col gap-3">
              {rows.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onDelete={handleDelete}
                  onRevoke={handleRevoke}
                  onAddToken={(item) =>
                    openCreateToken({
                      workspaceId,
                      accountId: item.id,
                      accountName: item.name,
                      onSuccess,
                    })
                  }
                />
              ))}
            </div>
          </SpinnerOverlay>
        )}
      </div>
    </section>
  );
}
