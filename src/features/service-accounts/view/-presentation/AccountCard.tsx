import { BotIcon, KeyRoundIcon, Trash2Icon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { formatDate } from '../../lib/accounts';
import type { AccountRow, TokenRow } from '../../rules/types';

import TokenList from './TokenList';

/** One service account with its tokens and actions. */
export default function AccountCard(props: {
  account: AccountRow;
  onAddToken: (account: AccountRow) => void;
  onDelete: (account: AccountRow) => void;
  onRevoke: (account: AccountRow, token: TokenRow) => void;
}) {
  const { account, onAddToken, onDelete, onRevoke } = props;
  const t = useDevetekTranslations('widget.serviceAccounts.account');
  const tRoles = useDevetekTranslations('widget.serviceAccounts.roles');
  const created = formatDate(account.createdAt);

  return (
    <article className="rounded-xl border bg-background/40 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold">
            <BotIcon className="size-4 text-muted-foreground" aria-hidden />
            <span className="break-all">{account.name}</span>
            {account.role && (
              <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[0.65rem] font-bold text-sky-700 dark:text-sky-300">
                {tRoles.has(account.role) ? tRoles(account.role) : account.role}
              </span>
            )}
          </h3>
          {account.description && (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {account.description}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {account.username && (
              <>
                <code className="font-mono">{account.username}</code>
                {' · '}
              </>
            )}
            {created && t('created', { date: created })}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            size="xs"
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={() => onAddToken(account)}
          >
            <KeyRoundIcon />
            {t('addToken')}
          </Button>
          <Button
            size="icon-sm"
            buttonStyle="outline"
            buttonColor="secondary"
            aria-label={t('delete', { name: account.name })}
            title={t('delete', { name: account.name })}
            onClick={() => onDelete(account)}
          >
            <Trash2Icon />
          </Button>
        </div>
      </div>

      <div className="mt-3">
        {account.tokens.length > 0 ? (
          <TokenList
            tokens={account.tokens}
            onRevoke={(token) => onRevoke(account, token)}
          />
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
            {t('noTokens')}
          </p>
        )}
      </div>
    </article>
  );
}
