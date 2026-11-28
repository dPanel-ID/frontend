import { useState } from 'react';

import { BracesIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { isLaravelFramework } from '@/entities/application/lib/app-framework';
import {
  hasMaskedEnvText,
  hideRevealedEnvText,
  revealMaskedEnvText,
} from '@/entities/application/lib/secret-mask';

import { ApiApplication } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/Button';
import {
  EnvVariablesEditor,
  ObjectStorageHelper,
  RedisHelper,
} from '@/widgets/env-variables-editor';

import { useFormStore } from '../../../-model/store/form';
import { Sectioned } from '../../../-presentation/Sectioned';

import DatabaseConnect from './DatabaseConnect';

export default function Step5Env() {
  const t = useDevetekTranslations('page.applicationsCreate.wizard.step5.env');
  const [buildEnvText, runtimeEnvText, setBuildEnvText, setRuntimeEnvText] =
    useFormStore((s) => [
      s.buildEnvText,
      s.runtimeEnvText,
      s.setBuildEnvText,
      s.setRuntimeEnvText,
    ]);
  const updateApplicationId = useFormStore((s) => s.updateApplicationId);
  const [hostedServerID, appName, appFramework] = useFormStore((s) => [
    s.hostedServerID,
    s.appName,
    s.appFramework,
  ]);
  // Laravel's own variables (storage disk, Redis drivers) only for an app
  // identified as Laravel; any other app gets generic ones.
  const isLaravel = isLaravelFramework(appFramework);
  const [openToaster] = useToaster();
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealed, setRevealed] = useState<{
    build: Array<{ key: string; value: string }>;
    run: Array<{ key: string; value: string }>;
  } | null>(null);
  // Values of a saved application arrive masked; unchanged ones keep their
  // stored value. Showing them is a separate, logged call.
  const hasMasked =
    !!updateApplicationId &&
    (hasMaskedEnvText(buildEnvText) || hasMaskedEnvText(runtimeEnvText));
  const isShown = !!updateApplicationId && !hasMasked && revealed !== null;

  const hideValues = () => {
    if (!revealed) return;
    setBuildEnvText(hideRevealedEnvText(buildEnvText, revealed.build));
    setRuntimeEnvText(hideRevealedEnvText(runtimeEnvText, revealed.run));
    setRevealed(null);
  };

  const revealValues = async () => {
    if (!updateApplicationId) return;
    setIsRevealing(true);
    try {
      const response = await ApiApplication.EnvironmentReveal.$Id.doPost({
        applicationId: updateApplicationId,
      });
      if (response.$status !== 'success') {
        openToaster({
          variant: 'error',
          title: t('revealFailed'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }
      setBuildEnvText(revealMaskedEnvText(buildEnvText, response.build));
      setRuntimeEnvText(revealMaskedEnvText(runtimeEnvText, response.run));
      setRevealed({ build: response.build, run: response.run });
    } finally {
      setIsRevealing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Sectioned
        sectionIcon={BracesIcon}
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        classNameContent="grid gap-4"
      >
        {(hasMasked || isShown) && (
          <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <span>{isShown ? t('shownNote') : t('hiddenNote')}</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 shrink-0 gap-1"
              disabled={isRevealing}
              onClick={() => (isShown ? hideValues() : void revealValues())}
            >
              {isShown ? (
                <EyeOffIcon className="size-3" />
              ) : (
                <EyeIcon className="size-3" />
              )}
              {isShown ? t('hide') : isRevealing ? t('revealing') : t('reveal')}
            </Button>
          </div>
        )}

        <div className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('buildTitle')}</span>
          <span className="text-xs text-muted-foreground">
            {t('buildDesc')}
          </span>
          <EnvVariablesEditor
            label={t('buildTitle')}
            defaultMode="text"
            text={buildEnvText}
            onTextChange={setBuildEnvText}
            textPlaceholder={'NODE_ENV="production"\nCI="true"'}
          />
        </div>

        <DatabaseConnect />

        <RedisHelper
          serverId={hostedServerID ? String(hostedServerID) : ''}
          appName={appName}
          envText={runtimeEnvText}
          onEnvTextChange={setRuntimeEnvText}
          laravel={isLaravel}
        />

        {isLaravel && (
          <ObjectStorageHelper
            envText={runtimeEnvText}
            onEnvTextChange={setRuntimeEnvText}
          />
        )}

        <div className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('runtimeTitle')}</span>
          <span className="text-xs text-muted-foreground">
            {t('runtimeDesc')}
          </span>
          <EnvVariablesEditor
            label={t('runtimeTitle')}
            defaultMode="text"
            text={runtimeEnvText}
            onTextChange={setRuntimeEnvText}
            textPlaceholder={'APP_ENV="production"\nLOG_LEVEL="info"'}
          />
        </div>
      </Sectioned>
    </div>
  );
}
