import { useEffect, useMemo, useState } from 'react';

import {
  ChevronRightIcon,
  FileIcon,
  FolderIcon,
  ListPlusIcon,
  PlugZapIcon,
  SearchIcon,
  SquareTerminalIcon,
  Trash2Icon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiGitFile, ApiServer } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { cn } from '@/shared/libs/tailwind/cn';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/shared/presentation/atoms/Dialog';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';

import { useFormStore } from '../../../-model/store/form';
import { Sectioned } from '../../../-presentation/Sectioned';

interface RepositoryIdentity {
  repoOrganization: string;
  repoName: string;
}

const DEFAULT_PORT_MIN = 7000;
const DEFAULT_PORT_MAX = 10000;

function pickRandomAvailablePort(usedPorts: Set<string>) {
  const rangeSize = DEFAULT_PORT_MAX - DEFAULT_PORT_MIN + 1;
  const startOffset = Math.floor(Math.random() * rangeSize);

  for (let offset = 0; offset < rangeSize; offset += 1) {
    const port = String(
      DEFAULT_PORT_MIN + ((startOffset + offset) % rangeSize),
    );
    if (!usedPorts.has(port)) return port;
  }

  return '';
}

function parseGithubRepository(repoUrl?: string): RepositoryIdentity | null {
  if (!repoUrl) return null;

  const normalized = repoUrl
    .replace(/^https:\/\/github\.com\//, '')
    .replace(/^git@github\.com:/, '')
    .replace(/\.git$/, '')
    .replace(/^\/+|\/+$/g, '');
  const [repoOrganization, repoName] = normalized.split('/');

  if (!repoOrganization || !repoName) return null;
  return { repoOrganization, repoName };
}

function isDirectory(file: DTOs.GitFileV1) {
  return ['dir', 'tree', 'directory', 'folder'].includes(
    String(file.type ?? '').toLowerCase(),
  );
}

function normalizeCommandPath(path: string) {
  const cleanPath = path.replace(/^\/+/, '');
  if (!cleanPath) return '';
  return cleanPath.startsWith('./') ? cleanPath : `./${cleanPath}`;
}

export function useCommandPortState() {
  const [hostedServerID, appPort, setAppPort] = useFormStore((s) => [
    s.hostedServerID,
    s.appPort,
    s.setAppPort,
  ]);
  const [isPortTouched, setIsPortTouched] = useState(false);

  const [portsResponse] = ApiServer.Origin.$Id.PortInUsed.useGet({
    serverId: hostedServerID ? String(hostedServerID) : '',
    options: {
      skip: !hostedServerID,
    },
  });

  const usedPorts = useMemo(() => {
    if (portsResponse.$status !== 'success') return new Set<string>();
    return new Set(
      portsResponse
        .map((item) => String(item.port ?? '').trim())
        .filter(Boolean),
    );
  }, [portsResponse]);
  const normalizedPort = appPort.trim();
  const isPortUsed = Boolean(normalizedPort && usedPorts.has(normalizedPort));

  useEffect(() => {
    if (
      isPortTouched ||
      appPort.trim() ||
      portsResponse.$status !== 'success'
    ) {
      return;
    }

    const defaultPort = pickRandomAvailablePort(usedPorts);
    if (defaultPort) setAppPort(defaultPort);
  }, [appPort, isPortTouched, portsResponse.$status, setAppPort, usedPorts]);

  const updatePort = (port: string) => {
    setIsPortTouched(true);
    setAppPort(port);
  };

  return {
    appPort,
    isPortUsed,
    portsResponse,
    updatePort,
    usedPorts,
  };
}

export type CommandPortState = ReturnType<typeof useCommandPortState>;

export function CommandSettingsSection(props: { portState: CommandPortState }) {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step4.sectionCommands',
  );
  const [
    appBuildCommand,
    appRunCommand,
    gitRepoConfig,
    setAppBuildCommand,
    setAppRunCommand,
  ] = useFormStore((s) => [
    s.appBuildCommand,
    s.appRunCommand,
    s.gitRepoConfig,
    s.setAppBuildCommand,
    s.setAppRunCommand,
  ]);
  const [pickerState, setPickerState] = useState<{
    open: boolean;
    target: 'build' | 'runtime';
    stepIndex: number;
  }>({ open: false, target: 'build', stepIndex: 0 });
  const { appPort, isPortUsed, portsResponse, updatePort, usedPorts } =
    props.portState;

  const buildCommands = appBuildCommand.length ? appBuildCommand : [''];

  const updateBuildCommand = (index: number, value: string) => {
    setAppBuildCommand(
      buildCommands.map((command, commandIndex) =>
        commandIndex === index ? value : command,
      ),
    );
  };

  const addBuildCommand = () => {
    setAppBuildCommand([...buildCommands, '']);
  };

  const removeBuildCommand = (index: number) => {
    setAppBuildCommand(
      buildCommands.filter((_, commandIndex) => commandIndex !== index),
    );
  };

  const openFilePicker = (stepIndex: number) => {
    setPickerState({ open: true, target: 'build', stepIndex });
  };

  const openRuntimeFilePicker = () => {
    setPickerState({ open: true, target: 'runtime', stepIndex: 0 });
  };

  const closeFilePicker = () => {
    setPickerState((current) => ({ ...current, open: false }));
  };

  const handleSelectCommand = (command: string) => {
    if (pickerState.target === 'runtime') {
      setAppRunCommand(command);
      closeFilePicker();
      return;
    }

    updateBuildCommand(pickerState.stepIndex, command);
    closeFilePicker();
  };

  return (
    <>
      <Sectioned
        withinCard
        sectionIcon={SquareTerminalIcon}
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        className="md:flex-col"
        classNameContent="basis-auto grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      >
        <section className="overflow-hidden rounded-xl border bg-background">
          <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
            <div>
              <h4 className="text-sm font-bold text-primary">
                {t('buildStepsTitle')}
              </h4>
              <p className="mt-1 text-xs text-muted-foreground">
                {t('buildStepsDesc')}
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addBuildCommand}
            >
              <ListPlusIcon className="size-4" />
              {t('addBuildStep')}
            </Button>
          </div>

          <div className="grid gap-3 p-4">
            {buildCommands.map((command, index) => {
              const stepNumber = index + 1;
              return (
                <div key={index} className="rounded-lg border bg-card/40 p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <label
                      className="text-xs font-bold uppercase tracking-wide text-primary/65"
                      htmlFor={`build-command-${index}`}
                    >
                      {t('buildStepLabel', { step: stepNumber })}
                    </label>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        size="xs"
                        variant="ghost"
                        title={t('chooseFromRepository')}
                        aria-label={t('chooseFromRepositoryAria', {
                          step: stepNumber,
                        })}
                        onClick={() => openFilePicker(index)}
                      >
                        <SearchIcon className="size-4" />
                        {t('chooseFile')}
                      </Button>
                      {buildCommands.length > 1 && (
                        <Button
                          type="button"
                          size="xs"
                          variant="ghost"
                          title={t('removeBuildStep')}
                          aria-label={t('removeBuildStepAria', {
                            step: stepNumber,
                          })}
                          onClick={() => removeBuildCommand(index)}
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <Input
                    id={`build-command-${index}`}
                    value={command}
                    placeholder={t('buildCommandPlaceholder')}
                    aria-label={t('buildCommandAria', { step: stepNumber })}
                    onChange={(event) =>
                      updateBuildCommand(index, event.target.value)
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4">
          <div className="rounded-xl border bg-background p-4">
            <div className="grid gap-1.5">
              <span className="flex items-start justify-between gap-3">
                <label
                  className="grid gap-1.5"
                  htmlFor="application-runtime-command"
                >
                  <span className="text-sm font-semibold">
                    {t('runtimeCommand')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t('runtimeCommandDesc')}
                  </span>
                </label>
                <Button
                  type="button"
                  size="xs"
                  variant="ghost"
                  title={t('chooseFromRepository')}
                  aria-label={t('chooseRuntimeFromRepositoryAria')}
                  onClick={openRuntimeFilePicker}
                >
                  <SearchIcon className="size-4" />
                  {t('chooseFile')}
                </Button>
              </span>
              <Input
                id="application-runtime-command"
                value={appRunCommand}
                placeholder={t('runtimeCommandPlaceholder')}
                onChange={(event) => setAppRunCommand(event.target.value)}
              />
            </div>
          </div>

          <div className="rounded-xl border bg-background p-4">
            <label className="grid gap-1.5">
              <span className="text-sm font-semibold">{t('port')}</span>
              <span className="text-xs text-muted-foreground">
                {t('portDesc')}
              </span>
              <Input
                value={appPort}
                inputMode="numeric"
                placeholder={t('portPlaceholder')}
                onChange={(event) => updatePort(event.target.value)}
              />
            </label>

            {isPortUsed && (
              <div className="mt-3">
                <ErrorInline message={t('portUsed', { port: appPort })} />
              </div>
            )}
          </div>

          <div className="rounded-xl border bg-background p-4 text-xs text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-primary">
              <PlugZapIcon className="size-4" />
              {t('usedPorts')}
            </div>
            {portsResponse.$status === 'success' && usedPorts.size ? (
              <div className="flex flex-wrap gap-2">
                {[...usedPorts].slice(0, 24).map((port) => (
                  <span
                    key={port}
                    className="rounded-full border bg-card px-2 py-0.5"
                  >
                    {port}
                  </span>
                ))}
              </div>
            ) : (
              <span>{t('noPorts')}</span>
            )}
          </div>
        </section>
      </Sectioned>

      <BuildCommandFilePicker
        branch={
          gitRepoConfig?.gitBranch || gitRepoConfig?.gitDefaultBranch || ''
        }
        currentCommand={
          pickerState.target === 'runtime'
            ? appRunCommand
            : (buildCommands[pickerState.stepIndex] ?? '')
        }
        key={`${pickerState.open}-${pickerState.target}-${pickerState.stepIndex}`}
        open={pickerState.open}
        repo={parseGithubRepository(gitRepoConfig?.gitRepository)}
        onOpenChange={(open) =>
          setPickerState((current) => ({ ...current, open }))
        }
        onSelectCommand={handleSelectCommand}
      />
    </>
  );
}

export default function Step4Deploy() {
  const portState = useCommandPortState();
  return <CommandSettingsSection portState={portState} />;
}

function BuildCommandFilePicker(props: {
  branch: string;
  currentCommand: string;
  open: boolean;
  repo: RepositoryIdentity | null;
  onOpenChange: (open: boolean) => void;
  onSelectCommand: (command: string) => void;
}) {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step4.sectionCommands',
  );
  const [folder, setFolder] = useState('');
  const [manualCommand, setManualCommand] = useState(props.currentCommand);

  const [filesResponse] = ApiGitFile.Find.useGet({
    repoOrganization: props.repo?.repoOrganization ?? '',
    repoName: props.repo?.repoName ?? '',
    branch: props.branch,
    folder,
    options: {
      skip: !props.open || !props.repo || !props.branch,
    },
  });

  const files = useMemo(() => {
    if (filesResponse.$status !== 'success') return [];
    return [...filesResponse].sort((a, b) => {
      if (isDirectory(a) !== isDirectory(b)) return isDirectory(a) ? -1 : 1;
      return a.path.localeCompare(b.path);
    });
  }, [filesResponse]);

  const breadcrumbs = folder.split('/').filter(Boolean);

  const handleOpenChange = (open: boolean) => {
    props.onOpenChange(open);
  };

  const selectFile = (file: DTOs.GitFileV1) => {
    if (isDirectory(file)) {
      setFolder(file.path);
      return;
    }

    props.onSelectCommand(normalizeCommandPath(file.path));
  };

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[82svh] max-w-3xl flex-col overflow-hidden p-0">
        <DialogHeader className="shrink-0 border-b px-5 py-4">
          <DialogTitle className="flex items-center gap-2">
            <SquareTerminalIcon className="size-5 text-primary/70" />
            {t('filePickerTitle')}
          </DialogTitle>
          <DialogDescription>{t('filePickerDesc')}</DialogDescription>
        </DialogHeader>

        <div className="shrink-0 border-b px-5 py-3">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <button
              type="button"
              className="rounded-md px-2 py-1 font-semibold text-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setFolder('')}
            >
              {props.repo
                ? `${props.repo.repoOrganization}/${props.repo.repoName}`
                : t('repositoryUnavailable')}
            </button>
            {breadcrumbs.map((part, index) => {
              const target = breadcrumbs.slice(0, index + 1).join('/');
              return (
                <span key={target} className="inline-flex items-center gap-2">
                  <ChevronRightIcon className="size-3" />
                  <button
                    type="button"
                    className="rounded-md px-2 py-1 font-semibold text-primary hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setFolder(target)}
                  >
                    {part}
                  </button>
                </span>
              );
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          {!props.repo || !props.branch ? (
            <div className="rounded-lg border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
              {t('repositoryUnavailableDesc')}
            </div>
          ) : filesResponse.$status === 'loading' ? (
            <div className="rounded-lg border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
              {t('loadingFiles')}
            </div>
          ) : files.length ? (
            <div className="overflow-hidden rounded-lg border bg-background">
              {files.map((file) => {
                const directory = isDirectory(file);
                return (
                  <button
                    key={file.sha || file.path}
                    type="button"
                    className={cn(
                      'flex w-full items-center gap-3 border-b px-4 py-3 text-left last:border-b-0',
                      'hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring',
                    )}
                    aria-label={
                      directory
                        ? t('openFolderAria', { path: file.path })
                        : t('selectFileAria', { path: file.path })
                    }
                    onClick={() => selectFile(file)}
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md border bg-card">
                      {directory ? (
                        <FolderIcon className="size-4 text-primary/70" />
                      ) : (
                        <FileIcon className="size-4 text-primary/70" />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-primary">
                        {file.path.split('/').pop() || file.path}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {file.path}
                      </span>
                    </span>
                    {directory && (
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="rounded-lg border bg-card/40 px-4 py-8 text-center text-sm text-muted-foreground">
              {t('noFiles')}
            </div>
          )}
        </div>

        <div className="shrink-0 border-t bg-card/30 px-5 py-4">
          <label className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-primary/65">
              {t('manualCommand')}
            </span>
            <div className="flex gap-2">
              <Input
                value={manualCommand}
                placeholder={t('buildCommandPlaceholder')}
                onChange={(event) => setManualCommand(event.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                disabled={!manualCommand.trim()}
                onClick={() => props.onSelectCommand(manualCommand.trim())}
              >
                {t('useCommand')}
              </Button>
            </div>
          </label>
        </div>
      </DialogContent>
    </Dialog>
  );
}
