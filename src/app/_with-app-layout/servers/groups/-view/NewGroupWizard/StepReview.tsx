import { ShieldCheckIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { ClusterKindIcon } from '@/features/server-groups/view/ClusterKindIcon';

import { IssueList } from './StepConfigure';
import { SummaryList } from './SummaryList';
import type { NewGroupWizard } from './use-new-group-wizard';

/** Step 3: what will be created and installed where, before it happens. */
export function StepReview(props: { wizard: NewGroupWizard }) {
  const { wizard } = props;
  const t = useDevetekTranslations('page.serverGroups.wizard');
  const { engine, kind } = wizard;

  if (!kind || !engine) {
    return (
      <div className="grid gap-3">
        <SummaryList
          rows={[
            { label: t('review.group'), value: wizard.name.trim() },
            { label: t('review.type'), value: t('type.generic') },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          {t('review.genericSummary')}
        </p>
      </div>
    );
  }

  const roleTitle = (name: string) =>
    kind.roles.find((role) => role.name === name)?.title || name;
  const engineTitle = engine.title || engine.name;
  const warnings = wizard.issues.filter((issue) => issue.level === 'warning');

  return (
    <div className="grid gap-4">
      <SummaryList
        rows={[
          { label: t('review.group'), value: wizard.name.trim() },
          {
            label: t('review.type'),
            value: (
              <span className="inline-flex items-center gap-1.5">
                <ClusterKindIcon kind={kind.name} className="size-4" />
                {kind.title || kind.name}
              </span>
            ),
          },
          { label: t('review.engine'), value: engineTitle },
          { label: t('review.version'), value: wizard.version },
          ...(wizard.hasIngressOption
            ? [
                {
                  label: t('review.ingress'),
                  value: wizard.builtinIngress
                    ? t('review.on')
                    : t('review.off'),
                },
              ]
            : []),
        ]}
      />

      <section className="grid gap-2">
        <h3 className="text-sm font-semibold text-primary">
          {t('review.installs')}
        </h3>
        <ul className="grid gap-1.5">
          {wizard.nodes.map((node) => (
            <li
              key={node.server.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-background/60 px-3 py-2 text-sm"
            >
              <span className="min-w-0 truncate font-semibold">
                {node.server.hostname}
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  {[node.server.arch, node.server.region]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </span>
              <span className="text-xs text-muted-foreground">
                {t('review.installsLine', {
                  engine: engineTitle,
                  version: wizard.version,
                  role: roleTitle(node.role),
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {warnings.length > 0 && (
        <section className="grid gap-2">
          <h3 className="text-sm font-semibold text-primary">
            {t('review.warnings')}
          </h3>
          <IssueList issues={warnings} />
        </section>
      )}

      <p className="flex items-start gap-2 rounded-lg border border-sky-400/30 bg-sky-500/10 px-3 py-2 text-xs text-sky-700 dark:text-sky-300">
        <ShieldCheckIcon className="mt-px size-3.5 shrink-0" />
        {t('review.permissions')}
      </p>
    </div>
  );
}
