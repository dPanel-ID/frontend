import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  FileTextIcon,
  KeyRoundIcon,
  PlugZapIcon,
  ServerCogIcon,
  ServerIcon,
  ShieldAlertIcon,
  ShieldCheckIcon,
} from 'lucide-react';
import { useForm, useWatch } from 'react-hook-form';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import type { DTOs } from '@/shared/api';
import { ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import {
  FlowHero,
  flowCtaClassName,
} from '@/shared/presentation/organisms/FlowHero';
import { ReviewPanel } from '@/shared/presentation/organisms/ReviewPanel';
import { SshKeyPicker } from '@/shared/presentation/organisms/SshKeyPicker';
import { StepCard } from '@/shared/presentation/organisms/StepCard';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import type { ManualServerCreateForm } from '../../-rules/manual-create';
import { createManualServerCreateSchema } from '../../-rules/manual-create';

import AuthorizeKeySnippet from './AuthorizeKeySnippet';

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
      <FlowHero
        accent="violet"
        icon={ServerCogIcon}
        badge={t('page.servers.create.chooser.manual.badge')}
        title={t('page.servers.create.manual.headerTitle')}
        description={t('page.servers.create.manual.headerDesc')}
        duration={t('page.servers.create.chooser.manual.duration')}
        headnote={
          <Breadcrumb
            items={[
              { text: t('sidebar.dashboard'), url: '/dashboard' },
              { text: t('sidebar.servers'), url: '/servers' },
              {
                text: t('page.servers.create.headerTitle'),
                url: '/servers/create',
              },
            ]}
          />
        }
        aside={
          <a
            href={LINK__DOCUMENTATION}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border bg-background/60 px-3 py-1.5 text-sm font-medium transition-colors hover:bg-background"
          >
            <FileTextIcon className="size-4" />
            {t('page.servers.docs')}
          </a>
        }
      />

      <Link
        to="/servers/create"
        className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        {t('page.servers.create.manual.back')}
      </Link>

      <div className="flex flex-col gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 p-3 text-sm leading-relaxed text-amber-800 sm:flex-row sm:items-center sm:justify-between sm:gap-4 dark:text-amber-200">
        <p className="flex min-w-0 items-start gap-2">
          <ShieldAlertIcon className="mt-0.5 size-4 shrink-0" />
          <span>{t('page.servers.create.manual.trustNote')}</span>
        </p>
        <Link
          to="/servers/create"
          className="inline-flex shrink-0 items-center gap-1.5 font-semibold underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/50"
        >
          {t('page.servers.create.manual.useAgent')}
          <ArrowRightIcon className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <StepCard
            accent="violet"
            number={1}
            done={readiness.authorized}
            active={!readiness.authorized}
            icon={KeyRoundIcon}
            title={t('page.servers.create.manual.key.title')}
            description={t('page.servers.create.manual.key.description')}
          >
            <SshKeyPicker
              accent="violet"
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
            accent="violet"
            number={2}
            done={readiness.connection}
            active={readiness.authorized && !readiness.connection}
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
          accent="violet"
          eyebrow={t('page.servers.create.manual.review.eyebrow')}
          title={t('page.servers.create.manual.review.title')}
          readyTitle={t('page.servers.create.manual.review.readyTitle')}
          rows={[
            {
              key: 'key',
              label: t('page.servers.create.manual.review.key'),
              value: selectedKey?.name,
              done: readiness.key,
            },
            {
              key: 'authorized',
              label: t('page.servers.create.manual.review.authorized'),
              done: readiness.authorized,
            },
            {
              key: 'connection',
              label: t('page.servers.create.manual.review.connection'),
              value:
                values.server?.address?.trim() && values.login?.default_user
                  ? `${values.login.default_user.trim()}@${values.server.address.trim()}:${values.server.ssh_port?.trim() || '22'}`
                  : undefined,
              done: readiness.connection,
            },
          ]}
          action={
            <button
              type="button"
              className={flowCtaClassName('violet', 'w-full py-2.5')}
              disabled={!readiness.all || isConnecting}
              onClick={handleConnect}
            >
              {isConnecting ? (
                <Spinner className="size-4" />
              ) : (
                <PlugZapIcon className="size-4" />
              )}
              {t('page.servers.create.manual.review.connect')}
            </button>
          }
          footnote={
            <span className="flex items-start gap-2">
              <ShieldCheckIcon className="mt-0.5 size-3.5 shrink-0" />
              {t('page.servers.create.manual.review.whatHappens')}
            </span>
          }
        />
      </div>
    </div>
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
