import type { ReactNode } from 'react';

import { GlobeIcon, KeyRoundIcon } from 'lucide-react';
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
    <div className="grid gap-5 py-2 pb-6">
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
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
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
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const { children, className, hint, label, required } = props;

  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-semibold text-primary/80">
        {label}
        {required && <ImportantMarker />}
      </span>
      {children}
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
