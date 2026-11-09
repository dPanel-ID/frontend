import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { formatDate } from '../../lib/accounts';
import type { TokenRow, TokenStatus } from '../../rules/types';

const STATUS_CLASS: Record<TokenStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  expired: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
  revoked: 'bg-border/60 text-muted-foreground',
};

/** An account's tokens, one row each, without any secret. */
export default function TokenList(props: {
  tokens: TokenRow[];
  onRevoke: (token: TokenRow) => void;
}) {
  const { onRevoke, tokens } = props;
  const t = useDevetekTranslations('widget.serviceAccounts.tokens');

  return (
    <ul className="divide-y rounded-lg border">
      {tokens.map((token) => (
        <li
          key={token.id}
          className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold break-all">
                {token.name}
              </span>
              <code className="font-mono text-xs text-muted-foreground">
                dps_…{token.hint}
              </code>
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[0.65rem] font-bold',
                  STATUS_CLASS[token.status],
                )}
              >
                {t(`status.${token.status}`)}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {token.expiresAt
                ? t('expires', { date: formatDate(token.expiresAt) ?? '' })
                : t('noExpiry')}
              {' · '}
              {token.lastUsedAt
                ? t('lastUsed', { date: formatDate(token.lastUsedAt) ?? '' })
                : t('neverUsed')}
            </p>
          </div>

          {token.status === 'active' && (
            <Button
              size="xs"
              buttonStyle="outline"
              buttonColor="secondary"
              className="self-start sm:self-center"
              onClick={() => onRevoke(token)}
            >
              {t('revoke')}
            </Button>
          )}
        </li>
      ))}
    </ul>
  );
}
