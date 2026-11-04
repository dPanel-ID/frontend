import { useId, useState } from 'react';
import type { ReactNode } from 'react';

import { GithubIcon, ServerIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useModalEmit } from '@/services/modal/model/event';
import { ModalLayoutGeneral } from '@/services/modal/ui/presentation';
import { useToaster } from '@/services/toaster';

import { ApiWorkers } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/ButtonV2';
import { Input } from '@/shared/presentation/atoms/Input';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/shared/presentation/atoms/Tabs';

import SecretReveal from '../-presentation/SecretReveal';
import WorkflowResult from '../-presentation/WorkflowResult';
import { toWorkerSecretResult } from '../../lib/workers';
import {
  DEFAULT_WORKFLOW_FILE,
  DEFAULT_WORKFLOW_REF,
  validateWorkerForm,
} from '../../rules/form';
import type { WorkerFormErrors, WorkerFormValues } from '../../rules/form';
import type { WorkerSecretResult } from '../../rules/types';

export interface AddWorkerModalProps {
  workspaceId: string;
  onSuccess?: () => void;
}

type WorkerTab = 'vm' | 'github';

interface Created {
  values: WorkerFormValues;
  result: WorkerSecretResult;
}

/** Adds a VM or GitHub workflow worker, then shows what to set up once. */
export default function AddWorkerModal(props: AddWorkerModalProps) {
  const { onSuccess, workspaceId } = props;
  const t = useDevetekTranslations('widget.workers');
  const emitModal = useModalEmit();
  const [openToaster] = useToaster();

  const [tab, setTab] = useState<WorkerTab>('vm');
  const [vm, setVm] = useState({ name: '', executorId: '' });
  const [github, setGithub] = useState({
    name: '',
    repository: '',
    workflow: DEFAULT_WORKFLOW_FILE,
    ref: DEFAULT_WORKFLOW_REF,
  });
  const [errors, setErrors] = useState<WorkerFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<Created | null>(null);

  const errorText = (field: string) =>
    errors[field] ? t(`errors.${errors[field]}`) : undefined;

  const handleSubmit = async () => {
    const validation = validateWorkerForm(
      tab === 'vm' ? { type: 'vm', ...vm } : { type: 'github', ...github },
    );
    if (!validation.ok) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    emitModal('%%modal/allow-trivial-close', false);

    const { values } = validation;
    const response = await ApiWorkers.Create.doPost({ workspaceId, ...values });

    setIsSubmitting(false);

    if (response.$status === 'failed') {
      emitModal('%%modal/allow-trivial-close', true);
      openToaster({
        variant: 'error',
        title: t('toaster.addError', { name: values.name }),
        message: getApiErrorDetail(response.error),
        duration: 6000,
      });
      return;
    }

    // A VM token is never shown again, so only the button closes the dialog.
    emitModal('%%modal/allow-trivial-close', values.type !== 'vm');
    setCreated({ values, result: toWorkerSecretResult(response) });
    onSuccess?.();
  };

  if (created) {
    const { result, values } = created;

    return (
      <ModalLayoutGeneral maxWidth="640px">
        <ModalLayoutGeneral.Title
          canClickClose={values.type !== 'vm'}
          title={t('add.createdTitle', { name: result.worker.name })}
        />
        <ModalLayoutGeneral.Content>
          {values.type === 'vm' ? (
            <SecretReveal result={result} />
          ) : (
            <WorkflowResult
              result={result}
              repository={values.repository}
              workflow={values.workflow}
            />
          )}

          <div className="mt-5 flex justify-end">
            <Button onClick={() => emitModal('%%modal/close', null)}>
              {t('secret.done')}
            </Button>
          </div>
        </ModalLayoutGeneral.Content>
      </ModalLayoutGeneral>
    );
  }

  return (
    <ModalLayoutGeneral maxWidth="560px">
      <ModalLayoutGeneral.Title
        canClickClose
        title={t('add.title')}
        description={t('add.description')}
      />
      <ModalLayoutGeneral.Content>
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            if (!isSubmitting) void handleSubmit();
          }}
        >
          <Tabs
            value={tab}
            onValueChange={(next) => {
              setTab(next as WorkerTab);
              setErrors({});
            }}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="vm" className="gap-1.5">
                <ServerIcon className="size-4" aria-hidden />
                {t('types.vm')}
              </TabsTrigger>
              <TabsTrigger value="github" className="gap-1.5">
                <GithubIcon className="size-4" aria-hidden />
                {t('types.github')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vm" className="mt-4 flex flex-col gap-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('add.vmIntro')}
              </p>
              <Field
                label={t('add.name')}
                hint={t('add.nameHint')}
                error={errorText('name')}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={vm.name}
                    placeholder="office-vm"
                    maxLength={100}
                    onChange={(e) => setVm({ ...vm, name: e.target.value })}
                  />
                )}
              </Field>
              <Field
                label={t('add.executorId')}
                hint={t('add.executorIdHint')}
                error={errorText('executorId')}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={vm.executorId}
                    placeholder="office-vm-01"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="font-mono"
                    maxLength={63}
                    onChange={(e) =>
                      setVm({ ...vm, executorId: e.target.value })
                    }
                  />
                )}
              </Field>
            </TabsContent>

            <TabsContent value="github" className="mt-4 flex flex-col gap-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                {t('add.githubIntro')}
              </p>
              <Field
                label={t('add.name')}
                hint={t('add.nameHint')}
                error={errorText('name')}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={github.name}
                    placeholder="github-ci"
                    maxLength={100}
                    onChange={(e) =>
                      setGithub({ ...github, name: e.target.value })
                    }
                  />
                )}
              </Field>
              <Field
                label={t('add.repository')}
                hint={t('add.repositoryHint')}
                error={errorText('repository')}
              >
                {(fieldProps) => (
                  <Input
                    {...fieldProps}
                    value={github.repository}
                    placeholder="acme/dpanel-workers"
                    autoCapitalize="none"
                    spellCheck={false}
                    className="font-mono"
                    onChange={(e) =>
                      setGithub({ ...github, repository: e.target.value })
                    }
                  />
                )}
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label={t('add.workflow')}
                  hint={t('add.workflowHint')}
                  error={errorText('workflow')}
                >
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      value={github.workflow}
                      autoCapitalize="none"
                      spellCheck={false}
                      className="font-mono"
                      onChange={(e) =>
                        setGithub({ ...github, workflow: e.target.value })
                      }
                    />
                  )}
                </Field>
                <Field
                  label={t('add.ref')}
                  hint={t('add.refHint')}
                  error={errorText('ref')}
                >
                  {(fieldProps) => (
                    <Input
                      {...fieldProps}
                      value={github.ref}
                      autoCapitalize="none"
                      spellCheck={false}
                      className="font-mono"
                      onChange={(e) =>
                        setGithub({ ...github, ref: e.target.value })
                      }
                    />
                  )}
                </Field>
              </div>
            </TabsContent>
          </Tabs>

          <Button asChild className="w-full" disabled={isSubmitting}>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Spinner className="text-white" />
              ) : (
                t('add.submit')
              )}
            </button>
          </Button>
        </form>
      </ModalLayoutGeneral.Content>
    </ModalLayoutGeneral>
  );
}

interface FieldControlProps {
  id: string;
  'aria-invalid': boolean;
  'aria-describedby': string;
}

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  children: (props: FieldControlProps) => ReactNode;
}

/** A labelled input with its hint, and the error in place of the hint. */
function Field(props: FieldProps) {
  const { children, error, hint, label } = props;
  const id = useId();
  const describedBy = `${id}-description`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold">
        {label}
      </label>
      {children({
        id,
        'aria-invalid': Boolean(error),
        'aria-describedby': describedBy,
      })}
      <p
        id={describedBy}
        className={
          error
            ? 'text-xs text-red-600 dark:text-red-400'
            : 'text-xs leading-relaxed text-muted-foreground'
        }
      >
        {error ?? hint}
      </p>
    </div>
  );
}
