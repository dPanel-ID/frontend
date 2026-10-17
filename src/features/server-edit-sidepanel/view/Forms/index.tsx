import type { ReactNode } from 'react';

import { GlobeIcon, HardHatIcon, KeyRoundIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useServerEditModel } from '../../model';
import { ImportantMarker } from '../_presentation';

/** The editable connection facts of a server, grouped by what they affect. */
export default function Forms() {
  const { form } = useServerEditModel();
  const t = useDevetekTranslations('sidepanel.serverEdit');
  const { errors } = form.formState;

  return (
    <div className="grid gap-4 pb-4">
      <Section
        icon={GlobeIcon}
        title={t('sections.address.title')}
        description={t('sections.address.description')}
      >
        <Field label={t('fields.address')} required>
          <Input
            autoComplete="off"
            spellCheck={false}
            {...form.register('serverAddress')}
          />
          <ErrorInline message={errors.serverAddress?.message} />
        </Field>
      </Section>

      <Section
        icon={KeyRoundIcon}
        title={t('sections.ssh.title')}
        description={t('sections.ssh.description')}
      >
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_7rem]">
          <Field label={t('fields.sshUser')} required>
            <Input
              autoComplete="off"
              spellCheck={false}
              {...form.register('ssh.username')}
            />
            <ErrorInline message={errors.ssh?.username?.message} />
          </Field>
          <Field label={t('fields.sshPort')} required>
            <Input
              type="number"
              inputMode="numeric"
              {...form.register('ssh.port', { valueAsNumber: true })}
            />
            <ErrorInline message={errors.ssh?.port?.message} />
          </Field>
        </div>
      </Section>

      <Section
        icon={HardHatIcon}
        title={t('sections.agent.title')}
        description={t('sections.agent.description')}
      >
        <div className="grid gap-3">
          <Field label={t('fields.httpPort')} required className="sm:w-40">
            <Input
              type="number"
              inputMode="numeric"
              {...form.register('agent.httpPort', { valueAsNumber: true })}
            />
            <ErrorInline message={errors.agent?.httpPort?.message} />
          </Field>
          <Field label={t('fields.domain')} hint={t('fields.domainHint')}>
            <Input
              autoComplete="off"
              spellCheck={false}
              placeholder="agent.example.com"
              {...form.register('agent.domain')}
            />
            <ErrorInline message={errors.agent?.domain?.message} />
          </Field>
        </div>
      </Section>
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
    <section className="rounded-2xl border bg-card">
      <header className="flex items-start gap-3 border-b p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <h4 className="text-sm font-bold">{title}</h4>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}

function Field(props: {
  label: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { children, className, hint, label, required } = props;

  return (
    <label className={cn('flex flex-col gap-1', className)}>
      <span className="text-xs font-bold text-primary/70">
        {label}
        {required && <ImportantMarker />}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
