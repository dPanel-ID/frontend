import { KeyRoundIcon } from 'lucide-react';

import type { DTOs } from '@/shared/api';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import { Combobox } from '@/shared/presentation/molecules/Combobox';

import { useCpcFormContext } from '../../model/forms/context';
import {
  getCredentialFieldKey,
  getCredentialFields,
} from '../../model/provider-contract';
import useModelSubmission from '../../model/submission';
import { SubmitButton } from '../../presentation/SubmitButton';

export default function FormGenericCredential(props: {
  provider: DTOs.CloudProviderContractV1;
}) {
  const { provider } = props;
  const { handleSubmit, isSubmitting } = useModelSubmission(provider);
  const fields = getCredentialFields(provider);

  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <div className="flex items-start gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
            <KeyRoundIcon className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold">Credentials</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Enter the fields required by this provider contract. Secret fields
              are never shown back in the review panel.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        {fields.length < 1 && (
          <div className="rounded-lg border bg-background p-4">
            <p className="text-sm font-semibold">No credentials required</p>
            <p className="mt-1 text-sm text-muted-foreground">
              This provider contract does not declare credential fields.
            </p>
          </div>
        )}

        {fields.map((field) => (
          <CredentialField
            key={getCredentialFieldKey(field)}
            disabled={isSubmitting}
            field={field}
          />
        ))}

        <SubmitButton isSubmitting={isSubmitting} onClick={handleSubmit} />
      </div>
    </section>
  );
}

function CredentialField(props: {
  disabled?: boolean;
  field: DTOs.CloudProviderFieldV1;
}) {
  const { disabled, field } = props;
  const { formDynamicCredential: form } = useCpcFormContext();
  const fieldKey = getCredentialFieldKey(field);
  const fieldName = `credential.${fieldKey}` as const;
  const fieldError = form.formState.errors.credential?.[fieldKey]?.message;
  const inputId = `cloud-project-credential-${fieldKey}`;
  const label = field.label || fieldKey;
  const options = field.options ?? [];

  if (!fieldKey) return null;

  return (
    <div>
      <label className="mb-1.5 block" htmlFor={inputId}>
        <span className="block text-sm font-semibold">
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </span>
        {field.help && (
          <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
            {field.help}
          </span>
        )}
      </label>

      {options.length > 0 ? (
        <Combobox
          classNameButton="w-full"
          items={options.map((option) => ({
            label: option.label || option.value || '',
            value: option.value || '',
          }))}
          onChange={(value) => {
            form.setValue(fieldName, value, {
              shouldDirty: true,
              shouldValidate: true,
            });
          }}
          placeholder={field.placeholder || label}
          value={form.watch(fieldName)}
        />
      ) : shouldRenderTextarea(field) ? (
        <TextArea
          id={inputId}
          autoComplete="off"
          className={field.secret ? 'font-mono text-xs' : undefined}
          disabled={disabled}
          placeholder={field.placeholder}
          rows={field.secret ? 4 : 3}
          spellCheck={false}
          aria-invalid={Boolean(fieldError)}
          {...form.register(fieldName, {
            validate: (value) =>
              !field.required || value?.trim() ? true : `${label} is required`,
          })}
        />
      ) : (
        <Input
          id={inputId}
          autoComplete="off"
          disabled={disabled}
          placeholder={field.placeholder}
          type={field.secret || field.type === 'password' ? 'password' : 'text'}
          aria-invalid={Boolean(fieldError)}
          {...form.register(fieldName, {
            validate: (value) =>
              !field.required || value?.trim() ? true : `${label} is required`,
          })}
        />
      )}

      <ErrorInline message={fieldError} />
    </div>
  );
}

function shouldRenderTextarea(field: DTOs.CloudProviderFieldV1) {
  const type = field.type?.toLowerCase();
  return type === 'textarea' || type === 'multiline' || type === 'json';
}
