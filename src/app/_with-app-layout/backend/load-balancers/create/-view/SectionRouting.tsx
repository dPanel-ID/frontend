import { useEffect, useState } from 'react';

import {
  CheckCircle2Icon,
  NetworkIcon,
  PlusIcon,
  RouteIcon,
  SearchIcon,
  TrashIcon,
} from 'lucide-react';
import { useController, useFieldArray, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { AdapterApplicationFromDto } from '@/entities/application/adapter';
import type { ApplicationCard } from '@/entities/application/rules/schema';

import { ApiApplication } from '@/shared/api';
import { useAdapter } from '@/shared/libs/api-client';
import { cn } from '@/shared/libs/tailwind/cn';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { normalizeLoadBalancerEngine } from '../-lib/modules';
import type { Form } from '../-model/form';
import { DEFAULT_VALUES } from '../-model/form';
import {
  ChoiceButton,
  FormField,
  StateBlock,
} from '../-view/-presentation/fields';

import { ApplicationReach } from './ApplicationReach';

export function RoutingModePicker(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const lbKind = useController({ control: form.control, name: 'lbKind' });
  const engine = useWatch({ control: form.control, name: 'engine' });
  // Apache APISIX serves HTTP load balancers only; Caddy keeps layer 4.
  const layer4Unsupported = normalizeLoadBalancerEngine(engine) === 'apisix';

  const selectKind = (kind: 'l7' | 'l4') => {
    lbKind.field.onChange(kind);

    if (kind === 'l7' && !form.getValues('l7rules')?.length) {
      form.setValue('l7rules', DEFAULT_VALUES.l7rules);
    }

    const l4rule = form.getValues('l4rule');
    if (kind === 'l4' && (!l4rule || l4rule.upstreams.length < 1)) {
      form.setValue('l4rule', DEFAULT_VALUES.l4rule);
    }
  };

  useEffect(() => {
    if (layer4Unsupported && lbKind.field.value === 'l4') {
      lbKind.field.onChange('l7');
      if (!form.getValues('l7rules')?.length) {
        form.setValue('l7rules', DEFAULT_VALUES.l7rules);
      }
    }
  }, [form, layer4Unsupported, lbKind.field]);

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.sectionLbKind')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.kindHint')}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ChoiceButton
          icon={RouteIcon}
          selected={lbKind.field.value === 'l7'}
          title="L7"
          description={t('sidepanel.loadBalancerCreation.fieldLbKind.hintL7')}
          onClick={() => selectKind('l7')}
        />
        <ChoiceButton
          icon={NetworkIcon}
          selected={lbKind.field.value === 'l4'}
          title="L4"
          description={
            layer4Unsupported
              ? t('page.loadBalancersCreate.routing.l4UnsupportedByEngine')
              : t('sidepanel.loadBalancerCreation.fieldLbKind.hintL4')
          }
          disabled={layer4Unsupported}
          onClick={() => selectKind('l4')}
        />
      </div>
    </Card>
  );
}

export function FeatureConfiguration(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const lbKind = useWatch({ control: form.control, name: 'lbKind' });
  const protocol = useController({
    control: form.control,
    name: 'features.protocol',
  });
  const sslEnabled = useController({
    control: form.control,
    name: 'features.sslEnabled',
  });

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.sectionFeatures')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.featuresHint')}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-md border bg-background p-3">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            {t('sidepanel.loadBalancerCreation.fieldProtocol.title')}
          </p>
          {lbKind === 'l4' ? (
            <Combobox
              classNameButton="mt-2 w-full"
              placeholder={t(
                'sidepanel.loadBalancerCreation.fieldProtocol.placeholder',
              )}
              value={protocol.field.value}
              onChange={protocol.field.onChange}
              items={[
                { label: 'HTTP', value: 'http' },
                { label: 'TCP', value: 'tcp' },
                { label: 'UDP', value: 'udp' },
                { label: 'PostgreSQL', value: 'postgresql' },
                { label: 'MySQL', value: 'mysql' },
                { label: 'MongoDB', value: 'mongodb' },
                { label: 'Redis', value: 'redis' },
              ]}
            />
          ) : (
            <div className="mt-2 flex h-10 items-center rounded-md border bg-card px-3 text-sm font-semibold">
              HTTP / HTTPS
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-md border bg-background p-3">
          <div>
            <p className="text-xs font-bold uppercase text-muted-foreground">
              {t('sidepanel.loadBalancerCreation.fieldSslEnabled.title')}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {t('page.loadBalancersCreate.routing.sslHint')}
            </p>
          </div>
          <Switch
            checked={sslEnabled.field.value}
            onCheckedChange={sslEnabled.field.onChange}
            aria-label={t(
              'sidepanel.loadBalancerCreation.fieldSslEnabled.title',
            )}
          />
        </div>
      </div>
    </Card>
  );
}

export function L7RulesBuilder(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const rules = useFieldArray({ control: form.control, name: 'l7rules' });

  return (
    <Card className="overflow-hidden rounded-lg shadow-none">
      <div className="flex flex-col gap-3 border-b p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-sm font-bold">
            {t('sidepanel.loadBalancerCreation.upstreamRules.title')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('page.loadBalancersCreate.routing.l7Hint')}
          </p>
        </div>
        <Button
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() =>
            rules.append({
              pathMatch: '/*',
              type: 'proxy-pass',
              upstreamsIfProxyPass: [{ address: 'localhost', port: 80 }],
              applicationIdIfProxyPassApp: '',
              addressModeIfProxyPassApp: 'registered',
              customTargetsIfProxyPassApp: [],
            })
          }
        >
          <PlusIcon />
          {t('sidepanel.loadBalancerCreation.upstreamRules.addRule')}
        </Button>
      </div>

      <div className="grid gap-3 p-4">
        {rules.fields.map((rule, index) => (
          <L7RuleCard
            key={rule.id}
            form={form}
            index={index}
            canRemove={rules.fields.length > 1}
            onRemove={() => rules.remove(index)}
          />
        ))}
      </div>
      <div className="px-4 pb-4">
        <ErrorInline t={t} message={form.formState.errors.l7rules?.message} />
      </div>
    </Card>
  );
}

export function L7RuleCard(props: {
  form: Form;
  index: number;
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { canRemove, form, index, onRemove } = props;
  const t = useDevetekTranslations();
  const pathMatch = useController({
    control: form.control,
    name: `l7rules.${index}.pathMatch`,
  });
  const type = useController({
    control: form.control,
    name: `l7rules.${index}.type`,
  });
  const ruleType = useWatch({
    control: form.control,
    name: `l7rules.${index}.type`,
  });
  const ruleErrors = form.formState.errors.l7rules?.[index];

  return (
    <div className="overflow-hidden rounded-lg border bg-background">
      <div className="flex items-center justify-between gap-2 border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {t('sidepanel.loadBalancerCreation.upstreamRules.ruleLabel')} #
            {String(index + 1).padStart(2, '0')}
          </Badge>
          {/\/\*$/.test(pathMatch.field.value || '') && (
            <Badge>{t('page.loadBalancersCreate.routing.wildcard')}</Badge>
          )}
        </div>
        {canRemove && (
          <Button
            danger
            size="icon-sm"
            buttonStyle="ghost"
            title={t('sidepanel.loadBalancerCreation.upstreamRules.removeRule')}
            aria-label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.removeRule',
            )}
            onClick={onRemove}
          >
            <TrashIcon />
          </Button>
        )}
      </div>

      <div className="grid gap-3 p-3">
        <div className="grid gap-3 md:grid-cols-[240px_minmax(0,1fr)]">
          <FormField
            label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldType.title',
            )}
          >
            <Combobox
              classNameButton="w-full"
              items={[
                {
                  value: 'proxy-pass',
                  label: 'Proxy Pass',
                },
                {
                  value: 'proxy-pass-app',
                  label: t('common.terms.application'),
                },
              ]}
              value={type.field.value}
              onChange={type.field.onChange}
            />
          </FormField>

          <FormField
            label={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldPath.title',
            )}
            required
          >
            <Input
              className="font-mono"
              {...pathMatch.field}
              placeholder="/api/*"
            />
            <ErrorInline t={t} message={ruleErrors?.pathMatch?.message} />
          </FormField>
        </div>

        {ruleType === 'proxy-pass-app' ? (
          <ApplicationDestination form={form} ruleIndex={index} />
        ) : (
          <ProxyDestinations form={form} ruleIndex={index} />
        )}
      </div>
    </div>
  );
}

export function ProxyDestinations(props: { form: Form; ruleIndex: number }) {
  const { form, ruleIndex } = props;
  const t = useDevetekTranslations();
  const upstreams = useFieldArray({
    control: form.control,
    name: `l7rules.${ruleIndex}.upstreamsIfProxyPass`,
  });
  const upstreamErrors =
    form.formState.errors.l7rules?.[ruleIndex]?.upstreamsIfProxyPass;

  return (
    <FormField
      label={t(
        'sidepanel.loadBalancerCreation.upstreamRules.fieldDestination.title',
      )}
      required
    >
      <div className="grid gap-2">
        {upstreams.fields.map((upstream, upstreamIndex) => {
          const entryErrors = upstreamErrors?.[upstreamIndex];

          return (
            <div key={upstream.id} className="grid gap-1">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_132px_auto] items-center gap-2">
                <Input
                  inputSize="sm"
                  className="font-mono"
                  {...form.register(
                    `l7rules.${ruleIndex}.upstreamsIfProxyPass.${upstreamIndex}.address` as const,
                  )}
                />
                <span className="font-mono">:</span>
                <Input
                  inputSize="sm"
                  type="number"
                  min={1}
                  max={65_535}
                  className="font-mono"
                  {...form.register(
                    `l7rules.${ruleIndex}.upstreamsIfProxyPass.${upstreamIndex}.port` as const,
                    { valueAsNumber: true },
                  )}
                />
                <Button
                  danger
                  size="icon-sm"
                  buttonStyle="ghost"
                  disabled={upstreams.fields.length <= 1}
                  title={t('common.actions.delete')}
                  aria-label={t('common.actions.delete')}
                  onClick={() => upstreams.remove(upstreamIndex)}
                >
                  <TrashIcon />
                </Button>
              </div>

              {(entryErrors?.address || entryErrors?.port) && (
                <div className="grid grid-cols-[minmax(0,1fr)_132px] gap-2">
                  <ErrorInline t={t} message={entryErrors.address?.message} />
                  <ErrorInline t={t} message={entryErrors.port?.message} />
                </div>
              )}
            </div>
          );
        })}

        <Button
          size="sm"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => upstreams.append({ address: 'localhost', port: 80 })}
        >
          <PlusIcon />
          {t(
            'sidepanel.loadBalancerCreation.upstreamRules.fieldDestination.add',
          )}
        </Button>
      </div>
    </FormField>
  );
}

export function ApplicationDestination(props: {
  form: Form;
  ruleIndex: number;
}) {
  const { form, ruleIndex } = props;
  const t = useDevetekTranslations();
  const [search, setSearch] = useState('');
  const [responseApplications] = ApiApplication.Find.useGet({
    page: 1,
    limit: 12,
    name: search,
  });
  const applications = useAdapter(responseApplications, (raw) => ({
    list: (raw.applications ?? []).map((application) =>
      AdapterApplicationFromDto.toApplicationCard(application).unwrap(),
    ),
    pagination: raw.pagination,
  }));
  const applicationId = useController({
    control: form.control,
    name: `l7rules.${ruleIndex}.applicationIdIfProxyPassApp`,
  });
  const ruleErrors = form.formState.errors.l7rules?.[ruleIndex];
  // Kept apart from the list, which a new search replaces.
  const [selected, setSelected] = useState<ApplicationCard>();
  const selectedApplication =
    selected?.id === applicationId.field.value
      ? selected
      : applications.$status === 'success'
        ? applications.list.find(
            (application) => application.id === applicationId.field.value,
          )
        : undefined;

  return (
    <FormField
      label={t('sidepanel.loadBalancerCreation.upstreamRules.fieldApp.title')}
      required
    >
      <div className="grid gap-2">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            placeholder={t(
              'sidepanel.loadBalancerCreation.upstreamRules.fieldApp.placeholder',
            )}
          />
        </div>

        {applications.$status === 'loading' && (
          <StateBlock>
            <Spinner />
            <span>{t('page.loadBalancersCreate.loading')}</span>
          </StateBlock>
        )}

        {applications.$status === 'failed' && (
          <StateBlock>
            {t('sidepanel.loadBalancerCreation.upstreamRules.fieldApp.onError')}
          </StateBlock>
        )}

        {applications.$status === 'success' && (
          <div className="grid max-h-60 gap-2 overflow-y-auto pr-1">
            {applications.list.map((application) => (
              <ApplicationOption
                key={application.id}
                application={application}
                selected={applicationId.field.value === application.id}
                onSelect={() => {
                  setSelected(application);
                  applicationId.field.onChange(application.id);
                }}
              />
            ))}
          </div>
        )}

        {selectedApplication && (
          <ApplicationReach
            form={form}
            ruleIndex={ruleIndex}
            application={selectedApplication}
          />
        )}

        <ErrorInline
          t={t}
          message={ruleErrors?.applicationIdIfProxyPassApp?.message}
        />
      </div>
    </FormField>
  );
}

export function L4RuleBuilder(props: { form: Form }) {
  const { form } = props;
  const t = useDevetekTranslations();
  const upstreams = useFieldArray({
    control: form.control,
    name: 'l4rule.upstreams',
  });
  const upstreamErrors = form.formState.errors.l4rule?.upstreams;

  return (
    <Card className="rounded-lg p-4 shadow-none">
      <div className="mb-3">
        <h3 className="text-sm font-bold">
          {t('sidepanel.loadBalancerCreation.l4rule.title')}
        </h3>
        <p className="text-xs text-muted-foreground">
          {t('page.loadBalancersCreate.routing.l4Hint')}
        </p>
      </div>

      <div className="grid gap-2">
        {upstreams.fields.map((upstream, index) => {
          const entryErrors = upstreamErrors?.[index];

          return (
            <div key={upstream.id} className="grid gap-1">
              <div className="grid grid-cols-[minmax(0,1fr)_auto_120px_auto] items-center gap-1">
                <Input
                  className="font-mono"
                  {...form.register(`l4rule.upstreams.${index}.address`, {
                    required: true,
                  })}
                />
                <span className="font-mono">:</span>
                <Input
                  type="number"
                  min={1}
                  max={65_535}
                  className="font-mono"
                  {...form.register(`l4rule.upstreams.${index}.port`, {
                    valueAsNumber: true,
                  })}
                />
                <Button
                  danger
                  size="icon-sm"
                  buttonStyle="ghost"
                  disabled={upstreams.fields.length <= 1}
                  title={t('common.actions.delete')}
                  aria-label={t('common.actions.delete')}
                  onClick={() => upstreams.remove(index)}
                >
                  <TrashIcon />
                </Button>
              </div>
              {(entryErrors?.address || entryErrors?.port) && (
                <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2">
                  <ErrorInline t={t} message={entryErrors.address?.message} />
                  <ErrorInline t={t} message={entryErrors.port?.message} />
                </div>
              )}
            </div>
          );
        })}

        <Button
          className="mt-2"
          buttonStyle="outline"
          buttonColor="secondary"
          onClick={() => upstreams.append({ address: 'localhost', port: 80 })}
        >
          <PlusIcon />
          {t('sidepanel.loadBalancerCreation.l4rule.fieldDestination.add')}
        </Button>
      </div>
    </Card>
  );
}

export function ApplicationOption(props: {
  application: ApplicationCard;
  selected: boolean;
  onSelect: () => void;
}) {
  const { application, onSelect, selected } = props;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'flex items-center justify-between gap-3 rounded-md border bg-background p-3 text-left transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
        selected && 'border-primary bg-primary/10',
      )}
    >
      <span className="min-w-0">
        <span className="block truncate text-sm font-bold">
          {application.identity.name}
        </span>
        <span className="mt-1 block truncate text-xs text-muted-foreground">
          {application.additionalInfo.repoUrl ?? application.id}
        </span>
      </span>
      {selected && <CheckCircle2Icon className="size-5 text-primary" />}
    </button>
  );
}
