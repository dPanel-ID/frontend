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

export default function FormGCP(props: {
  provider?: DTOs.CloudProviderContractV1;
}) {
  const { provider } = props;
  const { formGCP: form } = useCpcFormContext();

  const { isSubmitting, handleSubmit } = useModelSubmission(provider);

  const handleUploadData = (data: SchemaGcpForm) => {
    for (const [key, value] of Object.entries(data)) {
      form.setValue(key as keyof SchemaGcpForm, value);
    }
  };

  const handleClickClear = () => {
    form.reset();
  };

  const values = form.watch();

  const isUploaded = Object.values(values).length > 0;

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
        {!isUploaded ? (
          <UploadArea schema={schemaGcpForm} onUploadData={handleUploadData} />
        ) : (
          <div className="flex flex-col gap-3">
            <ReadOnlyView data={values} />

            <Button
              buttonStyle="outline"
              buttonColor="secondary"
              onClick={handleClickClear}
            >
              Clear
            </Button>

            <SubmitButton isSubmitting={isSubmitting} onClick={handleSubmit} />
          </div>
        )}
      </div>
    </section>
  );
}
