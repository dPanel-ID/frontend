import {
  BoxIcon,
  ExternalLinkIcon,
  GitBranchIcon,
  HammerIcon,
  Pencil,
  PlayIcon,
} from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { iife } from '@/shared/libs/browser/fn';
import { capitalizeFirstLetter } from '@/shared/libs/browser/string';
import {
  couple,
  guardedSelects,
} from '@/shared/libs/react-factories/guardedSelect';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/presentation/atoms/Accordion';
import { Badge } from '@/shared/presentation/atoms/Badge';
import { Button } from '@/shared/presentation/atoms/Button';
import { Spinner } from '@/shared/presentation/atoms/Spinner';

import { useAppDataModel } from '../../-model/app-data';
import { useEmit } from '../../-model/events';

import { ConfigurationStates as UIStates } from './_States';

const [guard, useAppDetail] = guardedSelects({
  initialIsLoading: true,
  fallbackLoading: UIStates.Loading,
  fallbackError: UIStates.Loading,
})(couple(useAppDataModel, (s: any) => s.appDetail));

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
      {children}
    </p>
  );
}

function InfoRow({
  label,
  value,
  link,
}: {
  label: string;
  value: React.ReactNode;
  link?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <SectionLabel>{label}</SectionLabel>
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 group"
        >
          <span className="text-sm font-medium group-hover:underline truncate">
            {value}
          </span>
          <ExternalLinkIcon className="size-3 shrink-0 text-muted-foreground" />
        </a>
      ) : (
        <p className="text-sm font-medium">
          {value ?? <span className="text-muted-foreground italic">—</span>}
        </p>
      )}
    </div>
  );
}

function EnvTable({ envs }: { envs: Array<{ key: string; value?: string }> }) {
  const t = useDevetekTranslations('page.applicationDetail.configuration');

  if (envs.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('empty.envVars')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      {envs.map((env) => (
        <div
          key={env.key}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2 text-xs font-mono bg-muted/50 rounded px-2 py-1"
        >
          <span className="text-primary font-semibold truncate">{env.key}</span>
          <span className="text-muted-foreground truncate">
            {env.value ?? '••••••'}
          </span>
        </div>
      ))}
    </div>
  );
}

function StepsList({
  steps,
}: {
  steps: Array<{ name: string; command?: string[] }>;
}) {
  const t = useDevetekTranslations('page.applicationDetail.configuration');

  if (steps.length === 0) {
    return (
      <p className="text-xs text-muted-foreground italic">
        {t('empty.buildSteps')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {steps.map((step, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1">
            <span className="size-4 rounded-full bg-muted text-muted-foreground text-[10px] flex items-center justify-center font-bold shrink-0">
              {i + 1}
            </span>
            <span className="text-xs font-semibold truncate">{step.name}</span>
          </div>
          {step.command && step.command.length > 0 && (
            <div className="ml-5 flex flex-col gap-0.5">
              {step.command.map((cmd, j) => (
                <code
                  key={j}
                  className="text-[11px] bg-muted rounded px-1.5 py-0.5 font-mono truncate block"
                >
                  {cmd}
                </code>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default guard(function Configuration() {
  const t = useDevetekTranslations('page.applicationDetail.configuration');
  const [appSource] = useAppDetail((s) => [s.identity.source]);
  const configDefs = useAppDetail((s) => s.configDefs);
  const [gitDetail] = useAppDataModel((s) => [s.gitDetail]);
  const [rawAppDefinition] = useAppDataModel((s) => [s.rawAppDefinition]);

  const emit = useEmit();

  const [appId, appName] = useAppDetail((s) => [s.id, s.identity.name]);

  const handleEditBuild = () => {
    if (!rawAppDefinition || !configDefs.lifecycle?.build) return;
    emit('@applications::detail/application-build-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      steps: configDefs.lifecycle.build.steps,
      envs: configDefs.lifecycle.build.envs,
    });
  };

  const handleEditRun = () => {
    if (!rawAppDefinition || !configDefs.lifecycle?.run) return;
    emit('@applications::detail/application-run-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      command: configDefs.lifecycle.run.command,
      envs: configDefs.lifecycle.run.envs,
    });
  };

  const handleEditSetup = () => {
    if (!rawAppDefinition || !configDefs.lifecycle?.setup) return;
    emit('@applications::detail/application-setup-edit', {
      applicationId: appId,
      applicationName: appName,
      rawAppDefinition,
      language: configDefs.lifecycle.setup.languages[0] ?? {
        name: '',
        version: '',
      },
      languages: configDefs.lifecycle.setup.languages.slice(1),
    });
  };

  const lifecycle = configDefs?.lifecycle;

  const repoInfo = iife(() => {
    if (gitDetail.$status !== 'success') return null;
    return {
      org: gitDetail.repo_org!,
      name: gitDetail.repo_name!,
      url: gitDetail.repo_url!,
      language: gitDetail.repo_language,
      framework: gitDetail.repo_framework,
    };
  });

  const isLoadingGit = gitDetail.$status === 'loading';

  const defaultOpenItems = iife(() => {
    const open = ['git'];
    if (lifecycle?.build) open.push('build');
    if (lifecycle?.run) open.push('run');
    return open;
  });

  return (
    <section className="overflow-hidden rounded-2xl border bg-card">
      <div className="border-b px-4 py-3">
        <h2 className="text-base font-bold">{t('title')}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <div className="w-full">
        <Accordion
          type="multiple"
          defaultValue={defaultOpenItems}
          className="w-full"
        >
          {/* ── Git Repository ── */}
          {appSource === 'repository' && (
            <AccordionItem value="git" className="border-b-0 border-t">
              <AccordionTrigger className="px-4 py-2.5 text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <GitBranchIcon className="size-4 text-muted-foreground" />
                  {t('sections.repository')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-col gap-3">
                  {isLoadingGit ? (
                    <Spinner className="size-4" />
                  ) : repoInfo ? (
                    <>
                      <InfoRow
                        label={t('labels.repository')}
                        value={`${repoInfo.org} / ${repoInfo.name}`}
                        link={repoInfo.url}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        {repoInfo.language && (
                          <InfoRow
                            label={t('labels.language')}
                            value={
                              <Badge
                                variant="secondary"
                                className="text-xs w-max"
                              >
                                {capitalizeFirstLetter(repoInfo.language)}
                              </Badge>
                            }
                          />
                        )}
                        {repoInfo.framework && (
                          <InfoRow
                            label={t('labels.framework')}
                            value={
                              <Badge
                                variant="secondary"
                                className="text-xs w-max"
                              >
                                {capitalizeFirstLetter(repoInfo.framework)}
                              </Badge>
                            }
                          />
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      {t('empty.repository')}
                    </p>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Build ── */}
          {lifecycle?.build && (
            <AccordionItem value="build" className="border-b-0 border-t">
              <AccordionTrigger className="px-4 py-2.5 text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <HammerIcon className="size-4 text-muted-foreground" />
                  {t('sections.build')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-col gap-4">
                  {lifecycle.setup?.languages[0] && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <SectionLabel>{t('labels.language')}</SectionLabel>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={handleEditSetup}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {lifecycle.setup.languages.map(
                          (
                            lang: { name: string; version: string },
                            index: number,
                          ) => (
                            <Badge
                              key={`${lang.name}-${lang.version}-${index}`}
                              variant="outline"
                              className="text-xs font-mono"
                            >
                              {lang.name} {lang.version}
                            </Badge>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <SectionLabel>{t('labels.buildSteps')}</SectionLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={handleEditBuild}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                    </div>
                    <StepsList steps={lifecycle.build.steps} />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <SectionLabel>{t('labels.envVars')}</SectionLabel>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs gap-1"
                        onClick={handleEditBuild}
                      >
                        <Pencil className="size-3" />
                        Edit
                      </Button>
                    </div>
                    {lifecycle.build.envs.length > 0 ? (
                      <EnvTable envs={lifecycle.build.envs} />
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        {t('empty.envVars')}
                      </p>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Run ── */}
          {lifecycle?.run && (
            <AccordionItem value="run" className="border-b-0 border-t">
              <AccordionTrigger className="px-4 py-2.5 text-sm font-semibold hover:no-underline">
                <div className="flex items-center gap-2">
                  <PlayIcon className="size-4 text-muted-foreground" />
                  {t('sections.run')}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow
                      label={t('labels.serviceName')}
                      value={lifecycle.run.name}
                    />
                    <InfoRow
                      label={t('labels.port')}
                      value={lifecycle.run.port}
                    />
                  </div>

                  {lifecycle.run.command && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <SectionLabel>{t('labels.command')}</SectionLabel>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={handleEditRun}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                      </div>
                      <code className="text-[11px] bg-muted rounded px-2 py-1.5 font-mono break-all">
                        {lifecycle.run.command}
                      </code>
                    </div>
                  )}

                  {lifecycle.run.envs.length > 0 && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <SectionLabel>{t('labels.envVars')}</SectionLabel>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-xs gap-1"
                          onClick={handleEditRun}
                        >
                          <Pencil className="size-3" />
                          Edit
                        </Button>
                      </div>
                      <EnvTable envs={lifecycle.run.envs} />
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* ── Fallback jika tidak ada data lifecycle ── */}
          {!lifecycle && appSource !== 'repository' && (
            <div className="px-4 py-3 flex flex-col items-center gap-2 text-center">
              <BoxIcon className="size-8 text-muted-foreground/40" />
              <p className="text-xs text-muted-foreground">
                {t('empty.configuration')}
              </p>
            </div>
          )}
        </Accordion>
      </div>
    </section>
  );
});
