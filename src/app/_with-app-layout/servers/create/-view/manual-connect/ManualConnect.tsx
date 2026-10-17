import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  CheckIcon,
  CircleIcon,
  KeyRoundIcon,
  PlugZapIcon,
  ServerIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DTOs } from '@/shared/api';
import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { Input } from '@/shared/presentation/atoms/Input';

import type { ManualServerCreateForm } from '../../-rules/manual-create';
import { createManualServerCreateSchema } from '../../-rules/manual-create';

import AuthorizeKeySnippet from './AuthorizeKeySnippet';
import SshKeyPicker from './SshKeyPicker';

const MANUAL_PROVIDER = 'other';
const DEFAULT_AGENT_HTTP_PORT = '20000';
const DEFAULT_VALUES: ManualServerCreateForm = {
  cloud: { sshKeyID: '' },
  server: { address: '', ssh_port: '22' },
  login: { default_user: 'root' },
};

/**
 * Connect an existing server on one page: pick a key and authorize it, say
 * where the server is, then connect from the review panel.
 */
export default function ManualConnect() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();
  const schema = useMemo(() => createManualServerCreateSchema(t), [t]);
  const [selectedKey, setSelectedKey] = useState<DTOs.SshKeyV1>();
  const [keyAuthorized, setKeyAuthorized] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const form = useForm<ManualServerCreateForm>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: DEFAULT_VALUES,
  });
  const values = useWatch({ control: form.control });
  const errors = form.formState.errors;

  const readiness = useMemo(() => {
    const field = (path: 'address' | 'port' | 'user') => {
      const shape = schema.shape;
      switch (path) {
        case 'address':
          return shape.server.shape.address.safeParse(values.server?.address)
            .success;
        case 'port':
          return shape.server.shape.ssh_port.safeParse(values.server?.ssh_port)
            .success;
        case 'user':
          return shape.login.shape.default_user.safeParse(
            values.login?.default_user,
          ).success;
      }
    };
    const key = Boolean(values.cloud?.sshKeyID);
    const connection = field('address') && field('port') && field('user');

    return {
      key,
      authorized: key && keyAuthorized,
      connection,
      all: key && keyAuthorized && connection,
    };
  }, [schema, values, keyAuthorized]);

  const handleSelectKey = (sshKey: DTOs.SshKeyV1) => {
    form.setValue('cloud.sshKeyID', String(sshKey.id), {
      shouldValidate: true,
    });
    if (String(sshKey.id) !== String(selectedKey?.id)) setKeyAuthorized(false);
    setSelectedKey(sshKey);
  };

  const resetForm = () => {
    form.reset(DEFAULT_VALUES);
    setSelectedKey(undefined);
    setKeyAuthorized(false);
  };

  const handleConnect = form.handleSubmit(async (submitted) => {
    setIsConnecting(true);
    try {
      const created = await ApiServer.Create.doPost({
        payload: {
          provider: MANUAL_PROVIDER,
          secret_id: String(submitted.cloud.sshKeyID),
          address: submitted.server.address.trim(),
          ssh_port: submitted.server.ssh_port.trim(),
          http_port: DEFAULT_AGENT_HTTP_PORT,
          domain: '',
          default_user: submitted.login.default_user.trim(),
        },
      });
      if (created.$status !== 'success') throw created.error;
      if (!created.id) {
        throw Error(t('page.servers.create.errors.emptyServerId'));
      }

      const setup = await ApiServer.Setup.$Id.doPost({
        id: String(created.id),
      });
      if (setup.$status !== 'success') throw setup.error;

      openDialog({
        title: t('page.servers.create.dialog.setupStartedTitle'),
        content: t('page.servers.create.dialog.setupStartedContent'),
        variant: 'info',
        actions: [
          {
            label: t('page.servers.create.dialog.createAnother'),
            onClick: resetForm,
          },
          {
            label: t('page.servers.create.dialog.openServer'),
            isPrimary: true,
            onClick: () =>
              navigate({
                to: '/servers/$id',
                params: { id: String(created.id) },
              }),
          },
        ],
      });
    } catch (error) {
      openToaster({
        variant: 'error',
        title: t('page.servers.create.toaster.deployFailedTitle'),
        message: getApiErrorDetail(error),
      });
    } finally {
      setIsConnecting(false);
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/servers/create"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('page.servers.create.manual.back')}
      </Link>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <StepCard
            number={1}
            done={readiness.authorized}
            icon={KeyRoundIcon}
            title={t('page.servers.create.manual.key.title')}
            description={t('page.servers.create.manual.key.description')}
          >
            <SshKeyPicker
              selectedID={values.cloud?.sshKeyID || undefined}
              onSelect={handleSelectKey}
            />
            {errors.cloud?.sshKeyID?.message && (
              <ErrorText message={errors.cloud.sshKeyID.message} />
            )}

            {selectedKey && (
              <div className="mt-5 flex flex-col gap-3 border-t pt-5">
                <div>
                  <p className="text-sm font-semibold">
                    {t('page.servers.create.manual.authorize.title')}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {t('page.servers.create.manual.authorize.description')}
                  </p>
                </div>
                <AuthorizeKeySnippet
                  publicKey={selectedKey.data?.public}
                  user={values.login?.default_user?.trim() || 'root'}
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border bg-background/60 p-3">
                  <Checkbox
                    className="mt-0.5"
                    checked={keyAuthorized}
                    onCheckedChange={(checked) =>
                      setKeyAuthorized(checked === true)
                    }
                  />
                  <span className="text-sm">
                    <span className="font-medium">
                      {t('page.servers.create.manual.authorize.confirm')}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {t('page.servers.create.manual.authorize.confirmHint')}
                    </span>
                  </span>
                </label>
              </div>
            )}
          </StepCard>

          <StepCard
            number={2}
            done={readiness.connection}
            icon={ServerIcon}
            title={t('page.servers.create.manual.connection.title')}
            description={t('page.servers.create.manual.connection.description')}
          >
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_7rem_10rem]">
              <Field
                label={t('page.servers.create.serverDetails.addressLabel')}
                hint={t('page.servers.create.serverDetails.addressDescription')}
                error={errors.server?.address?.message}
              >
                <Input
                  variant="3d"
                  autoComplete="off"
                  placeholder={t(
                    'page.servers.create.serverDetails.addressPlaceholder',
                  )}
                  {...form.register('server.address')}
                />
              </Field>
              <Field
                label={t('page.servers.create.serverDetails.sshPortLabel')}
                error={errors.server?.ssh_port?.message}
              >
                <Input
                  variant="3d"
                  inputMode="numeric"
                  placeholder="22"
                  {...form.register('server.ssh_port')}
                />
              </Field>
              <Field
                label={t('page.servers.create.serverDetails.linuxUserLabel')}
                error={errors.login?.default_user?.message}
              >
                <Input
                  variant="3d"
                  autoComplete="off"
                  placeholder="root"
                  {...form.register('login.default_user')}
                />
              </Field>
            </div>
          </StepCard>
        </div>

        <ReviewPanel
          keyName={selectedKey?.name}
          address={values.server?.address?.trim()}
          port={values.server?.ssh_port?.trim()}
          user={values.login?.default_user?.trim()}
          readiness={readiness}
          isConnecting={isConnecting}
          onConnect={handleConnect}
        />
      </div>
    </div>
  );
}

function ReviewPanel(props: {
  keyName?: string;
  address?: string;
  port?: string;
  user?: string;
  readiness: {
    key: boolean;
    authorized: boolean;
    connection: boolean;
    all: boolean;
  };
  isConnecting: boolean;
  onConnect: () => void;
}) {
  const { address, isConnecting, keyName, onConnect, port, readiness, user } =
    props;
  const t = useDevetekTranslations();
  const checks: Array<{ done: boolean; label: string; value?: string }> = [
    {
      done: readiness.key,
      label: t('page.servers.create.manual.review.key'),
      value: keyName,
    },
    {
      done: readiness.authorized,
      label: t('page.servers.create.manual.review.authorized'),
    },
    {
      done: readiness.connection,
      label: t('page.servers.create.manual.review.connection'),
      value: address && user ? `${user}@${address}:${port || '22'}` : undefined,
    },
  ];

  return (
    <aside className="flex h-max flex-col overflow-hidden rounded-2xl border bg-card xl:sticky xl:top-20">
      <div className="relative border-b p-5">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_100%_0%,rgba(167,139,250,0.14),transparent_60%)]" />
        <p className="relative text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {t('page.servers.create.manual.review.eyebrow')}
        </p>
        <h2 className="relative mt-1 text-lg font-bold">
          {readiness.all
            ? t('page.servers.create.manual.review.readyTitle')
            : t('page.servers.create.manual.review.title')}
        </h2>
      </div>

      <ul className="flex flex-col gap-3 p-5">
        {checks.map((check) => (
          <li key={check.label} className="flex items-start gap-3">
            <span
              className={cn(
                'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border',
                check.done
                  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : 'text-muted-foreground/50',
              )}
            >
              {check.done ? (
                <CheckIcon className="size-3" />
              ) : (
                <CircleIcon className="size-2 fill-current" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">{check.label}</span>
              {check.value && (
                <span className="mt-0.5 block truncate font-mono text-xs text-muted-foreground">
                  {check.value}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-3 border-t p-5">
        <Button.Action
          className="w-full"
          disabled={!readiness.all}
          buttonState={isConnecting ? 'loading' : 'initial'}
          onClick={onConnect}
        >
          <PlugZapIcon className="size-4" />
          {t('page.servers.create.manual.review.connect')}
        </Button.Action>
        <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
          {t('page.servers.create.manual.review.whatHappens')}
        </p>
      </div>
    </aside>
  );
}

function StepCard(props: {
  number: number;
  done: boolean;
  icon: typeof KeyRoundIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { children, description, done, icon: Icon, number, title } = props;

  return (
    <section className="rounded-2xl border bg-card">
      <header className="flex items-start gap-4 border-b p-5">
        <span
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold transition-colors',
            done
              ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-violet-400/30 bg-violet-500/10 text-violet-600 dark:text-violet-300',
          )}
        >
          {done ? <CheckIcon className="size-5" /> : number}
        </span>
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <Icon className="size-4 text-muted-foreground" />
            {title}
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Field(props: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  const { children, error, hint, label } = props;

  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {error ? (
        <ErrorText message={error} />
      ) : (
        hint && (
          <span className="mt-1.5 block text-xs leading-relaxed text-muted-foreground">
            {hint}
          </span>
        )
      )}
    </label>
  );
}

function ErrorText(props: { message: ReactNode }) {
  return (
    <span className="mt-1.5 block text-xs font-semibold text-destructive">
      {props.message}
    </span>
  );
}
