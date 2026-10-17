import { useState } from 'react';

import { CheckIcon, CopyIcon, TerminalIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { Button } from '@/shared/presentation/atoms/ButtonV2';

/**
 * Shell command that trusts the selected public key for the login user.
 * The key is single-quoted, with any quote in its comment escaped.
 */
export function buildAuthorizeKeyCommand(publicKey: string) {
  const quoted = publicKey.trim().replaceAll("'", `'\\''`);

  return [
    'mkdir -p ~/.ssh && chmod 700 ~/.ssh',
    `echo '${quoted}' >> ~/.ssh/authorized_keys`,
    'chmod 600 ~/.ssh/authorized_keys',
  ].join(' && \\\n  ');
}

/** Copyable command that authorizes the selected key on the server. */
export default function AuthorizeKeySnippet(props: {
  publicKey?: string;
  user: string;
}) {
  const { publicKey, user } = props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const [copied, setCopied] = useState(false);

  if (!publicKey) {
    return (
      <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
        {t('page.servers.create.ssh.publicKeyUnavailableToast')}
      </p>
    );
  }

  const command = buildAuthorizeKeyCommand(publicKey);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      openToaster({
        variant: 'error',
        message: t('page.servers.create.manual.authorize.copyFailed'),
      });
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border bg-neutral-950 text-neutral-100">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-3 py-2">
        <span className="inline-flex min-w-0 items-center gap-2 text-xs text-neutral-400">
          <TerminalIcon className="size-3.5 shrink-0" />
          <span className="truncate">
            {t('page.servers.create.manual.authorize.runAs', {
              user: user || 'root',
            })}
          </span>
        </span>
        <Button
          size="sm"
          buttonStyle="ghost"
          buttonColor="secondary"
          className="h-7 shrink-0 text-neutral-200 hover:bg-white/10 hover:text-white"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="size-3.5" />
          ) : (
            <CopyIcon className="size-3.5" />
          )}
          {copied
            ? t('page.servers.create.manual.authorize.copied')
            : t('page.servers.create.manual.authorize.copy')}
        </Button>
      </div>
      <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all p-3 font-mono text-xs leading-relaxed">
        {command}
      </pre>
    </div>
  );
}
