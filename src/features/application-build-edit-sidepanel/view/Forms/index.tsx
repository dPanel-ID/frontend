import { PlusIcon, Trash2Icon } from 'lucide-react';
import { useFieldArray, useWatch } from 'react-hook-form';

import { Button } from '@/shared/presentation/atoms/Button';
import { Input } from '@/shared/presentation/atoms/Input';
import { EnvVariablesEditor } from '@/widgets/env-variables-editor';

import { useApplicationBuildEditModel } from '../../model';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-bold text-sm pb-2 border-b mb-3">{children}</h5>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-bold text-xs text-primary/70 mb-1">{children}</p>;
}

function BuildStepsSection() {
  const { form } = useApplicationBuildEditModel();

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'steps',
  });

  const handleAdd = () => {
    append({ name: '', commandText: '', archive: undefined });
  };

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SectionTitle>Build Steps</SectionTitle>

      <div className="flex flex-col gap-4">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="flex flex-col gap-2 p-3 rounded-lg border bg-muted/30"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground">
                Step {index + 1}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2Icon className="size-3" />
              </Button>
            </div>

            <div>
              <FieldLabel>Name</FieldLabel>
              <Input
                {...form.register(`steps.${index}.name`)}
                placeholder="e.g. Install dependencies"
                className="h-8 text-sm"
              />
              {form.formState.errors.steps?.[index]?.name?.message && (
                <p className="text-xs text-destructive mt-1">
                  {String(form.formState.errors.steps[index].name.message)}
                </p>
              )}
            </div>

            <div>
              <FieldLabel>Commands (one per line)</FieldLabel>
              <textarea
                {...form.register(`steps.${index}.commandText`)}
                placeholder={'npm install\nnpm run build'}
                rows={3}
                className="w-full text-sm font-mono rounded-md border border-input bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-y"
              />
            </div>
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
        Add Step
      </Button>
    </div>
  );
}

function BuildEnvsSection() {
  const { form } = useApplicationBuildEditModel();
  const envText = useWatch({ control: form.control, name: 'envText' });

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SectionTitle>Environment Variables</SectionTitle>

      <EnvVariablesEditor
        label="Environment Variables"
        text={envText}
        onTextChange={(next) =>
          form.setValue('envText', next, { shouldDirty: true })
        }
        textPlaceholder={'NODE_ENV="production"\nCI="true"'}
      />
    </div>
  );
}

export default function Forms() {
  return (
    <div className="flex flex-col gap-2">
      <BuildStepsSection />
      <BuildEnvsSection />
    </div>
  );
}
