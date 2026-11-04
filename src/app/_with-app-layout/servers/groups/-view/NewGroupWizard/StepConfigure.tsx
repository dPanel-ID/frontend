import { AlertTriangleIcon, CircleAlertIcon, InfoIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import {
  isArmArchitecture,
  serversUnsupportedByEngine,
  sortVersionsNewestFirst,
} from '@/features/server-groups/shared/lib/cluster';
import type { ClusterIssue } from '@/features/server-groups/shared/lib/cluster';
import { ClusterEngineIcon } from '@/features/server-groups/view/ClusterKindIcon';

import { cn } from '@/shared/libs/tailwind/cn';
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

import { OptionCard } from './OptionCard';
import { ServerRolePicker } from './ServerRolePicker';
import type { NewGroupWizard } from './use-new-group-wizard';

/** Step 2: name and description, then the chosen kind's form. */
export function StepConfigure(props: { wizard: NewGroupWizard }) {
  const { wizard } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard');

  return (
    <div className="grid gap-5">
      <div className="grid gap-4">
        <Field label={t('fields.name')} required>
          <Input
            autoFocus
            value={wizard.name}
            placeholder={t('fields.namePlaceholder')}
            onChange={(event) => wizard.setName(event.target.value)}
          />
        </Field>
        <Field label={t('fields.description')}>
          <TextArea
            value={wizard.description}
            placeholder={t('fields.descriptionPlaceholder')}
            onChange={(event) => wizard.setDescription(event.target.value)}
          />
        </Field>
      </div>

      {wizard.kind ? (
        <ClusterForm wizard={wizard} />
      ) : (
        <p className="rounded-lg border bg-background/60 px-3 py-2 text-sm text-muted-foreground">
          {t('generic.note')}
        </p>
      )}
    </div>
  );
}

function ClusterForm(props: { wizard: NewGroupWizard }) {
  const { wizard } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard.cluster');
  const kind = wizard.kind;
  if (!kind) return null;

  const servers = wizard.nodes.map((node) => node.server);
  const anyArm = servers.some((server) => isArmArchitecture(server.arch));
  const recommended = kind.engines.find(
    (engine) => engine.name === wizard.recommendedEngine,
  );
  const versions = wizard.engine
    ? sortVersionsNewestFirst(wizard.engine.versions)
    : [];

  return (
    <div className="grid gap-5">
      <Section title={t('servers')} hint={t('serversHint')}>
        <ServerRolePicker
          roles={kind.roles}
          nodes={wizard.nodes}
          onToggle={wizard.toggleServer}
          onRoleChange={wizard.setNodeRole}
        />
      </Section>

      <Section title={t('engine')}>
        <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
          {kind.engines.map((engine) => {
            const unsupported = serversUnsupportedByEngine(engine, servers);
            const blocked = unsupported.length > 0;

            return (
              <OptionCard
                key={engine.name}
                selected={wizard.engine?.name === engine.name}
                onSelect={() => wizard.chooseEngine(engine.name)}
                icon={
                  <ClusterEngineIcon
                    engine={engine.name}
                    kind={kind.name}
                    className="size-5"
                  />
                }
                title={engine.title || engine.name}
                description={engine.description || engine.recommended_for}
                meta={t('architectures', {
                  list: engine.architectures.join(', '),
                })}
                badge={
                  wizard.recommendedEngine === engine.name
                    ? t('recommended')
                    : undefined
                }
                disabled={blocked}
                disabledReason={
                  blocked
                    ? t('engineUnsupported', {
                        servers: unsupported
                          .map((server) => server.hostname)
                          .join(', '),
                        arch: [
                          ...new Set(unsupported.map((server) => server.arch)),
                        ].join(', '),
                      })
                    : undefined
                }
              />
            );
          })}
        </div>
        {servers.length > 0 && !wizard.recommendedEngine && (
          <Hint level="error" text={t('noEngine')} />
        )}
        {anyArm && recommended && (
          <Hint
            level="info"
            text={t('recommendArm', {
              engine: recommended.title || recommended.name,
            })}
          />
        )}
      </Section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('version')} required>
          <Select
            value={wizard.version}
            onValueChange={(value) => wizard.setVersion(value)}
            disabled={versions.length === 0}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('versionPlaceholder')} />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {wizard.hasIngressOption && (
          <div className="flex items-start justify-between gap-3 rounded-lg border bg-background/60 px-3 py-2.5">
            <span className="min-w-0">
              <span className="block text-sm font-semibold">
                {t('builtinIngress')}
              </span>
              <span className="mt-0.5 block text-xs text-muted-foreground">
                {t('builtinIngressHint')}
              </span>
            </span>
            <Switch
              checked={wizard.builtinIngress}
              onCheckedChange={wizard.setBuiltinIngress}
              aria-label={t('builtinIngress')}
            />
          </div>
        )}
      </div>

      <IssueList issues={wizard.issues} />
    </div>
  );
}

/** The live checks under the cluster form. */
export function IssueList(props: { issues: ClusterIssue[] }) {
  const t = useDevetekTranslations('page.serverGroups.wizard.issues');
  if (props.issues.length === 0) return null;

  return (
    <ul className="grid gap-1.5" aria-live="polite">
      {props.issues.map((issue) => (
        <li key={issue.code}>
          <Hint level={issue.level} text={t(issue.code, issue.params ?? {})} />
        </li>
      ))}
    </ul>
  );
}

function Hint(props: { level: 'error' | 'warning' | 'info'; text: string }) {
  const { level, text } = props;
  const Icon =
    level === 'error'
      ? CircleAlertIcon
      : level === 'warning'
        ? AlertTriangleIcon
        : InfoIcon;

  return (
    <p
      className={cn(
        'flex items-start gap-2 rounded-lg border px-3 py-2 text-xs',
        level === 'error' &&
          'border-red-400/30 bg-red-500/10 text-red-700 dark:text-red-300',
        level === 'warning' &&
          'border-amber-400/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
        level === 'info' &&
          'border-sky-400/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
      )}
    >
      <Icon className="mt-px size-3.5 shrink-0" />
      {text}
    </p>
  );
}

function Section(props: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-2">
      <div>
        <h3 className="text-sm font-semibold text-primary">{props.title}</h3>
        {props.hint && (
          <p className="mt-0.5 text-xs text-muted-foreground">{props.hint}</p>
        )}
      </div>
      {props.children}
    </section>
  );
}

function Field(props: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-semibold text-primary/80">
        {props.label}
        {props.required && <span className="font-bold text-red-500">*</span>}
      </span>
      {props.children}
    </label>
  );
}
