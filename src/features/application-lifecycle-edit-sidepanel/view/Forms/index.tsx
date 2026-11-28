import {
  InfoIcon,
  PlusIcon,
  Trash2Icon,
  TriangleAlertIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import type {
  LifecycleProcessView,
  LifecycleView,
} from '@/entities/application/lib/lifecycle';
import { RELEASE_FOLDER_LIMITS } from '@/entities/application/lib/release-folders';

import { Button } from '@/shared/presentation/atoms/Button';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Switch } from '@/shared/presentation/atoms/Switch';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { CommandListEditor } from '@/shared/presentation/molecules/CommandListEditor';

import { useApplicationLifecycleEditModel } from '../../model';
import { LIFECYCLE_LIMITS } from '../../rules/form-schema';

function Block(props: {
  title: string;
  desc: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-background p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h5 className="text-sm font-bold">{props.title}</h5>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {props.desc}
          </p>
        </div>
        {props.aside}
      </div>
      <div className="mt-3 grid gap-3">{props.children}</div>
    </section>
  );
}

function FieldLabel(props: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={props.htmlFor} className="text-xs font-semibold">
      {props.children}
    </label>
  );
}

function numberOr(value: string, fallback: number) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) ? number : fallback;
}

/**
 * Release folders: each deploy builds in its own folder and the live app
 * switches only once the release commands and the health check pass.
 * Turning it off again is explained, not blocked: the server keeps its
 * folders until the app is removed and deployed again.
 */
function ReleaseFoldersBlock() {
  const t = useDevetekTranslations(
    'sidepanel.applicationLifecycleEdit.releaseFolders',
  );
  const tErrors = useDevetekTranslations(
    'sidepanel.applicationLifecycleEdit.errors',
  );
  const {
    props,
    foldersDraft,
    setFoldersDraft,
    folders,
    errors,
    isSubmitting,
  } = useApplicationLifecycleEditModel();
  const wasEnabled = props.releaseFolders.enabled;

  const update = (patch: Partial<typeof foldersDraft>) =>
    setFoldersDraft((current) => ({ ...current, ...patch }));

  const pathErrors = folders.sharedPaths
    .map((path, index) => {
      const code = errors[`releaseFolders.sharedPaths.${index}`];
      return code ? tErrors(code, { path }) : '';
    })
    .filter(Boolean);
  const listError = errors['releaseFolders.sharedPaths'];
  const keepError = errors['releaseFolders.keepReleases'];

  return (
    <Block
      title={t('title')}
      desc={t('desc')}
      aside={
        <Switch
          checked={foldersDraft.enabled}
          disabled={isSubmitting}
          aria-label={t('enabled')}
          onCheckedChange={(checked) => update({ enabled: checked === true })}
        />
      }
    >
      <ul className="grid list-disc gap-1 pl-5 text-xs leading-relaxed text-muted-foreground">
        <li>{t('point.build')}</li>
        <li>{t('point.switch')}</li>
        <li>{t('point.rollback')}</li>
        <li>{t('point.shared')}</li>
      </ul>

      {foldersDraft.enabled && !wasEnabled && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-3 py-2 text-xs leading-relaxed text-sky-800 dark:text-sky-200"
        >
          <InfoIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{t('turnOnNote')}</span>
        </p>
      )}
      {!foldersDraft.enabled && wasEnabled && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200"
        >
          <TriangleAlertIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{t('turnOffNote')}</span>
        </p>
      )}

      {foldersDraft.enabled && (
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,12rem)]">
          <div className="grid gap-1.5">
            <FieldLabel htmlFor="lifecycle-shared-paths">
              {t('sharedPaths')}
            </FieldLabel>
            <TextArea
              id="lifecycle-shared-paths"
              className="font-mono text-xs"
              rows={4}
              value={foldersDraft.sharedPathsText}
              placeholder={'storage\n.env\ndatabase/database.sqlite'}
              disabled={isSubmitting}
              aria-describedby="lifecycle-shared-paths-hint"
              aria-invalid={pathErrors.length > 0 || Boolean(listError)}
              onChange={(event) =>
                update({ sharedPathsText: event.target.value })
              }
            />
            <span
              id="lifecycle-shared-paths-hint"
              className="text-xs text-muted-foreground"
            >
              {t('sharedPathsHint', { max: RELEASE_FOLDER_LIMITS.sharedPaths })}
            </span>
            {listError && (
              <ErrorInline
                message={tErrors(listError, {
                  max: RELEASE_FOLDER_LIMITS.sharedPaths,
                })}
              />
            )}
            {pathErrors.map((message) => (
              <ErrorInline key={message} message={message} />
            ))}
          </div>
          <div className="grid content-start gap-1.5">
            <FieldLabel htmlFor="lifecycle-keep-releases">
              {t('keepReleases')}
            </FieldLabel>
            <Input
              id="lifecycle-keep-releases"
              type="number"
              min={RELEASE_FOLDER_LIMITS.keepMin}
              max={RELEASE_FOLDER_LIMITS.keepMax}
              value={String(foldersDraft.keepReleases)}
              disabled={isSubmitting}
              onChange={(event) =>
                update({ keepReleases: numberOr(event.target.value, 0) })
              }
            />
            {keepError ? (
              <ErrorInline
                message={tErrors(keepError, {
                  min: RELEASE_FOLDER_LIMITS.keepMin,
                  max: RELEASE_FOLDER_LIMITS.keepMax,
                })}
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                {t('keepReleasesHint')}
              </span>
            )}
          </div>
        </div>
      )}
    </Block>
  );
}

export default function Forms() {
  const t = useDevetekTranslations('sidepanel.applicationLifecycleEdit');
  const { draft, setDraft, errors, isSubmitting } =
    useApplicationLifecycleEditModel();

  const update = (patch: Partial<LifecycleView>) =>
    setDraft((current) => ({ ...current, ...patch }));
  const errorText = (path: string) =>
    errors[path] ? t(`errors.${errors[path]}`) : '';

  const release = draft.release ?? { enabled: true, commands: [], timeout: '' };
  const postDeploy = draft.postDeploy ?? { commands: [], timeout: '' };
  const health = draft.healthCheck;

  const updateProcess = (index: number, patch: Partial<LifecycleProcessView>) =>
    update({
      processes: draft.processes.map((process, at) =>
        at === index ? { ...process, ...patch } : process,
      ),
    });

  const commandErrors = (prefix: string) =>
    Object.keys(errors)
      .filter((path) => path.startsWith(`${prefix}.commands`))
      .map((path) => errorText(path))
      .filter(Boolean)[0];

  return (
    <div className="flex flex-col gap-4 pb-4">
      <p className="text-sm text-muted-foreground">{t('intro')}</p>

      <Block
        title={t('release.title')}
        desc={t('release.desc')}
        aside={
          <Switch
            checked={release.enabled}
            disabled={isSubmitting}
            aria-label={t('release.enabled')}
            onCheckedChange={(checked) =>
              update({ release: { ...release, enabled: checked === true } })
            }
          />
        }
      >
        <CommandListEditor
          idPrefix="lifecycle-release-command"
          commands={release.commands}
          disabled={isSubmitting}
          max={LIFECYCLE_LIMITS.commands}
          onChange={(commands) => update({ release: { ...release, commands } })}
          itemLabel={(index) => t('commandLabel', { n: index + 1 })}
          removeLabel={(index) => t('removeCommand', { n: index + 1 })}
          addLabel={t('addCommand')}
          emptyLabel={t('release.empty')}
        />
        {commandErrors('release') && (
          <ErrorInline message={commandErrors('release')} />
        )}
        <div className="grid gap-1.5 sm:max-w-xs">
          <FieldLabel htmlFor="lifecycle-release-timeout">
            {t('timeout')}
          </FieldLabel>
          <Input
            id="lifecycle-release-timeout"
            className="font-mono text-xs"
            value={release.timeout}
            placeholder="15m"
            disabled={isSubmitting}
            onChange={(event) =>
              update({ release: { ...release, timeout: event.target.value } })
            }
          />
          {errorText('release.timeout') ? (
            <ErrorInline message={errorText('release.timeout')} />
          ) : (
            <span className="text-xs text-muted-foreground">
              {t('commandTimeoutHint')}
            </span>
          )}
        </div>
      </Block>

      <Block title={t('postDeploy.title')} desc={t('postDeploy.desc')}>
        <CommandListEditor
          idPrefix="lifecycle-post-deploy-command"
          commands={postDeploy.commands}
          disabled={isSubmitting}
          max={LIFECYCLE_LIMITS.commands}
          onChange={(commands) =>
            update({ postDeploy: { ...postDeploy, commands } })
          }
          itemLabel={(index) => t('commandLabel', { n: index + 1 })}
          removeLabel={(index) => t('removeCommand', { n: index + 1 })}
          addLabel={t('addCommand')}
          emptyLabel={t('postDeploy.empty')}
        />
        {commandErrors('postDeploy') && (
          <ErrorInline message={commandErrors('postDeploy')} />
        )}
        <div className="grid gap-1.5 sm:max-w-xs">
          <FieldLabel htmlFor="lifecycle-post-deploy-timeout">
            {t('timeout')}
          </FieldLabel>
          <Input
            id="lifecycle-post-deploy-timeout"
            className="font-mono text-xs"
            value={postDeploy.timeout}
            placeholder="15m"
            disabled={isSubmitting}
            onChange={(event) =>
              update({
                postDeploy: { ...postDeploy, timeout: event.target.value },
              })
            }
          />
          {errorText('postDeploy.timeout') && (
            <ErrorInline message={errorText('postDeploy.timeout')} />
          )}
        </div>
      </Block>

      <Block title={t('processes.title')} desc={t('processes.desc')}>
        {draft.processes.length === 0 && (
          <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            {t('processes.empty')}
          </p>
        )}
        {draft.processes.map((process, index) => (
          <div
            key={index}
            className="grid gap-3 rounded-lg border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]"
          >
            <div className="grid gap-1.5">
              <FieldLabel htmlFor={`lifecycle-process-name-${index}`}>
                {t('processes.name')}
              </FieldLabel>
              <Input
                id={`lifecycle-process-name-${index}`}
                className="font-mono text-xs"
                value={process.name}
                maxLength={32}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateProcess(index, { name: event.target.value })
                }
              />
              {errorText(`processes.${index}.name`) && (
                <ErrorInline message={errorText(`processes.${index}.name`)} />
              )}
            </div>
            <div className="grid gap-1.5">
              <span className="text-xs font-semibold">
                {t('processes.type')}
              </span>
              <Select
                value={process.type}
                disabled={isSubmitting}
                onValueChange={(type) =>
                  updateProcess(index, {
                    type: type === 'schedule' ? 'schedule' : 'service',
                    instances: type === 'schedule' ? 1 : process.instances,
                  })
                }
              >
                <SelectTrigger
                  className="bg-background"
                  aria-label={t('processes.type')}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="service">
                    {t('processes.service')}
                  </SelectItem>
                  <SelectItem value="schedule">
                    {t('processes.schedule')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={isSubmitting}
                title={t('processes.remove', { name: process.name })}
                aria-label={t('processes.remove', { name: process.name })}
                onClick={() =>
                  update({
                    processes: draft.processes.filter((_, at) => at !== index),
                  })
                }
              >
                <Trash2Icon className="size-4" />
              </Button>
            </div>
            <div className="grid gap-1.5 sm:col-span-2">
              <FieldLabel htmlFor={`lifecycle-process-command-${index}`}>
                {t('processes.command')}
              </FieldLabel>
              <Input
                id={`lifecycle-process-command-${index}`}
                className="font-mono text-xs"
                value={process.command}
                maxLength={LIFECYCLE_LIMITS.commandLength}
                disabled={isSubmitting}
                onChange={(event) =>
                  updateProcess(index, { command: event.target.value })
                }
              />
              {errorText(`processes.${index}.command`) && (
                <ErrorInline
                  message={errorText(`processes.${index}.command`)}
                />
              )}
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor={`lifecycle-process-instances-${index}`}>
                {t('processes.instances')}
              </FieldLabel>
              <Input
                id={`lifecycle-process-instances-${index}`}
                type="number"
                min={1}
                max={LIFECYCLE_LIMITS.instances}
                value={String(process.instances)}
                disabled={isSubmitting || process.type === 'schedule'}
                onChange={(event) =>
                  updateProcess(index, {
                    instances: numberOr(event.target.value, 0),
                  })
                }
              />
              {errorText(`processes.${index}.instances`) && (
                <ErrorInline
                  message={errorText(`processes.${index}.instances`)}
                />
              )}
            </div>
          </div>
        ))}
        {errorText('processes') && (
          <ErrorInline message={errorText('processes')} />
        )}
        <div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={
              isSubmitting ||
              draft.processes.length >= LIFECYCLE_LIMITS.processes
            }
            onClick={() =>
              update({
                processes: [
                  ...draft.processes,
                  { name: '', type: 'service', command: '', instances: 1 },
                ],
              })
            }
          >
            <PlusIcon className="size-4" />
            {t('processes.add')}
          </Button>
        </div>
      </Block>

      <Block
        title={t('health.title')}
        desc={t('health.desc')}
        aside={
          <Switch
            checked={Boolean(health)}
            disabled={isSubmitting}
            aria-label={t('health.enabled')}
            onCheckedChange={(checked) =>
              update({
                healthCheck: checked
                  ? {
                      path: '/up',
                      expectedStatus: 200,
                      timeout: '5s',
                      retries: 10,
                    }
                  : null,
              })
            }
          />
        }
      >
        {health ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="lifecycle-health-path">
                {t('health.path')}
              </FieldLabel>
              <Input
                id="lifecycle-health-path"
                className="font-mono text-xs"
                value={health.path}
                maxLength={LIFECYCLE_LIMITS.healthPath}
                disabled={isSubmitting}
                onChange={(event) =>
                  update({
                    healthCheck: { ...health, path: event.target.value },
                  })
                }
              />
              {errorText('healthCheck.path') && (
                <ErrorInline message={errorText('healthCheck.path')} />
              )}
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="lifecycle-health-status">
                {t('health.status')}
              </FieldLabel>
              <Input
                id="lifecycle-health-status"
                type="number"
                min={100}
                max={599}
                value={String(health.expectedStatus)}
                disabled={isSubmitting}
                onChange={(event) =>
                  update({
                    healthCheck: {
                      ...health,
                      expectedStatus: numberOr(event.target.value, 0),
                    },
                  })
                }
              />
              {errorText('healthCheck.expectedStatus') && (
                <ErrorInline
                  message={errorText('healthCheck.expectedStatus')}
                />
              )}
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="lifecycle-health-timeout">
                {t('health.timeout')}
              </FieldLabel>
              <Input
                id="lifecycle-health-timeout"
                className="font-mono text-xs"
                value={health.timeout}
                placeholder="5s"
                disabled={isSubmitting}
                onChange={(event) =>
                  update({
                    healthCheck: { ...health, timeout: event.target.value },
                  })
                }
              />
              {errorText('healthCheck.timeout') && (
                <ErrorInline message={errorText('healthCheck.timeout')} />
              )}
            </div>
            <div className="grid gap-1.5">
              <FieldLabel htmlFor="lifecycle-health-retries">
                {t('health.retries')}
              </FieldLabel>
              <Input
                id="lifecycle-health-retries"
                type="number"
                min={1}
                max={LIFECYCLE_LIMITS.healthRetries}
                value={String(health.retries)}
                disabled={isSubmitting}
                onChange={(event) =>
                  update({
                    healthCheck: {
                      ...health,
                      retries: numberOr(event.target.value, 0),
                    },
                  })
                }
              />
              {errorText('healthCheck.retries') && (
                <ErrorInline message={errorText('healthCheck.retries')} />
              )}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
            {t('health.off')}
          </p>
        )}
      </Block>

      <ReleaseFoldersBlock />
    </div>
  );
}
