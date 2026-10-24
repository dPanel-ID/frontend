import { Link } from '@tanstack/react-router';
import {
  ArrowRightIcon,
  RocketIcon,
  ScrollTextIcon,
  ServerIcon,
  SlidersHorizontalIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import { cn } from '@/shared/libs/tailwind/cn';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { useAppDataModel } from '../../-model/app-data';
import { useDeployNewBuild } from '../../-usecase/deploy-new-build';

export const LOGS_ANCHOR_ID = 'application-logs';

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: () => null,
  fallbackError: () => null,
})(couple(useAppDataModel, (s: any) => s.appDetail));

/**
 * The detail page's "what now". Someone who has never deployed anything
 * needs to be told that a build and a release are two steps, and then be
 * handed the three things they can actually do from here.
 */
export default guard(function NextSteps() {
  const t = useDevetekTranslations();

  const [appId, identity, deploymentTargets] = useAppDetail((s) => [
    s.id,
    s.identity,
    s.deploymentTargets,
  ]);

  const deploy = useDeployNewBuild();
  const server = deploymentTargets[0];
  const isRepository = identity.source === 'repository';

  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card">
      <div
        className={cn(
          'pointer-events-none absolute inset-0',
          FLOW_ACCENTS.sky.glow,
        )}
      />

      <div className="relative flex flex-col gap-4 p-5">
        <div className="min-w-0">
          <h2 className="text-base font-bold">
            {t('page.applicationDetail.nextSteps.title')}
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            {t('page.applicationDetail.nextSteps.description')}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {isRepository && (
            <ActionButton
              icon={RocketIcon}
              title={t('page.applicationDetail.nextSteps.deploy.title')}
              description={t(
                'page.applicationDetail.nextSteps.deploy.description',
              )}
              disabled={deploy.state != null}
              onClick={deploy.open}
            />
          )}

          <ActionLink
            icon={ScrollTextIcon}
            title={t('page.applicationDetail.nextSteps.logs.title')}
            description={t('page.applicationDetail.nextSteps.logs.description')}
            href={`#${LOGS_ANCHOR_ID}`}
          />

          {isRepository && (
            <UpdateRoute
              icon={SlidersHorizontalIcon}
              title={t('page.applicationDetail.nextSteps.settings.title')}
              description={t(
                'page.applicationDetail.nextSteps.settings.description',
              )}
              appId={appId}
            />
          )}

          {!isRepository && server && (
            <ServerRoute
              icon={ServerIcon}
              title={t('page.applicationDetail.nextSteps.server.title')}
              description={t(
                'page.applicationDetail.nextSteps.server.description',
              )}
              serverId={server.id}
            />
          )}
        </div>
      </div>
    </section>
  );
});

const CARD_CLASS =
  'group/step flex items-start gap-3 rounded-xl border bg-background/60 p-3 text-left transition-all hover:-translate-y-0.5 hover:border-sky-400/40 hover:shadow-lg hover:shadow-black/5 disabled:pointer-events-none disabled:opacity-50';

interface BodyProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

function Body(props: BodyProps) {
  const { icon: Icon, title, description } = props;

  return (
    <>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg border',
          FLOW_ACCENTS.sky.icon,
        )}
      >
        <Icon className="size-4" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1 text-sm font-semibold">
          {title}
          <ArrowRightIcon className="size-3.5 shrink-0 transition-transform group-hover/step:translate-x-0.5" />
        </span>
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
    </>
  );
}

function ActionButton(
  props: BodyProps & { disabled?: boolean; onClick: () => void },
) {
  const { disabled, onClick, ...body } = props;

  return (
    <button
      type="button"
      className={CARD_CLASS}
      disabled={disabled}
      onClick={onClick}
    >
      <Body {...body} />
    </button>
  );
}

function ActionLink(props: BodyProps & { href: string }) {
  const { href, ...body } = props;

  return (
    <a className={CARD_CLASS} href={href}>
      <Body {...body} />
    </a>
  );
}

function UpdateRoute(props: BodyProps & { appId: string }) {
  const { appId, ...body } = props;

  return (
    <Link
      className={CARD_CLASS}
      to="/applications/$id/update"
      params={{ id: appId }}
    >
      <Body {...body} />
    </Link>
  );
}

function ServerRoute(props: BodyProps & { serverId: string }) {
  const { serverId, ...body } = props;

  return (
    <Link className={CARD_CLASS} to="/servers/$id" params={{ id: serverId }}>
      <Body {...body} />
    </Link>
  );
}
