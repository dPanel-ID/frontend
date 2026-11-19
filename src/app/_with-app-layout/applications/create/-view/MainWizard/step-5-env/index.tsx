import { useState } from 'react';

import { BracesIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import {
  SECRET_MASK,
  hideRevealedEnvText,
  revealMaskedEnvText,
} from '@/entities/application/lib/secret-mask';

import { ApiApplication } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { Button } from '@/shared/presentation/atoms/Button';
import { TextArea } from '@/shared/presentation/atoms/TextArea';

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
    (buildEnvText.includes(SECRET_MASK) ||
      runtimeEnvText.includes(SECRET_MASK));
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

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('buildTitle')}</span>
          <span className="text-xs text-muted-foreground">
            {t('buildDesc')}
          </span>
          <TextArea
            className="min-h-36 font-mono text-sm"
            placeholder={'NODE_ENV=production\nCI=true'}
            value={buildEnvText}
            onChange={(event) => setBuildEnvText(event.target.value)}
          />
        </label>

        <DatabaseConnect />

        <label className="grid gap-1.5">
          <span className="text-sm font-semibold">{t('runtimeTitle')}</span>
          <span className="text-xs text-muted-foreground">
            {t('runtimeDesc')}
          </span>
          <TextArea
            className="min-h-36 font-mono text-sm"
            placeholder={'APP_ENV=production\nLOG_LEVEL=info'}
            value={runtimeEnvText}
            onChange={(event) => setRuntimeEnvText(event.target.value)}
          />
        </label>
      </Sectioned>
    </div>
  );
}
