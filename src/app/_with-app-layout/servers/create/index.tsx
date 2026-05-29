import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckCircle2Icon,
  CheckIcon,
  CircleDotIcon,
  CloudLightningIcon,
  CopyIcon,
  FileTextIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  RocketIcon,
  SearchIcon,
  ServerCogIcon,
  ShieldCheckIcon,
  TerminalIcon,
  UserRoundIcon,
} from 'lucide-react';
import { useController, useForm, useWatch } from 'react-hook-form';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { useSSHKeyCreateModal } from '@/features/ssh-create-modal';

import type { DTOs } from '@/shared/api';
import { ApiSecret, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { useDebounceValue } from '@/shared/libs/react-hooks/useDebounce';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button as HeaderButton } from '@/shared/presentation/atoms/Button';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Card } from '@/shared/presentation/atoms/Card';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { Breadcrumb } from '@/shared/presentation/molecules/Breadcrumb';
import { PageHeader } from '@/shared/presentation/organisms/PageHeader';
import { LINK__DOCUMENTATION } from '@/widgets/aside-help-support/config/links';

import type { ManualServerCreateForm } from './-rules/manual-create';
import { createManualServerCreateSchema } from './-rules/manual-create';

export const Route = createFileRoute('/_with-app-layout/servers/create/')({
  component: CreateNewServerPage,
});

const DEFAULT_PROVIDER = 'other';
const DEFAULT_AGENT_HTTP_PORT = '20000';
const SSH_KEY_PAGE_SIZE = 5;

type WizardStep = 'method' | 'ssh' | 'server' | 'preview';
const STEP_KEYS: WizardStep[] = ['method', 'ssh', 'server', 'preview'];
type ManualServerCreateDraft = {
  cloud?: Partial<ManualServerCreateForm['cloud']>;
  server?: Partial<ManualServerCreateForm['server']>;
  login?: Partial<ManualServerCreateForm['login']>;
};

function CreateNewServerPage() {
  const t = useDevetekTranslations();
  const navigate = useNavigate();
  const [openToaster] = useToaster();
  const [openDialog] = useDialog();
  const [activeStep, setActiveStep] = useState<WizardStep>('method');
  const [isDeploying, setIsDeploying] = useState(false);
  const [selectedSshKey, setSelectedSshKey] = useState<DTOs.SshKeyV1>();
  const schema = useMemo(() => createManualServerCreateSchema(t), [t]);

  const form = useForm<ManualServerCreateForm>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      cloud: {
        sshKeyID: undefined,
      },
      server: {
        address: '',
        ssh_port: '22',
      },
      login: {
        default_user: 'root',
      },
    },
  });

  const formValues = useWatch({ control: form.control });

  const resetWizard = () => {
    form.reset({
      cloud: {
        sshKeyID: undefined,
      },
      server: {
        address: '',
        ssh_port: '22',
      },
      login: {
        default_user: 'root',
      },
    });
    setSelectedSshKey(undefined);
    setActiveStep('method');
  };

  const handleStepClick = (step: WizardStep) => {
    const currentIndex = getStepIndex(activeStep);
    const nextIndex = getStepIndex(step);

    if (nextIndex <= currentIndex) setActiveStep(step);
  };

  const handleContinueFromSsh = async () => {
    const valid = await form.trigger('cloud.sshKeyID');

    if (!valid) {
      openToaster({
        variant: 'error',
        message: t('page.servers.create.toaster.selectSshKey'),
      });
      return;
    }

    setActiveStep('server');
  };

  const handleContinueFromServer = async () => {
    const valid = await form.trigger(['server', 'login']);

    if (!valid) {
      openToaster({
        variant: 'error',
        message: t('page.servers.create.toaster.fixServerDetails'),
      });
      return;
    }

    setActiveStep('preview');
  };

  const handleDeploy = form.handleSubmit(async (values) => {
    setIsDeploying(true);

    try {
      const createResponse = await ApiServer.Create.doPost({
        payload: {
          provider: DEFAULT_PROVIDER,
          secret_id: String(values.cloud.sshKeyID),
          address: values.server.address.trim(),
          ssh_port: values.server.ssh_port.trim(),
          http_port: DEFAULT_AGENT_HTTP_PORT,
          domain: '',
          default_user: values.login.default_user.trim(),
        },
      });

      if (createResponse.$status !== 'success') {
        throw createResponse.error;
      }

      const newServerID = createResponse.id;
      if (!newServerID) {
        throw Error(t('page.servers.create.errors.emptyServerId'));
      }

      const setupResponse = await ApiServer.Setup.$Id.doPost({
        id: newServerID,
      });

      if (setupResponse.$status !== 'success') {
        throw setupResponse.error;
      }

      openDialog({
        title: t('page.servers.create.dialog.setupStartedTitle'),
        content: t('page.servers.create.dialog.setupStartedContent'),
        variant: 'info',
        actions: [
          {
            label: t('page.servers.create.dialog.createAnother'),
            onClick: resetWizard,
          },
          {
            label: t('page.servers.create.dialog.openServer'),
            isPrimary: true,
            onClick: () => {
              navigate({
                to: '/servers/$id',
                params: {
                  id: String(newServerID),
                },
              });
            },
          },
        ],
      });
    } catch (error) {
      openToaster({
        variant: 'error',
        title: t('page.servers.create.toaster.deployFailedTitle'),
        message: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsDeploying(false);
    }
  });

  let stepContent: ReactNode;

  switch (activeStep) {
    case 'method':
      stepContent = (
        <CreationModeStep
          onManualSelected={() => setActiveStep('ssh')}
          onInstantSelected={() =>
            navigate({ to: '/servers/create/vm-instant' })
          }
        />
      );
      break;

    case 'ssh':
      stepContent = (
        <SshAccessStep
          form={form}
          selectedSshKey={selectedSshKey}
          onSelectedSshKeyChange={setSelectedSshKey}
          onBack={() => setActiveStep('method')}
          onNext={handleContinueFromSsh}
        />
      );
      break;

    case 'server':
      stepContent = (
        <ServerDetailsStep
          form={form}
          onBack={() => setActiveStep('ssh')}
          onNext={handleContinueFromServer}
        />
      );
      break;

    case 'preview':
      stepContent = (
        <PreviewStep
          formValues={formValues}
          selectedSshKey={selectedSshKey}
          isDeploying={isDeploying}
          onBack={() => setActiveStep('server')}
          onDeploy={handleDeploy}
        />
      );
      break;
  }

  return (
    <>
      <title>{t('page.servers.create.documentTitle')}</title>

      <PageHeader
        headnote={
          <Breadcrumb
            items={[
              {
                text: t('sidebar.dashboard'),
                url: '/dashboard',
              },
              {
                text: t('sidebar.servers'),
                url: '/servers',
              },
            ]}
          />
        }
        title={t('page.servers.create.headerTitle')}
        description={t('page.servers.create.headerDesc')}
        rightAppend={
          <HeaderHelpAction
            icon={FileTextIcon}
            label={t('page.servers.docs')}
            href={LINK__DOCUMENTATION}
          />
        }
        footnote={t.rich('page.servers.headerFootnote', {
          code: (chunks) => <code>{chunks}</code>,
          a: (chunks) => (
            <a className="underline" href="//www.youtube.com/@dpanel_id">
              {chunks}
            </a>
          ),
        })}
      />

      <div className="flex flex-col gap-4">
        <WizardProgress activeStep={activeStep} onStepClick={handleStepClick} />

        <main className="min-w-0">{stepContent}</main>
      </div>
    </>
  );
}

function WizardProgress(props: {
  activeStep: WizardStep;
  onStepClick: (step: WizardStep) => void;
}) {
  const { activeStep, onStepClick } = props;
  const t = useDevetekTranslations();
  const activeIndex = getStepIndex(activeStep);
  const progress = (activeIndex / (STEP_KEYS.length - 1)) * 100;

  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold">
            {t('page.servers.create.progress.title')}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {t('page.servers.create.progress.description')}
          </p>
        </div>

        <div className="w-full lg:w-64">
          <div className="h-1.5 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-2 p-3 md:grid-cols-2 xl:grid-cols-4">
        {STEP_KEYS.map((step, index) => {
          const isActive = step === activeStep;
          const isDone = index < activeIndex;
          const isAccessible = index <= activeIndex;
          const StepIcon = isDone
            ? CheckCircle2Icon
            : isActive
              ? CircleDotIcon
              : ShieldCheckIcon;

          return (
            <button
              key={step}
              type="button"
              disabled={!isAccessible}
              onClick={() => onStepClick(step)}
              className={cn(
                'rounded-md border p-3 text-left transition-all',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
                isActive
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-transparent bg-transparent hover:border-border hover:bg-background',
                !isAccessible && 'cursor-not-allowed opacity-50',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-0.5 flex size-7 items-center justify-center rounded-md border bg-card',
                    isActive &&
                      'border-primary bg-primary text-primary-foreground',
                    isDone && 'border-emerald-500/40 text-emerald-400',
                  )}
                >
                  <StepIcon className="size-3.5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.68rem] font-semibold uppercase text-muted-foreground">
                    {t(`page.servers.create.steps.${step}.eyebrow`)}
                  </span>
                  <span className="block text-sm font-semibold">
                    {t(`page.servers.create.steps.${step}.title`)}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {t(`page.servers.create.steps.${step}.description`)}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function CreationModeStep(props: {
  onManualSelected: () => void;
  onInstantSelected: () => void;
}) {
  const { onInstantSelected, onManualSelected } = props;
  const t = useDevetekTranslations();

  return (
    <StepSurface
      eyebrow={t('page.servers.create.steps.method.eyebrow')}
      title={t('page.servers.create.creationMode.title')}
      description={t('page.servers.create.creationMode.description')}
    >
      <div className="grid gap-3 lg:grid-cols-2">
        <ModeCard
          icon={ServerCogIcon}
          title={t('page.servers.create.creationMode.manual.title')}
          subtitle={t('page.servers.create.creationMode.manual.subtitle')}
          badge={t('page.servers.create.creationMode.manual.badge')}
          description={t('page.servers.create.creationMode.manual.description')}
          onClick={onManualSelected}
        />

        <ModeCard
          icon={CloudLightningIcon}
          title={t('page.servers.create.creationMode.instant.title')}
          subtitle={t('page.servers.create.creationMode.instant.subtitle')}
          badge={t('page.servers.create.creationMode.instant.badge')}
          description={t(
            'page.servers.create.creationMode.instant.description',
          )}
          onClick={onInstantSelected}
        />
      </div>
    </StepSurface>
  );
}

function ModeCard(props: {
  icon: IconComponent;
  title: string;
  subtitle: string;
  badge: string;
  description: string;
  onClick: () => void;
}) {
  const { badge, description, icon: Icon, onClick, subtitle, title } = props;
  const t = useDevetekTranslations();

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex min-h-56 flex-col rounded-lg border bg-card p-5 text-left transition-all',
        'hover:border-primary/70 hover:bg-primary/5',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/35',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex size-12 items-center justify-center rounded-lg border bg-background text-primary">
          <Icon className="size-6" />
        </span>
        <span className="rounded-full border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          {badge}
        </span>
      </div>

      <div className="mt-5">
        <h3 className="text-2xl font-bold tracking-normal">{title}</h3>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">
          {subtitle}
        </p>
      </div>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary">
        {t('common.actions.next')}
        <ArrowRightIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </button>
  );
}

function SshAccessStep(props: {
  form: ReturnType<typeof useForm<ManualServerCreateForm>>;
  selectedSshKey?: DTOs.SshKeyV1;
  onSelectedSshKeyChange: (sshKey?: DTOs.SshKeyV1) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const { form, onBack, onNext, onSelectedSshKeyChange, selectedSshKey } =
    props;
  const t = useDevetekTranslations();
  const [openToaster] = useToaster();
  const [openSSHKeyCreateModal] = useSSHKeyCreateModal();
  const [sshKeySearch, setSshKeySearch] = useState('');
  const [sshKeyPage, setSshKeyPage] = useState(1);
  const [debouncedSshKeySearch] = useDebounceValue(sshKeySearch);

  const [response, refreshSshKeys] = ApiSecret.SshKey.Find.useGet({
    page: sshKeyPage,
    pageSize: SSH_KEY_PAGE_SIZE,
    searchQuery: debouncedSshKeySearch.trim() || undefined,
  });

  const sshKeyControl = useController({
    control: form.control,
    name: 'cloud.sshKeyID',
  });
  const responseData =
    response.$status === 'success'
      ? response
      : response.$status === 'loading'
        ? response.prevData
        : undefined;
  const sshKeys = useMemo(
    () => responseData?.secrets ?? [],
    [responseData?.secrets],
  );
  const pagination = responseData?.pagination;
  const sshKeyTotalPages = Math.max(1, pagination?.total_page ?? 1);
  const currentSshKeyPage = Math.min(sshKeyPage, sshKeyTotalPages);
  const sshKeyTotalItems = pagination?.total_item ?? sshKeys.length;
  const isSearching = debouncedSshKeySearch.trim().length > 0;
  const isInitialLoading =
    response.$status === 'loading' && response.prevData == null;

  const handleOpenCreateKeyModal = () => {
    openSSHKeyCreateModal({
      onSubmitSuccess: () => {
        setSshKeyPage(1);
        refreshSshKeys();
      },
    });
  };

  const handleSelectSshKey = (sshKey: DTOs.SshKeyV1) => {
    sshKeyControl.field.onChange(sshKey.id);
    onSelectedSshKeyChange(sshKey);
  };

  const handleCopyPublicKey = async (publicKey?: string) => {
    const keyToCopy = publicKey ?? selectedSshKey?.data?.public;

    if (!keyToCopy) {
      openToaster({
        variant: 'error',
        message: t('page.servers.create.ssh.publicKeyUnavailableToast'),
      });
      return;
    }

    await navigator.clipboard.writeText(keyToCopy);
    openToaster({
      variant: 'success',
      message: t('page.servers.create.ssh.publicKeyCopiedToast'),
    });
  };

  return (
    <StepSurface
      eyebrow={t('page.servers.create.steps.ssh.eyebrow')}
      title={t('page.servers.create.ssh.title')}
      description={t('page.servers.create.ssh.description')}
    >
      <StepNavigationActions
        placement="top"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('common.actions.back')}
          </Button>
        }
        next={
          <Button onClick={onNext}>
            {t('page.servers.create.actions.continue')}
            <ArrowRightIcon className="size-4" />
          </Button>
        }
      />

      <div className="grid gap-4 2xl:grid-cols-[1fr_22rem]">
        <div className="min-w-0 rounded-lg border bg-background">
          <div className="border-b p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-56">
                <p className="text-sm font-semibold">
                  {t('page.servers.create.ssh.keysTitle')}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t('page.servers.create.ssh.keysDescription')}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  buttonStyle="outline"
                  buttonColor="secondary"
                  size="sm"
                  onClick={() => {
                    setSshKeyPage(1);
                    refreshSshKeys();
                  }}
                >
                  {t('common.actions.refresh')}
                </Button>
                <Button
                  buttonStyle="outline"
                  buttonColor="secondary"
                  size="sm"
                  onClick={handleOpenCreateKeyModal}
                >
                  <KeyRoundIcon className="size-4" />
                  {t('page.servers.create.ssh.createKey')}
                </Button>
              </div>
            </div>

            {responseData && (sshKeys.length > 0 || sshKeySearch.trim()) && (
              <div className="relative mt-3 w-full sm:ml-auto sm:max-w-md">
                <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  inputSize="sm"
                  value={sshKeySearch}
                  placeholder={t('page.servers.create.ssh.searchPlaceholder')}
                  aria-label={t('page.servers.create.ssh.searchLabel')}
                  className="pl-9"
                  onChange={(event) => {
                    setSshKeySearch(event.target.value);
                    setSshKeyPage(1);
                  }}
                />
              </div>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {isInitialLoading && (
              <div className="flex min-h-32 items-center justify-center">
                <Spinner />
              </div>
            )}

            {response.$status === 'failed' && (
              <div className="m-3 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                {getApiErrorDetail(response.error)}
              </div>
            )}

            {responseData && sshKeys.length === 0 && (
              <div className="m-3 rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
                {isSearching
                  ? t('page.servers.create.ssh.emptySearch')
                  : t('page.servers.create.ssh.emptyKeys')}
              </div>
            )}

            {responseData && sshKeys.length > 0 && (
              <div className="divide-y">
                {sshKeys.map((sshKey) => {
                  if (!sshKey.id) return null;

                  const isSelected = sshKey.id === sshKeyControl.field.value;
                  const publicKey = sshKey.data?.public;

                  return (
                    <div
                      key={sshKey.id}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-all',
                        'hover:bg-primary/5',
                        'focus-within:ring-2 focus-within:ring-inset focus-within:ring-primary/35',
                        isSelected && 'bg-primary/10',
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectSshKey(sshKey)}
                        className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none"
                      >
                        <span
                          className={cn(
                            'flex size-8 shrink-0 items-center justify-center rounded-md border bg-card text-muted-foreground',
                            isSelected && 'border-primary text-primary',
                          )}
                        >
                          <KeyRoundIcon className="size-4" />
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">
                            {sshKey.name ||
                              t('page.servers.create.ssh.fallbackKeyName', {
                                id: sshKey.id,
                              })}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">
                            {t('page.servers.create.ssh.keyId', {
                              id: sshKey.id,
                            })}
                            {sshKey.data?.length
                              ? t('page.servers.create.ssh.keyLengthSuffix', {
                                  length: sshKey.data.length,
                                })
                              : ''}
                          </span>
                        </span>

                        <span
                          className={cn(
                            'flex size-6 shrink-0 items-center justify-center rounded-full border text-transparent',
                            isSelected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border',
                          )}
                          aria-hidden
                        >
                          <CheckIcon className="size-3.5" />
                        </span>
                      </button>

                      <Button
                        size="icon-sm"
                        buttonStyle="ghost"
                        buttonColor="secondary"
                        disabled={!publicKey}
                        aria-label={t(
                          'page.servers.create.ssh.copyPublicKeyFor',
                          {
                            name:
                              sshKey.name ||
                              t('page.servers.create.ssh.fallbackKeyName', {
                                id: sshKey.id,
                              }),
                          },
                        )}
                        title={
                          publicKey
                            ? t('page.servers.create.ssh.copyPublicKey')
                            : t('page.servers.create.ssh.publicKeyUnavailable')
                        }
                        onClick={() => handleCopyPublicKey(publicKey)}
                      >
                        <CopyIcon className="size-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {responseData && sshKeyTotalItems > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-xs text-muted-foreground">
              <span>
                {t('page.servers.create.ssh.paginationSummary', {
                  page: currentSshKeyPage,
                  totalPage: sshKeyTotalPages,
                  totalItem: sshKeyTotalItems,
                })}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  disabled={currentSshKeyPage <= 1}
                  onClick={() =>
                    setSshKeyPage((previousPage) =>
                      Math.max(1, previousPage - 1),
                    )
                  }
                >
                  {t('page.servers.create.ssh.previousPage')}
                </Button>
                <Button
                  size="sm"
                  buttonStyle="outline"
                  buttonColor="secondary"
                  disabled={currentSshKeyPage >= sshKeyTotalPages}
                  onClick={() =>
                    setSshKeyPage((previousPage) =>
                      Math.min(sshKeyTotalPages, previousPage + 1),
                    )
                  }
                >
                  {t('page.servers.create.ssh.nextPage')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <InfoCallout
            icon={LockKeyholeIcon}
            title={t('page.servers.create.ssh.manualActionTitle')}
            description={t.rich(
              'page.servers.create.ssh.manualActionDescription',
              {
                code: (chunks) => (
                  <code className="rounded bg-background px-1 py-0.5">
                    {chunks}
                  </code>
                ),
              },
            )}
          />
        </div>
      </div>

      {selectedSshKey?.data?.public && (
        <div className="mt-4 rounded-lg border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">
                {t('page.servers.create.ssh.selectedPublicKey')}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('page.servers.create.ssh.selectedPublicKeyDescription')}
              </p>
            </div>
            <Button
              size="sm"
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={() => handleCopyPublicKey()}
            >
              <CopyIcon className="size-4" />
              {t('page.servers.create.ssh.copyPublicKey')}
            </Button>
          </div>
          <TextArea
            readOnly
            className="mt-3 max-h-28 min-h-20 resize-none bg-card font-mono text-xs"
            value={selectedSshKey.data.public}
          />
        </div>
      )}

      <ErrorText message={form.formState.errors.cloud?.sshKeyID?.message} />

      <StepNavigationActions
        placement="bottom"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('common.actions.back')}
          </Button>
        }
        next={
          <Button onClick={onNext}>
            {t('page.servers.create.actions.continue')}
            <ArrowRightIcon className="size-4" />
          </Button>
        }
      />
    </StepSurface>
  );
}

function ServerDetailsStep(props: {
  form: ReturnType<typeof useForm<ManualServerCreateForm>>;
  onBack: () => void;
  onNext: () => void;
}) {
  const { form, onBack, onNext } = props;
  const t = useDevetekTranslations();
  const errors = form.formState.errors;

  return (
    <StepSurface
      eyebrow={t('page.servers.create.steps.server.eyebrow')}
      title={t('page.servers.create.serverDetails.title')}
      description={t('page.servers.create.serverDetails.description')}
    >
      <StepNavigationActions
        placement="top"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('common.actions.back')}
          </Button>
        }
        next={
          <Button onClick={onNext}>
            {t('page.servers.create.actions.preview')}
            <ArrowRightIcon className="size-4" />
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="rounded-lg border bg-background p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <FieldLabel
                label={t('page.servers.create.serverDetails.addressLabel')}
                description={t(
                  'page.servers.create.serverDetails.addressDescription',
                )}
              />
              <Input
                variant="3d"
                placeholder={t(
                  'page.servers.create.serverDetails.addressPlaceholder',
                )}
                {...form.register('server.address')}
              />
              <ErrorText message={errors.server?.address?.message} />
            </div>

            <div>
              <FieldLabel
                label={t('page.servers.create.serverDetails.sshPortLabel')}
                description={t(
                  'page.servers.create.serverDetails.sshPortDescription',
                )}
              />
              <Input
                variant="3d"
                placeholder={t(
                  'page.servers.create.serverDetails.sshPortPlaceholder',
                )}
                {...form.register('server.ssh_port')}
              />
              <ErrorText message={errors.server?.ssh_port?.message} />
            </div>

            <div>
              <FieldLabel
                label={t('page.servers.create.serverDetails.linuxUserLabel')}
                description={t(
                  'page.servers.create.serverDetails.linuxUserDescription',
                )}
              />
              <Input
                variant="3d"
                placeholder={t(
                  'page.servers.create.serverDetails.linuxUserPlaceholder',
                )}
                {...form.register('login.default_user')}
              />
              <ErrorText message={errors.login?.default_user?.message} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <InfoCallout
            icon={ServerCogIcon}
            title={t('page.servers.create.serverDetails.manualProviderTitle')}
            description={t.rich(
              'page.servers.create.serverDetails.manualProviderDescription',
              {
                code: (chunks) => (
                  <code className="rounded bg-background px-1 py-0.5">
                    {chunks}
                  </code>
                ),
                provider: DEFAULT_PROVIDER,
              },
            )}
          />
          <InfoCallout
            icon={TerminalIcon}
            title={t('page.servers.create.serverDetails.sshCheckTitle')}
            description={t(
              'page.servers.create.serverDetails.sshCheckDescription',
            )}
          />
        </div>
      </div>

      <StepNavigationActions
        placement="bottom"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('common.actions.back')}
          </Button>
        }
        next={
          <Button onClick={onNext}>
            {t('page.servers.create.actions.preview')}
            <ArrowRightIcon className="size-4" />
          </Button>
        }
      />
    </StepSurface>
  );
}

function PreviewStep(props: {
  formValues: ManualServerCreateDraft;
  selectedSshKey?: DTOs.SshKeyV1;
  isDeploying: boolean;
  onBack: () => void;
  onDeploy: () => void;
}) {
  const { formValues, isDeploying, onBack, onDeploy, selectedSshKey } = props;
  const t = useDevetekTranslations();

  return (
    <StepSurface
      eyebrow={t('page.servers.create.steps.preview.eyebrow')}
      title={t('page.servers.create.preview.title')}
      description={t('page.servers.create.preview.description')}
    >
      <StepNavigationActions
        placement="top"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('page.servers.create.actions.editDetails')}
          </Button>
        }
        next={
          <Button.Action
            buttonState={isDeploying ? 'loading' : 'initial'}
            onClick={onDeploy}
          >
            {t('page.servers.create.actions.deployServer')}
          </Button.Action>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <PreviewCard
          icon={KeyRoundIcon}
          title={t('page.servers.create.preview.sshKeyTitle')}
          items={[
            [
              t('page.servers.create.preview.name'),
              selectedSshKey?.name || '-',
            ],
            [
              t('page.servers.create.preview.id'),
              selectedSshKey?.id ? String(selectedSshKey.id) : '-',
            ],
          ]}
        />
        <PreviewCard
          icon={ServerCogIcon}
          title={t('page.servers.create.preview.connectionTitle')}
          items={[
            [
              t('page.servers.create.preview.address'),
              formValues.server?.address || '-',
            ],
            [
              t('page.servers.create.preview.sshPort'),
              formValues.server?.ssh_port || '22',
            ],
          ]}
        />
        <PreviewCard
          icon={UserRoundIcon}
          title={t('page.servers.create.preview.linuxAccessTitle')}
          items={[
            [
              t('page.servers.create.preview.user'),
              formValues.login?.default_user || '-',
            ],
            [t('page.servers.create.preview.provider'), DEFAULT_PROVIDER],
          ]}
        />
      </div>

      <div className="mt-4 rounded-lg border bg-background p-4">
        <div className="flex items-start gap-3">
          <RocketIcon className="mt-0.5 size-5 text-primary" />
          <div>
            <p className="text-sm font-semibold">
              {t('page.servers.create.preview.afterDeployTitle')}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {t('page.servers.create.preview.afterDeployDescription')}
            </p>
          </div>
        </div>
      </div>

      <StepNavigationActions
        placement="bottom"
        back={
          <Button
            buttonStyle="outline"
            buttonColor="secondary"
            onClick={onBack}
          >
            <ArrowLeftIcon className="size-4" />
            {t('page.servers.create.actions.editDetails')}
          </Button>
        }
        next={
          <Button.Action
            buttonState={isDeploying ? 'loading' : 'initial'}
            onClick={onDeploy}
          >
            {t('page.servers.create.actions.deployServer')}
          </Button.Action>
        }
      />
    </StepSurface>
  );
}

function StepSurface(props: {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { children, description, eyebrow, title } = props;

  return (
    <Card className="overflow-hidden rounded-lg">
      <div className="border-b bg-card px-5 py-4">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          {eyebrow}
        </p>
        <h2 className="mt-1 text-2xl font-bold tracking-normal">{title}</h2>
        <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="p-4 sm:p-5">{children}</div>
    </Card>
  );
}

function StepNavigationActions(props: {
  back: ReactNode;
  next: ReactNode;
  placement: 'top' | 'bottom';
}) {
  const { back, next, placement } = props;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-2',
        placement === 'top' ? 'mb-5 border-b pb-4' : 'mt-5 border-t pt-4',
      )}
    >
      <div className="flex min-w-0 items-center justify-start">{back}</div>
      <div className="ml-auto flex min-w-0 items-center justify-end">
        {next}
      </div>
    </div>
  );
}

function InfoCallout(props: {
  icon: IconComponent;
  title: string;
  description: ReactNode;
}) {
  const { description, icon: Icon, title } = props;

  return (
    <div className="rounded-lg border bg-primary/5 p-4">
      <div className="flex items-start gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-card text-primary">
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function PreviewCard(props: {
  icon: IconComponent;
  title: string;
  items: Array<[string, ReactNode]>;
}) {
  const { icon: Icon, items, title } = props;

  return (
    <div className="rounded-lg border bg-background p-4">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-lg border bg-card text-primary">
          <Icon className="size-5" />
        </span>
        <p className="text-sm font-semibold">{title}</p>
      </div>

      <dl className="mt-4 space-y-3">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 truncate font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FieldLabel(props: { label: string; description?: string }) {
  const { description, label } = props;

  return (
    <label className="mb-1.5 block">
      <span className="block text-sm font-semibold">{label}</span>
      {description && (
        <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
          {description}
        </span>
      )}
    </label>
  );
}

function ErrorText(props: { message?: ReactNode }) {
  if (!props.message) return null;

  return (
    <p className="mt-1.5 text-xs font-semibold text-destructive">
      {props.message}
    </p>
  );
}

function getStepIndex(step: WizardStep) {
  return STEP_KEYS.findIndex((item) => item === step);
}

function HeaderHelpAction(props: {
  icon: IconComponent;
  label: string;
  href: string;
}) {
  const { href, icon: Icon, label } = props;

  return (
    <HeaderButton variant="outline" size="sm" asChild>
      <a
        href={href}
        aria-label={label}
        title={label}
        target="_blank"
        rel="noreferrer"
      >
        <Icon className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </a>
    </HeaderButton>
  );
}

type IconComponent = (props: { className?: string }) => ReactNode;
