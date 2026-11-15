import { CircleAlertIcon, XIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import useAuthRedirectError from '../usecase/use-auth-redirect-error';

interface AuthRedirectErrorNoticeProps {
  className?: string;
}

/**
 * Explains, in the reader's language, why a Google or GitHub sign-in or link
 * did not complete. Renders nothing when the page was not reached that way.
 */
export default function AuthRedirectErrorNotice(
  props: AuthRedirectErrorNoticeProps,
) {
  const { className } = props;
  const t = useDevetekTranslations();
  const { errorKey, dismiss } = useAuthRedirectError();

  if (!errorKey) return null;

  return (
    <div
      role="alert"
      className={cn(
        'flex w-full items-start gap-2 rounded-lg border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300',
        className,
      )}
    >
      <CircleAlertIcon className="mt-0.5 size-4 shrink-0" aria-hidden />
      <p className="min-w-0 flex-1 break-words leading-relaxed">
        {t(`toaster.authRedirect.${errorKey}`)}
      </p>
      <Button
        size="icon-xs"
        buttonStyle="ghost"
        buttonColor="secondary"
        className="shrink-0 text-current"
        onClick={dismiss}
        aria-label={t('common.actions.dismiss')}
        title={t('common.actions.dismiss')}
      >
        <XIcon />
      </Button>
    </div>
  );
}
