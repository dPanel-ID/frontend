import { useState } from 'react';

import { CheckCircle2Icon, FileJsonIcon, KeyRoundIcon } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useCpcFormContext } from '../../model/forms/context';
import type { SchemaGcpForm } from '../../model/forms/schema';
import { schemaGcpForm } from '../../model/forms/schema';
import { getProviderLabel } from '../../model/provider-contract';
import useModelSubmission from '../../model/submission';
import { ReadOnlyView } from '../../presentation/ReadOnlyView';
import { SubmitButton } from '../../presentation/SubmitButton';
import { UploadArea } from '../../presentation/UploadArea';

function CredentialMetaItem(props: {
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  const { icon: Icon, label, value } = props;

  return (
    <div className="min-w-0 rounded-lg border bg-card px-3 py-2">
      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-normal text-muted-foreground">
        <Icon className="size-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-semibold">
        {value || 'Not provided'}
      </p>
    </div>
  );
}

export default function FormGCP(props: {
  provider?: DTOs.CloudProviderContractV1;
}) {
  const { provider } = props;
  const { formGCP: form } = useCpcFormContext();
  const [uploadedCredential, setUploadedCredential] = useState<SchemaGcpForm>();

  const { isSubmitting, handleSubmit } = useModelSubmission(provider);

  const handleUploadData = (data: SchemaGcpForm) => {
    setUploadedCredential(data);
    form.reset(data);
  };

  const handleClickClear = () => {
    setUploadedCredential(undefined);
    form.reset();
  };

  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">
          {getProviderLabel(provider)} credentials
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Upload the service account JSON. Secret fields stay masked in the
          local preview.
        </p>
      </div>

      <div className="space-y-4 p-4">
        {!uploadedCredential ? (
          <UploadArea schema={schemaGcpForm} onUploadData={handleUploadData} />
        ) : (
          <div className="flex flex-col gap-3">
            <div className="rounded-lg border bg-background p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-primary/10 text-primary">
                    <CheckCircle2Icon className="size-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold">
                      Service account JSON selected
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      The credential is loaded locally and ready to create a
                      reusable Google Cloud project connection.
                    </p>
                  </div>
                </div>

                <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  Ready
                </span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-3">
                <CredentialMetaItem
                  icon={FileJsonIcon}
                  label="Project ID"
                  value={uploadedCredential.project_id}
                />
                <CredentialMetaItem
                  icon={KeyRoundIcon}
                  label="Client Email"
                  value={uploadedCredential.client_email}
                />
                <CredentialMetaItem
                  icon={KeyRoundIcon}
                  label="Private Key"
                  value={
                    uploadedCredential.private_key
                      ? 'Stored securely'
                      : undefined
                  }
                />
              </div>
            </div>

            <div className="rounded-lg border bg-background p-4">
              <h3 className="mb-3 text-sm font-semibold">Credential preview</h3>
              <ReadOnlyView data={uploadedCredential} />
            </div>

            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={handleClickClear}
            >
              Clear selected JSON
            </Button>

            <SubmitButton isSubmitting={isSubmitting} onClick={handleSubmit} />
          </div>
        )}
      </div>
    </section>
  );
}
