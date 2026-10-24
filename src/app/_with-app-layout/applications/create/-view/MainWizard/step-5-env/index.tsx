import { BracesIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { TextArea } from '@/shared/presentation/atoms/TextArea';

import { useFormStore } from '../../../-model/store/form';
import { Sectioned } from '../../../-presentation/Sectioned';

export default function Step5Env() {
  const t = useDevetekTranslations('page.applicationsCreate.wizard.step5.env');
  const [buildEnvText, runtimeEnvText, setBuildEnvText, setRuntimeEnvText] =
    useFormStore((s) => [
      s.buildEnvText,
      s.runtimeEnvText,
      s.setBuildEnvText,
      s.setRuntimeEnvText,
    ]);

  return (
    <div className="flex flex-col gap-4">
      <Sectioned
        sectionIcon={BracesIcon}
        sectionTitle={t('title')}
        sectionDescription={t('desc')}
        classNameContent="grid gap-4"
      >
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
