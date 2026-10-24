import { SiGithub } from '@icons-pack/react-simple-icons';
import { AlertTriangleIcon, CheckIcon, PlugIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/presentation/atoms/DropdownMenu';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useGithubConnection } from '../../-lib/github-connection';

interface GithubAccountButtonProps {
  className?: string;
}

/**
 * The GitHub control that is always on screen in this module.
 *
 * It used to exist only as a warning banner that appeared when a call came
 * back with a GitHub auth error, so someone whose token had quietly gone
 * stale — or who simply wanted to connect a different account — had no
 * button anywhere. Connected or not, there is now something to click.
 */
export default function GithubAccountButton(props: GithubAccountButtonProps) {
  const { className } = props;

  const t = useDevetekTranslations('page.applications.github');
  const connection = useGithubConnection();

  if (connection.state === 'checking') {
    return (
      <Button variant="outline" size="sm" className={className} disabled>
        <Spinner />
        <span className="hidden sm:inline">{t('checking')}</span>
      </Button>
    );
  }

  if (connection.state === 'connected') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={className}
            title={t('connectedTo', { login: connection.login ?? '' })}
          >
            <SiGithub className="size-4" />
            <span className="hidden max-w-32 truncate sm:inline">
              {connection.login}
            </span>
            <CheckIcon className="size-3 text-emerald-500" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={connection.connect}>
            {t('reconnect')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  const isUnverified = connection.state === 'unverified';

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        isUnverified &&
          'border-amber-400/60 text-amber-700 hover:text-amber-700 dark:text-amber-300 dark:hover:text-amber-300',
        className,
      )}
      onClick={connection.connect}
      title={isUnverified ? t('reconnectHint') : t('connectHint')}
    >
      {isUnverified ? (
        <AlertTriangleIcon className="size-4" />
      ) : (
        <PlugIcon className="size-4" />
      )}
      {isUnverified ? t('reconnect') : t('connect')}
    </Button>
  );
}
