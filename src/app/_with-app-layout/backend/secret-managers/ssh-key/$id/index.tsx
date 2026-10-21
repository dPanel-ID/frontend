import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { KeyRoundIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiSecret } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Card } from '@/shared/presentation/atoms/Card';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { FlowHero } from '@/shared/presentation/organisms/FlowHero';
import { AsideHelpSupport } from '@/widgets/aside-help-support';
import { FailedState } from '@/widgets/failed-state';

import SshKeyDetailView from './-view';

export const Route = createFileRoute(
  '/_with-app-layout/backend/secret-managers/ssh-key/$id/',
)({
  component: SshKeyDetailPage,
});

function SshKeyDetailPage() {
  const { id } = Route.useParams();
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [response] = ApiSecret.SshKey.Detail.$Id.useGet({ id });

  const headnote = (
    <Breadcrumb
      items={[
        { text: t('sidebar.dashboard'), url: '/dashboard' },
        { text: t('sidebar.backend') },
        {
          text: t('page.sshKeys.headerTitle'),
          url: '/backend/secret-managers/ssh-key',
        },
      ]}
    />
  );

  if (response.$status === 'failed') {
    const isClientError =
      response.kind === 'api' && Number(response.error.code) < 500;

    return (
      <div className="h-full">
        <FailedState.WallCentered
          errorPayload={response.error.message}
          ctaOnClick={
            isClientError
              ? () =>
                  navigate({
                    to: '/backend/secret-managers/ssh-key',
                    search: { page: 1 },
                    replace: true,
                  })
              : undefined
          }
          ctaText={isClientError ? t('page.sshKeys.detail.back') : undefined}
        />
      </div>
    );
  }

  if (response.$status !== 'success') {
    return (
      <div className="flex flex-col gap-4">
        <FlowHero
          accent="sky"
          icon={KeyRoundIcon}
          headnote={headnote}
          title={t('page.sshKeys.headerTitle')}
          description={t('page.sshKeys.detail.loading')}
        />
        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <Shimmer key={index} className="h-16 rounded-xl" />
          ))}
        </div>
        <Shimmer className="h-28 rounded-2xl" />
        <Shimmer className="h-40 rounded-2xl" />
      </div>
    );
  }

  const name = response.name ?? t('page.sshKeys.detail.fallbackName');
  const description = [
    response.type,
    response.data?.length
      ? t('page.sshKeys.card.bits', { length: response.data.length })
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <>
      <title>{t('page.sshKeys.detail.documentTitle', { name })}</title>

      <div className="flex flex-col gap-4">
        <FlowHero
          accent="sky"
          icon={KeyRoundIcon}
          headnote={headnote}
          title={name}
          description={description || t('page.sshKeys.headerDesc')}
        />

        <div className="flex flex-col-reverse gap-4 xl:grid xl:grid-cols-[minmax(0,1fr)_0.4fr]">
          <SshKeyDetailView sshKey={response} />

          <aside className="hidden flex-col gap-4 xl:flex">
            <Card className="rounded-2xl">
              <AsideHelpSupport.Complete topic="ssh" />
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
}

function Shimmer(props: { className?: string }) {
  return (
    <div
      className={cn('animate-pulse rounded bg-border/60', props.className)}
    />
  );
}
