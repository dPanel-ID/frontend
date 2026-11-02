import type { ReactNode } from 'react';

import {
  AlertTriangleIcon,
  ContainerIcon,
  DoorOpenIcon,
  GlobeIcon,
  StickyNoteIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import {
  FIREWALL_RULE_ACTIONS,
  FIREWALL_RULE_PROTOCOLS,
} from '@/shared/api/-dtos/firewall';
import { cn } from '@/shared/libs/tailwind/cn';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Switch } from '@/shared/presentation/atoms/Switch';

import { useServerFirewallRuleModel } from '../../model';

/** The rule's fields, in the order a beginner thinks about them. */
export default function Forms() {
  const { dockerFiltering, form, submitError } = useServerFirewallRuleModel();
  const t = useDevetekTranslations('sidepanel.firewallRule');
  const { errors } = form.formState;

  // useWatch, not form.watch: the React Compiler memoizes form.watch() and
  // the fields would keep their first values.
  const [action, docker, protocol, port, source] = useWatch({
    control: form.control,
    name: ['action', 'docker', 'protocol', 'port', 'source'],
  });

  const errorText = (message?: string) =>
    message ? t(`errors.${message}`) : undefined;

  const setField = <K extends 'action' | 'protocol' | 'docker'>(
    name: K,
    value: K extends 'docker' ? boolean : string,
  ) => {
    form.setValue(name, value as never, {
      shouldDirty: true,
      shouldValidate: true,
    });
    // The cross-field rules (range needs a protocol, limit is host-only)
    // live on other fields; re-check them too.
    void form.trigger();
  };

  const opensEverything =
    (action === 'allow' || action === 'limit') &&
    !port.trim() &&
    !source.trim();

  return (
    <div className="grid gap-5 py-2 pb-6">
      {submitError && (
        <div
          role="alert"
          className="rounded-xl border border-red-400/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300"
        >
          <p className="font-semibold">{t('errorTitle')}</p>
          <p className="mt-1 break-words">{submitError}</p>
        </div>
      )}

      <Section
        icon={DoorOpenIcon}
        title={t('sections.what.title')}
        description={t('sections.what.description')}
      >
        <Field label={t('fields.action')} hint={t(`actionHint.${action}`)}>
          <ChoiceGroup
            label={t('fields.action')}
            options={FIREWALL_RULE_ACTIONS.map((id) => ({
              id,
              label: t(`actions.${id}`),
            }))}
            value={action}
            onChange={(value) => setField('action', value)}
          />
          <ErrorInline message={errorText(errors.action?.message)} />
        </Field>

        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_10rem]">
          <Field
            label={t('fields.port')}
            hint={t('portHint')}
            htmlFor="firewall-rule-port"
          >
            <Input
              id="firewall-rule-port"
              autoComplete="off"
              spellCheck={false}
              inputMode="numeric"
              placeholder="443"
              {...form.register('port')}
            />
            <ErrorInline message={errorText(errors.port?.message)} />
          </Field>
          <Field label={t('fields.protocol')}>
            <ChoiceGroup
              label={t('fields.protocol')}
              options={FIREWALL_RULE_PROTOCOLS.map((id) => ({
                id,
                label: t(`protocols.${id}`),
              }))}
              value={protocol}
              onChange={(value) => setField('protocol', value)}
            />
            <ErrorInline message={errorText(errors.protocol?.message)} />
          </Field>
        </div>
      </Section>

      <Section
        icon={GlobeIcon}
        title={t('sections.who.title')}
        description={t('sections.who.description')}
      >
        <Field
          label={t('fields.source')}
          hint={t('sourceHint')}
          htmlFor="firewall-rule-source"
        >
          <Input
            id="firewall-rule-source"
            autoComplete="off"
            spellCheck={false}
            placeholder={t('sourcePlaceholder')}
            {...form.register('source')}
          />
          <ErrorInline message={errorText(errors.source?.message)} />
        </Field>
        {opensEverything && (
          <p className="flex items-start gap-2 rounded-lg border border-amber-400/30 bg-amber-500/5 p-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangleIcon className="mt-0.5 size-3.5 shrink-0" />
            {t('opensEverything')}
          </p>
        )}
      </Section>

      <Section
        icon={ContainerIcon}
        title={t('sections.docker.title')}
        description={t('sections.docker.description')}
      >
        <label className="flex items-center justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2.5">
          <span className="text-sm font-semibold">{t('fields.docker')}</span>
          <Switch
            checked={docker}
            onCheckedChange={(checked) => setField('docker', checked)}
            aria-label={t('fields.docker')}
          />
        </label>
        {docker && !dockerFiltering && (
          <p className="text-xs text-amber-700 dark:text-amber-300">
            {t('dockerFilteringOff')}
          </p>
        )}
      </Section>

      <Section
        icon={StickyNoteIcon}
        title={t('sections.note.title')}
        description={t('sections.note.description')}
      >
        <Field label={t('fields.comment')} htmlFor="firewall-rule-comment">
          <Input
            id="firewall-rule-comment"
            autoComplete="off"
            maxLength={64}
            placeholder={t('commentPlaceholder')}
            {...form.register('comment')}
          />
          <ErrorInline message={errorText(errors.comment?.message)} />
        </Field>
      </Section>
    </div>
  );
}

/** A small single-choice button group with radio semantics. */
function ChoiceGroup<Id extends string>(props: {
  label: string;
  options: Array<{ id: Id; label: string }>;
  value: Id;
  onChange: (value: Id) => void;
}) {
  const { label, onChange, options, value } = props;

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="flex flex-wrap gap-1 rounded-lg border bg-background/60 p-1"
    >
      {options.map((option) => {
        const isActive = option.id === value;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(option.id)}
            className={cn(
              'flex-1 rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
              isActive
                ? 'bg-card text-primary shadow-sm ring-1 ring-sky-400/40'
                : 'text-muted-foreground hover:text-primary',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function Section(props: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { children, description, icon: Icon, title } = props;

  return (
    <section className="grid gap-3 border-t pt-5 first:border-t-0 first:pt-0">
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 size-4 shrink-0 text-sky-600 dark:text-sky-300" />
        <div className="min-w-0">
          <h4 className="text-sm font-bold">{title}</h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field(props: {
  label: string;
  hint?: string;
  /** The input this label names; choice groups carry their own label. */
  htmlFor?: string;
  children: ReactNode;
}) {
  const { children, hint, htmlFor, label } = props;
  const Label = htmlFor ? 'label' : 'span';

  return (
    <div className="flex flex-col gap-1.5">
      <Label
        htmlFor={htmlFor}
        className="text-xs font-semibold text-primary/80"
      >
        {label}
      </Label>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </div>
  );
}
