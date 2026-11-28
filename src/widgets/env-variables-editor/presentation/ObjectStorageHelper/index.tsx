import { useId, useState } from 'react';

import { CheckCircle2Icon, CloudUploadIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { upsertEnvText } from '@/entities/application/lib/env-text';
import {
  OBJECT_STORAGE_PACKAGE,
  objectStorageEnvEntries,
  objectStorageErrors,
  usesObjectStorage,
} from '@/entities/application/lib/object-storage-env';
import type {
  ObjectStorageField,
  ObjectStorageSettings,
} from '@/entities/application/lib/object-storage-env';

import { Button } from '@/shared/presentation/atoms/Button';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { PasswordInput } from '@/shared/presentation/atoms/PasswordInput';

export interface ObjectStorageHelperProps {
  /** The runtime variables, as env text. */
  envText: string;
  onEnvTextChange: (next: string) => void;
  disabled?: boolean;
}

const EMPTY: ObjectStorageSettings = {
  accessKeyId: '',
  secretAccessKey: '',
  region: 'us-east-1',
  bucket: '',
  endpoint: '',
  usePathStyle: false,
};

const FIELDS: Array<{
  field: Exclude<ObjectStorageField, 'secretAccessKey'>;
  placeholder: string;
}> = [
  { field: 'accessKeyId', placeholder: '' },
  { field: 'bucket', placeholder: 'my-app-uploads' },
  { field: 'region', placeholder: 'us-east-1' },
  { field: 'endpoint', placeholder: 'https://s3.example.com' },
];

/**
 * Points a Laravel app's uploads at an S3-compatible bucket by filling the
 * runtime variables (FILESYSTEM_DISK=s3 and the AWS_* settings). The keys
 * typed here go only into those variables, which are hidden once saved.
 */
export default function ObjectStorageHelper(props: ObjectStorageHelperProps) {
  const { envText, onEnvTextChange, disabled } = props;
  const t = useDevetekTranslations('widget.envVariablesEditor.objectStorage');
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<ObjectStorageSettings>(EMPTY);
  const [errors, setErrors] = useState<
    Partial<Record<ObjectStorageField, string>>
  >({});
  const [applied, setApplied] = useState(false);
  const isUsed = usesObjectStorage(envText);

  const update = (patch: Partial<ObjectStorageSettings>) =>
    setSettings((current) => ({ ...current, ...patch }));

  const apply = () => {
    const next = objectStorageErrors(settings);
    setErrors(next);
    if (Object.keys(next).length) return;
    onEnvTextChange(upsertEnvText(envText, objectStorageEnvEntries(settings)));
    // The secret leaves this form: it now lives only in the variables.
    setSettings(EMPTY);
    setApplied(true);
    setIsOpen(false);
  };

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <CloudUploadIcon className="size-4" aria-hidden />
            {t('title')}
          </span>
          <span className="text-xs text-muted-foreground">{t('desc')}</span>
        </div>
        {!isOpen && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="shrink-0"
            disabled={disabled}
            onClick={() => setIsOpen(true)}
          >
            {isUsed ? t('openAgain') : t('open')}
          </Button>
        )}
      </div>

      {(applied || isUsed) && !isOpen && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{t('applied', { package: OBJECT_STORAGE_PACKAGE })}</span>
        </p>
      )}

      {isOpen && (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {FIELDS.map(({ field, placeholder }) => (
              <label key={field} className="grid gap-1.5">
                <span className="text-xs font-semibold">
                  {t(`fields.${field}`)}
                </span>
                <Input
                  className="bg-card font-mono"
                  value={settings[field]}
                  placeholder={placeholder}
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={Boolean(errors[field])}
                  onChange={(event) => update({ [field]: event.target.value })}
                />
                {errors[field] ? (
                  <ErrorInline message={t(`errors.${errors[field]}`)} />
                ) : field === 'endpoint' ? (
                  <span className="text-xs text-muted-foreground">
                    {t('endpointHint')}
                  </span>
                ) : null}
              </label>
            ))}
            <div className="grid gap-1.5">
              <label htmlFor={`${id}-secret`} className="text-xs font-semibold">
                {t('fields.secretAccessKey')}
              </label>
              <PasswordInput
                id={`${id}-secret`}
                className="bg-card font-mono"
                value={settings.secretAccessKey}
                revealLabel={t('reveal')}
                hideLabel={t('hide')}
                aria-invalid={Boolean(errors.secretAccessKey)}
                onChange={(event) =>
                  update({ secretAccessKey: event.target.value })
                }
              />
              {errors.secretAccessKey && (
                <ErrorInline message={t(`errors.${errors.secretAccessKey}`)} />
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id={`${id}-path-style`}
              checked={settings.usePathStyle}
              aria-describedby={`${id}-path-style-hint`}
              onCheckedChange={(checked) =>
                update({ usePathStyle: checked === true })
              }
            />
            <span className="grid gap-0.5">
              <label
                htmlFor={`${id}-path-style`}
                className="cursor-pointer text-xs font-semibold"
              >
                {t('pathStyle')}
              </label>
              <span
                id={`${id}-path-style-hint`}
                className="text-xs text-muted-foreground"
              >
                {t('pathStyleHint')}
              </span>
            </span>
          </div>

          <p className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs leading-relaxed text-amber-800 dark:text-amber-200">
            {t('packageNote', { package: OBJECT_STORAGE_PACKAGE })}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('secretNote')}
          </p>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setErrors({});
                setSettings(EMPTY);
              }}
            >
              {t('cancel')}
            </Button>
            <Button type="button" size="sm" onClick={apply}>
              {t('apply')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
