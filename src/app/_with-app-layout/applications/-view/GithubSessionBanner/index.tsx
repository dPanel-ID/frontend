import { SiGithub } from '@icons-pack/react-simple-icons';
import { AlertTriangleIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { isGithubAuthFailure } from '@/shared/libs/api-client/is-github-auth-failure';
import type { Response } from '@/shared/libs/api-client/rules/types';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import { Card } from '@/shared/presentation/atoms/Card';

import { useGithubConnection } from '../../-lib/github-connection';

interface GithubSessionBannerProps {
  className?: string;
  extraResponses?: Array<Response<unknown>>;
}

export default function GithubSessionBanner(props: GithubSessionBannerProps) {
  const { className, extraResponses = [] } = props;

  const t = useDevetekTranslations();
  const connection = useGithubConnection();

  // A stored token that GitHub will not confirm is just as broken as no
  // token at all, so `unverified` raises the banner too; it used to need an
  // error whose wording the failure matcher happened to recognise.
  const shouldReloginGithub =
    connection.state === 'disconnected' ||
    connection.state === 'unverified' ||
    extraResponses.some(isGithubAuthFailure);

  if (!shouldReloginGithub) return null;

  const gitProfile = connection.state !== 'disconnected';
  const handleClickLoginGithub = connection.connect;

  return (
    <Card
      className={cn(
        'rounded-2xl border-2 border-dashed border-yellow-500/80 bg-yellow-50/60 dark:bg-yellow-950/20',
        className,
      )}
    >
      <div className="grid grid-cols-[auto_1fr] gap-x-4 p-4">
        <div className="relative">
          <SiGithub className="size-10" />
          {gitProfile && (
            <span className="absolute -right-1 -top-1 rounded-full bg-yellow-500 p-0.5 text-white">
              <AlertTriangleIcon className="size-3" />
            </span>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold">
              {gitProfile
                ? t('page.applicationDetail.githubBanner.reloginTitle')
                : t('page.applicationDetail.githubBanner.title')}
            </h3>
            <h5 className="text-sm">
              {gitProfile
                ? t('page.applicationDetail.githubBanner.reloginSubtitle')
                : t('page.applicationDetail.githubBanner.subtitle')}
            </h5>
          </div>

          <Button className="w-max" onClick={handleClickLoginGithub}>
            {gitProfile
              ? t('page.applicationDetail.githubBanner.reloginCta')
              : t('page.applicationDetail.githubBanner.loginCta')}
          </Button>
        </div>
      </div>
    </Card>
  );
}
