import { ExternalLinkIcon } from 'lucide-react';

import type { DTOs } from '@/shared/api';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

import { useCpcFormContext } from '../../model/forms/context';
import {
  getCredentialFields,
  getProviderLabel,
} from '../../model/provider-contract';
import useModelSubmission from '../../model/submission';
import { SubmitButton } from '../../presentation/SubmitButton';

export default function FormIDCloudHost(props: {
  provider?: DTOs.CloudProviderContractV1;
}) {
  const { provider } = props;
  const { formIDCloudHost: form } = useCpcFormContext();
  const { handleSubmit, isSubmitting } = useModelSubmission(provider);
  const tokenField = getCredentialFields(provider).find((field) =>
    [field.key, ...(field.aliases ?? [])]
      .filter(Boolean)
      .some((key) => key?.toLowerCase().includes('token')),
  );

  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">
          {getProviderLabel(provider)} credentials
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Paste the API token for this cloud account. The value is not displayed
          again after submission.
        </p>
      </div>

      <div className="space-y-4 p-4">
        <div className="rounded-lg border bg-background p-3">
          <p className="text-xs font-semibold">API token source</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Open the IDCloudHost console profile API page and generate a token
            for dPanel.
          </p>
          <a
            href="https://console.idcloudhost.com/user-profile/api"
            target="_blank"
            rel="noreferrer"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary underline"
          >
            Open IDCloudHost API page
            <ExternalLinkIcon className="size-3" />
          </a>
        </div>

        <div>
          <label className="mb-1.5 block" htmlFor="idcloudhost-token">
            <span className="block text-sm font-semibold">
              {tokenField?.label || 'API token'}
              <span className="text-destructive">*</span>
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
              {tokenField?.help ||
                'Stored encrypted and used only for cloud provider calls.'}
            </span>
          </label>
          <TextArea
            id="idcloudhost-token"
            rows={4}
            className="font-mono text-xs"
            placeholder={tokenField?.placeholder || 'Paste API token'}
            disabled={isSubmitting}
            aria-invalid={Boolean(form.formState.errors.token)}
            {...form.register('token')}
          />

          <ErrorInline message={form.formState.errors.token?.message} />
        </div>

        <SubmitButton isSubmitting={isSubmitting} onClick={handleSubmit} />
      </div>
    </section>
  );
}
