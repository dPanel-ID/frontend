import { KeyRoundIcon, LinkIcon, UnlinkIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { Button } from '@/shared/presentation/atoms/ButtonV2';
import IconBrandGithub from '@/shared/presentation/icons/BrandGithub';
import IconBrandGoogle from '@/shared/presentation/icons/BrandGoogle';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';

import type {
  SignInMethodView,
  SignInProvider,
} from '../../rules/sign-in-methods';

const ICON_CLASS = 'size-4 shrink-0';

function ProviderIcon(props: { provider: SignInProvider }) {
  const { provider } = props;
  if (provider === 'google') return <IconBrandGoogle className={ICON_CLASS} />;
  if (provider === 'github') return <IconBrandGithub className={ICON_CLASS} />;
  return (
    <KeyRoundIcon
      className={`${ICON_CLASS} text-muted-foreground`}
      aria-hidden
    />
  );
}

interface SignInMethodRowProps {
  method: SignInMethodView;
  providerName: string;
  onLink: () => void;
  onUnlink: () => void;
}

/** One sign-in method with its status and the action it allows. */
export default function SignInMethodRow(props: SignInMethodRowProps) {
  const { method, onLink, onUnlink, providerName } = props;
  const t = useDevetekTranslations('page.profile.signInMethods');
  const { action, isOnlyMethod, linked, provider, username } = method;

  const detail = (() => {
    if (isOnlyMethod) return t('onlyMethod');
    if (provider === 'github' && username) {
      return t('githubLinkedAs', { username });
    }
    return t(`${provider}Help`);
  })();

  const statusLabel =
    provider === 'password'
      ? t(linked ? 'passwordSet' : 'passwordNotSet')
      : t(linked ? 'linked' : 'notLinked');

  return (
    <li className="flex min-w-0 flex-col gap-3 rounded-md border bg-background p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card">
          <ProviderIcon provider={provider} />
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <p className="truncate text-sm font-medium">{providerName}</p>
            <StatusPill
              tone={linked ? 'success' : 'neutral'}
              label={statusLabel}
            />
          </div>
          <p
            className="mt-1 break-words text-xs text-muted-foreground"
            title={detail}
          >
            {detail}
          </p>
        </div>
      </div>

      {action === 'link' && (
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          className="shrink-0 self-start sm:self-center"
          onClick={onLink}
          aria-label={t('linkAria', { provider: providerName })}
          title={t('linkAria', { provider: providerName })}
        >
          <LinkIcon />
          {t('link')}
        </Button>
      )}
      {action === 'unlink' && (
        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          className="shrink-0 self-start sm:self-center"
          onClick={onUnlink}
          aria-label={t('unlinkAria', { provider: providerName })}
          title={t('unlinkAria', { provider: providerName })}
        >
          <UnlinkIcon />
          {t('unlink')}
        </Button>
      )}
    </li>
  );
}
