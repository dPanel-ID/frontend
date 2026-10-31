import { useState } from 'react';

import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/ButtonV2';

import { useCpcFormContext } from '../../model/forms/context';
import type {
  SchemaProxmoxForm,
  SchemaProxmoxUpload,
} from '../../model/forms/schema';
import { schemaProxmoxUpload } from '../../model/forms/schema';
import { getProviderLabel } from '../../model/provider-contract';
import useModelSubmission from '../../model/submission';
import { SubmitButton } from '../../presentation/SubmitButton';
import { UploadArea } from '../../presentation/UploadArea';

// ---------------------------------------------------------------------------
// Credential summary after upload
// ---------------------------------------------------------------------------

const SummaryRow = ({
  label,
  value,
  hidden,
}: {
  label: string;
  value?: string | number;
  hidden?: boolean;
}) => {
  const display =
    value !== undefined && value !== '' ? (
      String(value)
    ) : (
      <em className="opacity-40">-</em>
    );

  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-2">
        <pre className="flex-1 rounded-md border bg-background px-3 py-1.5 text-sm whitespace-pre-wrap break-all">
          {hidden ? <em className="opacity-50">Stored securely</em> : display}
        </pre>
      </div>
    </div>
  );
};

const CredentialSummary = ({ values }: { values: SchemaProxmoxUpload }) => {
  const auth = values.credential.auth;
  const ostemplates = values.credential.config.ostemplates;

  return (
    <div className="mb-4 flex flex-col gap-4 rounded-lg border bg-background p-3">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          Auth
        </p>
        <SummaryRow label="api_host" value={auth.api_host} />
        <SummaryRow label="api_user" value={auth.api_user} />
        <SummaryRow label="api_token_id" value={auth.api_token_id} />
        <SummaryRow
          label="api_token_secret"
          value={auth.api_token_secret}
          hidden
        />
      </div>

      <div className="flex flex-col gap-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">
          OS Templates
        </p>
        {ostemplates.map((t) => (
          <SummaryRow key={t.id} label={t.name} value={t.id} />
        ))}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// FormProxmox
// ---------------------------------------------------------------------------

export default function FormProxmox(props: {
  provider?: DTOs.CloudProviderContractV1;
}) {
  const { provider } = props;
  const { formProxmox: form } = useCpcFormContext();
  const { handleSubmit, isSubmitting, submitLabel } =
    useModelSubmission(provider);

  const [uploadedData, setUploadedData] = useState<SchemaProxmoxUpload | null>(
    null,
  );

  const handleUploadData = (data: SchemaProxmoxUpload) => {
    form.reset(data as SchemaProxmoxForm);
    setUploadedData(data);
  };

  const handleClickClear = () => {
    form.reset();
    setUploadedData(null);
  };

  return (
    <section className="rounded-lg border bg-card">
      <div className="border-b p-4">
        <h2 className="text-base font-semibold">
          {getProviderLabel(provider)} credentials
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Upload the Proxmox credential JSON. Token secrets stay masked in the
          local preview.
        </p>
      </div>

      <div className="p-4">
        {!uploadedData ? (
          <UploadArea
            schema={schemaProxmoxUpload}
            onUploadData={handleUploadData}
          />
        ) : (
          <div className="flex flex-col gap-3">
            <CredentialSummary values={uploadedData} />

            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={handleClickClear}
            >
              Clear
            </Button>

            <SubmitButton
              isSubmitting={isSubmitting}
              label={submitLabel}
              onClick={handleSubmit}
            />
          </div>
        )}
      </div>
    </section>
  );
}
