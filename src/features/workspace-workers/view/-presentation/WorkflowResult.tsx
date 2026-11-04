import { useDevetekTranslations } from '@/services/i18n';

import type { WorkerSecretResult } from '../../rules/types';

import CopyBlock from './CopyBlock';

interface WorkflowResultProps {
  result: WorkerSecretResult;
  /** "owner/name", for the steps. */
  repository: string;
  workflow: string;
}

/** The workflow file to commit and the steps that make the worker run. */
export default function WorkflowResult(props: WorkflowResultProps) {
  const { repository, result, workflow } = props;
  const t = useDevetekTranslations('widget.workers.workflowResult');

  const steps = [
    t('stepCommit', { path: `.github/workflows/${workflow}`, repository }),
    t('stepInstallApp', { app: 'dnocs-id', repository }),
    t('stepSwitch'),
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t('intro')}
      </p>

      {result.workflowYaml ? (
        <CopyBlock
          label={`.github/workflows/${workflow}`}
          value={result.workflowYaml}
          multiline
        />
      ) : (
        <p className="text-xs text-muted-foreground">{t('noWorkflow')}</p>
      )}

      <ol className="flex flex-col gap-2">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-sm">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold">
              {index + 1}
            </span>
            <span className="pt-0.5 leading-relaxed">{step}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
