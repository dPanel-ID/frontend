import { InfoIcon, SparklesIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { cn } from '@/shared/libs/tailwind/cn';
import { StatusPill } from '@/shared/presentation/molecules/StatusPill';
import { FLOW_ACCENTS } from '@/shared/presentation/organisms/FlowHero';

import { visiblePresetHints } from '../../-lib/laravel-preset';
import { useFormStore } from '../../-model/store/form';

const KNOWN_HINTS = new Set([
  'app_key_managed',
  'app_url_missing',
  'frankenphp_required',
]);

function Fact(props: { label: string; value: string }) {
  return (
    <div className="grid min-w-0 gap-0.5">
      <dt className="text-xs text-muted-foreground">{props.label}</dt>
      <dd className="truncate text-sm font-medium" title={props.value}>
        {props.value}
      </dd>
    </div>
  );
}

/**
 * "Laravel detected": what dPanel read from the repository and the
 * settings it filled in, with the notes a Laravel app needs (APP_KEY,
 * APP_URL, the web server module). Hidden for other repositories.
 */
export default function PresetPanel(props: { compact?: boolean }) {
  const t = useDevetekTranslations('page.applicationsCreate.preset');
  const [preset, selectedDependencyIds, dependencyConfigs, runtimeEnvText] =
    useFormStore((s) => [
      s.laravelPreset,
      s.selectedDependencyIds,
      s.dependencyConfigs,
      s.runtimeEnvText,
    ]);
  if (!preset || preset.framework !== 'laravel') return null;

  const hints = visiblePresetHints(preset.hints, {
    moduleIds: selectedDependencyIds.map((id) => {
      const config = dependencyConfigs[id];
      return config?.moduleId || config?.id || id;
    }),
    runtimeEnvText,
  }).filter((code) => KNOWN_HINTS.has(code));

  const { facts } = preset;
  const frontEnd = facts.node
    ? facts.package_manager || 'npm'
    : t('facts.none');

  return (
    <section
      aria-labelledby="laravel-preset-title"
      className="relative overflow-hidden rounded-xl border bg-background p-4"
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'flex size-9 shrink-0 items-center justify-center rounded-lg border',
            FLOW_ACCENTS.sky.icon,
          )}
        >
          <SparklesIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 id="laravel-preset-title" className="text-sm font-bold">
              {t('title')}
            </h4>
            <StatusPill tone="success" label={t('applied')} />
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {t('desc')}
          </p>
        </div>
      </div>

      {!props.compact && (
        <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <Fact
            label={t('facts.laravel')}
            value={facts.laravel_version || t('facts.unknown')}
          />
          <Fact
            label={t('facts.php')}
            value={facts.php_constraint || t('facts.unknown')}
          />
          <Fact
            label={t('facts.server')}
            value={facts.octane ? t('facts.octane') : t('facts.classic')}
          />
          <Fact label={t('facts.frontEnd')} value={frontEnd} />
          <Fact
            label={t('facts.health')}
            value={facts.health_route ? '/up' : t('facts.none')}
          />
        </dl>
      )}

      {hints.length > 0 && (
        <ul className="mt-3 grid gap-1.5">
          {hints.map((code) => (
            <li
              key={code}
              className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
            >
              <InfoIcon className="mt-0.5 size-3.5 shrink-0 text-sky-600 dark:text-sky-300" />
              <span>{t(`hints.${code}`)}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
