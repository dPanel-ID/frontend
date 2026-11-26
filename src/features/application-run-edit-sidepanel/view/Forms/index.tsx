import { useMemo, useState } from 'react';

import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useWatch } from 'react-hook-form';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import {
  hasMaskedEnvText,
  hideRevealedEnvText,
  revealMaskedEnvText,
} from '@/entities/application/lib/secret-mask';

import { ApiApplication } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/Button';
import { EnvVariablesEditor } from '@/widgets/env-variables-editor';

import { useApplicationRunEditModel } from '../../model';

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-bold text-sm pb-2 border-b mb-3">{children}</h5>;
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="font-bold text-xs text-primary/70 mb-1">{children}</p>;
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
 * the masked values, keeping anything already typed. Hiding masks again
 * every value still equal to what was revealed; edited values stay visible
 * so they are saved as typed. Both work on the variables text, so they
 * apply to the rows and to the text view alike.
 */
function useRevealValues() {
  const t = useDevetekTranslations('sidepanel.applicationRunEdit.envValues');
  const { form, props } = useApplicationRunEditModel();
  const [openToaster] = useToaster();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState<
    Array<{ key: string; value: string }>
  >([]);
  const envText = useWatch({ control: form.control, name: 'envText' });
  const hasMasked = useMemo(() => hasMaskedEnvText(envText), [envText]);
  const isShown = !hasMasked && revealed.length > 0;

  const setEnvText = (next: string) => {
    if (next !== form.getValues('envText')) {
      form.setValue('envText', next, { shouldDirty: false });
    }
  };

  const hide = () => {
    setEnvText(hideRevealedEnvText(form.getValues('envText'), revealed));
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
          title: t('revealFailed'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }
      setEnvText(revealMaskedEnvText(form.getValues('envText'), response.run));
      setRevealed(response.run);
    } finally {
      setIsRevealing(false);
    }
  };

  return { hasMasked, isShown, isRevealing, reveal, hide };
}

function RunEnvsSection() {
  const t = useDevetekTranslations('sidepanel.applicationRunEdit.envValues');
  const { form } = useApplicationRunEditModel();
  const { hasMasked, isShown, isRevealing, reveal, hide } = useRevealValues();
  const envText = useWatch({ control: form.control, name: 'envText' });

  const revealButton = (
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
      {isShown ? t('hide') : isRevealing ? t('revealing') : t('reveal')}
    </Button>
  );

  const hasBanner = hasMasked || isShown;

  return (
    <div className="flex flex-col gap-1 pb-4">
      <SectionTitle>Environment Variables</SectionTitle>

      <EnvVariablesEditor
        label="Environment Variables"
        text={envText}
        onTextChange={(next) =>
          form.setValue('envText', next, { shouldDirty: true })
        }
        notice={
          hasBanner ? (isShown ? t('shownNote') : t('hiddenNote')) : undefined
        }
        actions={hasBanner ? revealButton : undefined}
        textPlaceholder={'APP_ENV="production"\nLOG_LEVEL="info"'}
      />
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
