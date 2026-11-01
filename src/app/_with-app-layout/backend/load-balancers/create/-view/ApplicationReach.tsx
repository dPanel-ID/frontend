import {
  ArrowRightIcon,
  BadgeCheckIcon,
  NetworkIcon,
  PencilLineIcon,
  PlusIcon,
  ServerIcon,
  TrashIcon,
} from 'lucide-react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import type { ApplicationCard } from '@/entities/application/rules/schema';

import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import type { Form, IconComponent } from '../-model/form';

type AddressMode = 'registered' | 'private' | 'custom';

const MODES: Array<{ mode: AddressMode; icon: IconComponent }> = [
  { mode: 'registered', icon: BadgeCheckIcon },
  { mode: 'private', icon: NetworkIcon },
  { mode: 'custom', icon: PencilLineIcon },
];

function applicationPort(application: ApplicationCard) {
  return application.configDefs.lifecycle?.run.port ?? 0;
}

/**
 * How the load balancer reaches an application rule's target. A deployment
 * on the gateway itself is always localhost; one on another server — maybe at
 * another provider — needs an address the gateway can actually reach.
 */
export function ApplicationReach(props: {
  form: Form;
  ruleIndex: number;
  application: ApplicationCard;
}) {
  const { application, form, ruleIndex } = props;
  const t = useDevetekTranslations('page.loadBalancersCreate.routing.reach');
  const gatewayId = useWatch({ control: form.control, name: 'serverId' });
  const mode = useController({
    control: form.control,
    name: `l7rules.${ruleIndex}.addressModeIfProxyPassApp`,
  });
  const targets = useFieldArray({
    control: form.control,
    name: `l7rules.${ruleIndex}.customTargetsIfProxyPassApp`,
  });
  const targetErrors =
    form.formState.errors.l7rules?.[ruleIndex]?.customTargetsIfProxyPassApp;

  const port = applicationPort(application);
  const servers = application.additionalInfo.servers;
  const remoteServers = servers.filter((server) => server.id !== gatewayId);
  const current: AddressMode = mode.field.value ?? 'registered';

  const selectMode = (next: AddressMode) => {
    mode.field.onChange(next);

    // Start the custom list from what "registered" would have used, so the
    // user edits addresses rather than typing them from nothing.
    if (next === 'custom' && targets.fields.length === 0) {
      const seeds = remoteServers
        .filter((server) => server.address)
        .map((server) => ({ address: server.address!, port: port || 80 }));
      targets.replace(
        seeds.length > 0 ? seeds : [{ address: '', port: port || 80 }],
      );
    }
  };

  return (
    <div className="grid gap-3 rounded-lg border bg-card p-3">
      <div>
        <p className="text-sm font-semibold">{t('title')}</p>
        <p className="text-xs text-muted-foreground">
          {remoteServers.length > 0
            ? t('hintRemote', { count: remoteServers.length })
            : t('hintLocal')}
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label={t('title')}
        className="grid gap-2 sm:grid-cols-3"
      >
        {MODES.map(({ icon: Icon, mode: option }) => {
          const selected = current === option;

          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => selectMode(option)}
              className={cn(
                'flex items-start gap-2.5 rounded-lg border bg-background p-2.5 text-left transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                selected
                  ? 'border-sky-400/60 bg-sky-500/10'
                  : 'hover:bg-accent',
              )}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md border',
                  selected
                    ? 'border-sky-400/40 bg-sky-500/15 text-sky-600 dark:text-sky-300'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="flex items-center gap-1.5 text-sm font-semibold">
                  {t(`modes.${option}.title`)}
                  {option === 'registered' && (
                    <span className="rounded-full border px-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                      {t('default')}
                    </span>
                  )}
                </span>
                <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                  {t(`modes.${option}.description`)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {current === 'custom' ? (
        <div className="grid gap-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t('customTitle')}
          </p>
          {targets.fields.map((target, index) => {
            const errors = targetErrors?.[index];

            return (
              <div key={target.id} className="grid gap-1">
                <div className="grid grid-cols-[minmax(0,1fr)_auto_96px_auto] items-center gap-2">
                  <Input
                    inputSize="sm"
                    className="font-mono"
                    placeholder={t('customPlaceholder')}
                    aria-label={t('customAddress')}
                    {...form.register(
                      `l7rules.${ruleIndex}.customTargetsIfProxyPassApp.${index}.address` as const,
                    )}
                  />
                  <span className="font-mono text-muted-foreground">:</span>
                  <Input
                    inputSize="sm"
                    type="number"
                    min={1}
                    max={65_535}
                    className="font-mono"
                    aria-label={t('customPort')}
                    {...form.register(
                      `l7rules.${ruleIndex}.customTargetsIfProxyPassApp.${index}.port` as const,
                      { valueAsNumber: true },
                    )}
                  />
                  <Button
                    danger
                    size="icon-sm"
                    buttonStyle="ghost"
                    disabled={targets.fields.length <= 1}
                    title={t('customRemove')}
                    aria-label={t('customRemove')}
                    onClick={() => targets.remove(index)}
                  >
                    <TrashIcon />
                  </Button>
                </div>
                {(errors?.address || errors?.port) && (
                  <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2">
                    <ErrorInline t={t} message={errors.address?.message} />
                    <ErrorInline t={t} message={errors.port?.message} />
                  </div>
                )}
              </div>
            );
          })}
          <Button
            size="sm"
            buttonStyle="outline"
            buttonColor="secondary"
            className="w-fit"
            onClick={() => targets.append({ address: '', port: port || 80 })}
          >
            <PlusIcon />
            {t('customAdd')}
          </Button>
          <ErrorInline t={t} message={targetErrors?.message} />
        </div>
      ) : (
        <ul className="grid gap-1.5">
          {servers.length === 0 && (
            <li className="rounded-md border border-dashed px-3 py-2 text-xs text-muted-foreground">
              {t('noDeployments')}
            </li>
          )}
          {servers.map((server) => {
            const local = server.id === gatewayId;
            const address = local
              ? 'localhost'
              : current === 'registered'
                ? server.address
                : undefined;

            return (
              <li
                key={server.id}
                className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border bg-background px-3 py-2 text-sm"
              >
                <ServerIcon className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 truncate font-medium">
                  {server.name ?? server.id}
                </span>
                <ArrowRightIcon className="size-3.5 shrink-0 text-muted-foreground" />
                {address ? (
                  <code className="font-mono text-xs">
                    {address}
                    {port ? `:${port}` : ''}
                  </code>
                ) : (
                  <span className="text-xs text-muted-foreground">
                    {t('privateResolved')}
                  </span>
                )}
                {local && (
                  <span className="ml-auto rounded-full border px-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                    {t('sameServer')}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
