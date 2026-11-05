import type { ReactNode } from 'react';

import {
  FileTextIcon,
  FolderIcon,
  GitBranchIcon,
  HammerIcon,
  LockIcon,
  PlugIcon,
  RocketIcon,
  ServerCogIcon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useController, useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { Switch } from '@/shared/presentation/atoms/Switch';

import { useApplicationEditModel } from '../../model';
import { BUILD_TIMEOUT_PRESETS } from '../../rules/form-schema';

import FormItemFromBranch from './GitBranch';

/** What can change about an application, then what is fixed and why. */
export default function Forms() {
  const { form, status, fixed } = useApplicationEditModel();
  const t = useDevetekTranslations('sidepanel.editApplication');

  if (status === 'failed') {
    return (
      <p
        role="alert"
        className="rounded-xl border border-red-400/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-300"
      >
        {t('loadFailed')}
      </p>
    );
  }

  if (!fixed) {
    return (
      <div className="grid gap-3 py-2">
        {[0, 1, 2].map((key) => (
          <div
            key={key}
            className="h-24 animate-pulse rounded-xl border bg-card"
          />
        ))}
      </div>
    );
  }

  return (
    <form
      className="grid gap-5 py-2 pb-6"
      onSubmit={(event) => event.preventDefault()}
    >
      <SectionAutoDeploy />
      <SectionBuild />

      <Section
        icon={FileTextIcon}
        title={t('description.title')}
        description={t('description.description')}
      >
        <Field
          label={t('description.label')}
          htmlFor="application-edit-description"
        >
          <Input
            id="application-edit-description"
            autoComplete="off"
            maxLength={200}
            placeholder={t('description.placeholder')}
            {...form.register('description')}
          />
        </Field>
      </Section>

      <SectionFixed />
    </form>
  );
}

function SectionAutoDeploy() {
  const { form, serverCount } = useApplicationEditModel();
  const t = useDevetekTranslations('sidepanel.editApplication.autoDeployment');
  const { field } = useController({
    control: form.control,
    name: 'autoDeploy.isEnabled',
  });
  const branch = useWatch({
    control: form.control,
    name: 'autoDeploy.fromBranch',
  });
  const branchError = form.formState.errors.autoDeploy?.fromBranch?.message;

  return (
    <Section
      icon={RocketIcon}
      title={t('title')}
      description={t('description')}
    >
      <label
        className={cn(
          'flex items-center justify-between gap-3 rounded-xl border px-3 py-3 transition-colors',
          field.value ? 'border-sky-400/40 bg-sky-500/5' : 'bg-background/60',
        )}
      >
        <span className="grid gap-0.5">
          <span className="text-sm font-semibold">{t('enable')}</span>
          <span className="text-xs text-muted-foreground">
            {field.value ? t('stateOn') : t('stateOff')}
          </span>
        </span>
        <Switch
          checked={field.value}
          onCheckedChange={(checked) => {
            field.onChange(checked);
            if (!checked) {
              form.setValue('autoDeploy.fromBranch', '', { shouldDirty: true });
            }
          }}
          aria-label={t('enable')}
        />
      </label>

      {field.value && (
        <Field label={t('deployFromBranch')} hint={t('branchHint')}>
          <FormItemFromBranch />
          <ErrorInline message={branchError ? t(branchError) : undefined} />
        </Field>
      )}

      {field.value && branch && (
        <p className="flex items-start gap-2 rounded-lg border bg-background/60 p-2.5 text-xs text-muted-foreground">
          <GitBranchIcon className="mt-0.5 size-3.5 shrink-0 text-sky-600 dark:text-sky-300" />
          {t('summary', { branch, count: serverCount })}
        </p>
      )}
    </Section>
  );
}

function SectionBuild() {
  const { form } = useApplicationEditModel();
  const t = useDevetekTranslations('sidepanel.editApplication.build');
  const { field } = useController({
    control: form.control,
    name: 'buildTimeout',
  });
  const stored = form.formState.defaultValues?.buildTimeout ?? '';

  // The API cannot clear a stored limit, so "Default" is offered only while
  // none is set. A custom stored value stays selectable.
  const options = [
    ...(stored ? [] : ['']),
    ...BUILD_TIMEOUT_PRESETS,
    ...(stored && !(BUILD_TIMEOUT_PRESETS as readonly string[]).includes(stored)
      ? [stored]
      : []),
  ];

  return (
    <Section
      icon={HammerIcon}
      title={t('title')}
      description={t('description')}
    >
      <Field label={t('timeout')} hint={t('timeoutHint')}>
        <div
          role="radiogroup"
          aria-label={t('timeout')}
          className="flex flex-wrap gap-1 rounded-lg border bg-background/60 p-1"
        >
          {options.map((value) => {
            const isActive = (field.value ?? '') === value;
            return (
              <button
                key={value || 'default'}
                type="button"
                role="radio"
                aria-checked={isActive}
                onClick={() => field.onChange(value)}
                className={cn(
                  'flex-1 whitespace-nowrap rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50',
                  isActive
                    ? 'bg-card text-primary shadow-sm ring-1 ring-sky-400/40'
                    : 'text-muted-foreground hover:text-primary',
                )}
              >
                {value ? formatDuration(value) : t('default')}
              </button>
            );
          })}
        </div>
      </Field>
    </Section>
  );
}

function SectionFixed() {
  const { fixed } = useApplicationEditModel();
  const t = useDevetekTranslations('sidepanel.editApplication.fixed');
  if (!fixed) return null;

  const rows: Array<{ icon: LucideIcon; label: string; value: ReactNode }> = [
    {
      icon: GitBranchIcon,
      label: t('repository'),
      value: fixed.repositoryUrl ? (
        <a
          href={fixed.repositoryUrl.replace(/\.git$/, '')}
          target="_blank"
          rel="noreferrer"
          className="underline-offset-2 hover:underline"
        >
          {fixed.repository || fixed.repositoryUrl}
        </a>
      ) : (
        fixed.repository || '-'
      ),
    },
    { icon: FolderIcon, label: t('workdir'), value: fixed.workdir || '-' },
    { icon: PlugIcon, label: t('port'), value: fixed.port ?? '-' },
    {
      icon: ServerCogIcon,
      label: t('service'),
      value: fixed.serviceName || '-',
    },
  ];

  return (
    <Section icon={LockIcon} title={t('title')} description={t('description')}>
      <dl className="divide-y rounded-xl border bg-muted/30">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-3 px-3 py-2.5"
          >
            <dt className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <row.icon className="size-3.5" />
              {row.label}
            </dt>
            <dd className="flex min-w-0 items-center gap-1.5 font-mono text-xs">
              <span className="truncate">{row.value}</span>
              <LockIcon
                className="size-3 shrink-0 text-muted-foreground/70"
                aria-hidden
              />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** "90m" -> "1 h 30 min", "15m" -> "15 min". */
function formatDuration(value: string) {
  const match = /^(?:(\d+)h)?(?:(\d+)m)?$/.exec(value);
  if (!match) return value;
  const total = Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours && minutes) return `${hours} h ${minutes} min`;
  if (hours) return `${hours} h`;
  return `${minutes} min`;
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
