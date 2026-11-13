import { useState } from 'react';

import { EyeIcon, EyeOffIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useWatch } from 'react-hook-form';

import { useToaster } from '@/services/toaster';

import {
  hideRevealedValues,
  isMaskedValue,
  revealMaskedValues,
} from '@/entities/application/lib/secret-mask';

import { ApiApplication } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/Button';
import { Input } from '@/shared/presentation/atoms/Input';

import { useApplicationRunEditModel } from '../../model';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-bold text-sm pb-2 border-b mb-3">{children}</h5>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-bold text-xs text-primary/70 mb-1">{children}</p>;
}

/** One header for the key and value columns, instead of a label per row. */
function EnvHeader() {
  return (
    <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_2.25rem] gap-2">
      <FieldLabel>Key</FieldLabel>
      <FieldLabel>Value</FieldLabel>
    </div>
  );
}

function RunCommandSection() {
  const { form } = useApplicationRunEditModel();

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SectionTitle>Run Command</SectionTitle>
      <FieldLabel>Command</FieldLabel>
      <textarea
        {...form.register('command')}
        placeholder="e.g. node dist/index.js"
        rows={3}
        className="w-full text-sm font-mono rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
      />
    </div>
  );
}

/**
 * Values arrive masked; this reads them in clear on request (it needs
 * permission to change the application, and the API logs it) and fills only
 * the masked fields, keeping anything already typed. Hiding masks again
 * every value still equal to what was revealed; edited values stay visible
 * so they are saved as typed.
 */
function useRevealValues() {
  const { form, props } = useApplicationRunEditModel();
  const [openToaster] = useToaster();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const envs = useWatch({ control: form.control, name: 'envs' });
  const hasMasked = envs.some((env) => isMaskedValue(env.value));
  const isShown = !hasMasked && revealed.length > 0;

  const setEnvValues = (next: Array<{ value?: string | null }>) => {
    const current = form.getValues('envs');
    next.forEach((env, index) => {
      if (env.value !== current.at(index)?.value) {
        form.setValue(`envs.${index}.value`, env.value ?? '', {
          shouldDirty: false,
        });
      }
    });
  };

  const hide = () => {
    setEnvValues(hideRevealedValues(form.getValues('envs'), revealed));
    setRevealed([]);
  };

  const reveal = async () => {
    setIsRevealing(true);
    try {
      const response = await ApiApplication.EnvironmentReveal.$Id.doPost({
        applicationId: String(props.applicationId),
      });
      if (response.$status !== 'success') {
        openToaster({
          variant: 'error',
          title: 'Could not show the values',
          message: getApiErrorDetail(response.error),
        });
        return;
      }
      setEnvValues(revealMaskedValues(form.getValues('envs'), response.run));
      setRevealed(response.run);
    } finally {
      setIsRevealing(false);
    }
  };

  return { hasMasked, isShown, isRevealing, reveal, hide };
}

function RunEnvsSection() {
  const { form } = useApplicationRunEditModel();
  const { hasMasked, isShown, isRevealing, reveal, hide } = useRevealValues();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'envs',
  });

  const handleAdd = () => {
    append({ key: '', value: '' });
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SectionTitle>Environment Variables</SectionTitle>

      {(hasMasked || isShown) && (
        <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span>
            {isShown
              ? 'Values are shown. Hide them before sharing your screen.'
              : 'Values are hidden. Unchanged ones keep their stored value.'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 shrink-0 gap-1"
            disabled={isRevealing}
            onClick={() => (isShown ? hide() : void reveal())}
          >
            {isShown ? (
              <EyeOffIcon className="size-3" />
            ) : (
              <EyeIcon className="size-3" />
            )}
            {isShown ? 'Hide values' : isRevealing ? 'Showing…' : 'Show values'}
          </Button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {fields.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">
            No environment variables
          </p>
        ) : (
          <EnvHeader />
        )}

        {fields.map((field, index) => (
          <div
            key={field.id}
            className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)_auto] items-start gap-2"
          >
            <div className="min-w-0">
              <Input
                {...form.register(`envs.${index}.key`)}
                placeholder="ENV_KEY"
                aria-label={`Key ${index + 1}`}
                className="h-9 text-sm font-mono"
              />
              {form.formState.errors.envs?.[index]?.key?.message && (
                <p className="text-xs text-destructive mt-0.5">
                  {String(form.formState.errors.envs[index].key.message)}
                </p>
              )}
            </div>
            <Input
              {...form.register(`envs.${index}.value`)}
              placeholder="value"
              aria-label={`Value ${index + 1}`}
              className="h-9 text-sm font-mono"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              aria-label={`Remove variable ${index + 1}`}
              className="size-9 p-0 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove(index)}
            >
              <Trash2Icon className="size-4" />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2 w-full gap-1"
        onClick={handleAdd}
      >
        <PlusIcon className="size-3" />
        Add Variable
      </Button>
    </div>
  );
}

export default function Forms() {
  return (
    <div>
      <RunCommandSection />
      <RunEnvsSection />
    </div>
  );
}
