import { useId, useMemo, useState } from 'react';

import { CheckCircle2Icon, ZapIcon } from 'lucide-react';

import { useDevetekTranslations } from '@/services/i18n';

import { upsertEnvText } from '@/entities/application/lib/env-text';
import {
  REDIS_DRIVERS,
  REDIS_PREFIX_PATTERN,
  installedRedis,
  redisEnvEntries,
  suggestRedisPrefix,
} from '@/entities/application/lib/redis-env';
import type { RedisDriver } from '@/entities/application/lib/redis-env';
import { useServerModules } from '@/entities/server-modules/model/use-server-modules';

import { Button } from '@/shared/presentation/atoms/Button';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { PasswordInput } from '@/shared/presentation/atoms/PasswordInput';

export interface RedisHelperProps {
  /** The server the application runs on; nothing shows without one. */
  serverId: string;
  /** Suggests the key prefix. */
  appName: string;
  /** The runtime variables, as env text. */
  envText: string;
  onEnvTextChange: (next: string) => void;
  /**
   * The application is identified as Laravel: it also gets a key prefix
   * and the choice of Laravel drivers. Any other application gets the
   * connection variables only.
   */
  laravel: boolean;
  disabled?: boolean;
}

/**
 * Connects an application to the Redis installed on its server: fills
 * REDIS_HOST, REDIS_PORT and, when Redis asks for one, the password the
 * person types (dPanel does not keep it). A Laravel application also gets
 * a per-app REDIS_PREFIX and can switch its cache, queue and sessions to
 * Redis; any other application gets REDIS_URL. Used by the create wizard
 * and the application's settings alike.
 */
export default function RedisHelper(props: RedisHelperProps) {
  const { serverId, appName, envText, onEnvTextChange, laravel, disabled } =
    props;
  const t = useDevetekTranslations('widget.envVariablesEditor.redis');
  const id = useId();

  const [inventory] = useServerModules(serverId);
  const modules =
    inventory.$status === 'success' ? inventory.modules : undefined;
  const redis = useMemo(() => installedRedis(modules), [modules]);

  const [isOpen, setIsOpen] = useState(false);
  const [prefix, setPrefix] = useState<string>();
  const [password, setPassword] = useState('');
  const [drivers, setDrivers] = useState<RedisDriver[]>(REDIS_DRIVERS);
  const [formError, setFormError] = useState('');
  const [applied, setApplied] = useState<string[]>();

  // No server yet, or the list is still loading: nothing to offer.
  if (!serverId || inventory.$status !== 'success') return null;
  if (!redis) {
    return (
      <p className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <ZapIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{t('noRedis')}</span>
      </p>
    );
  }

  const keyPrefix = prefix ?? suggestRedisPrefix(appName);

  const toggleDriver = (driver: RedisDriver, on: boolean) =>
    setDrivers((current) =>
      REDIS_DRIVERS.filter((item) =>
        item === driver ? on : current.includes(item),
      ),
    );

  const apply = () => {
    if (laravel && !REDIS_PREFIX_PATTERN.test(keyPrefix)) {
      setFormError(t('badPrefix'));
      return;
    }
    if (redis.password === 'required' && !password) {
      setFormError(t('passwordRequired'));
      return;
    }
    setFormError('');
    const entries = redisEnvEntries({
      server: redis,
      password,
      laravel,
      prefix: keyPrefix,
      drivers,
    });
    onEnvTextChange(upsertEnvText(envText, entries));
    setApplied(entries.map(([key]) => key));
    // The password now lives only in the variables.
    setPassword('');
    setIsOpen(false);
  };

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ZapIcon className="size-4" aria-hidden />
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
            {applied ? t('openAgain') : t('open')}
          </Button>
        )}
      </div>

      {applied && !isOpen && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>{t('applied', { keys: applied.join(', ') })}</span>
        </p>
      )}

      {isOpen && (
        <div className="grid gap-3">
          <p className="text-xs text-muted-foreground">
            {t('target', { host: redis.host, port: redis.port })}
          </p>
          {(laravel || redis.password !== 'none') && (
            <div className="grid gap-3 sm:grid-cols-2">
              {laravel && (
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`${id}-prefix`}
                    className="text-xs font-semibold"
                  >
                    {t('prefix')}
                  </label>
                  <Input
                    id={`${id}-prefix`}
                    className="bg-card font-mono"
                    value={keyPrefix}
                    maxLength={64}
                    aria-describedby={`${id}-prefix-hint`}
                    onChange={(event) => setPrefix(event.target.value.trim())}
                  />
                  <span
                    id={`${id}-prefix-hint`}
                    className="text-xs text-muted-foreground"
                  >
                    {t('prefixHint')}
                  </span>
                </div>
              )}
              {redis.password !== 'none' && (
                <div className="grid gap-1.5">
                  <label
                    htmlFor={`${id}-password`}
                    className="text-xs font-semibold"
                  >
                    {redis.password === 'required'
                      ? t('password')
                      : t('passwordOptional')}
                  </label>
                  <PasswordInput
                    id={`${id}-password`}
                    className="bg-card font-mono"
                    value={password}
                    revealLabel={t('reveal')}
                    hideLabel={t('hide')}
                    aria-describedby={`${id}-password-hint`}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  <span
                    id={`${id}-password-hint`}
                    className="text-xs text-muted-foreground"
                  >
                    {redis.password === 'required'
                      ? t('passwordHint')
                      : t('passwordOptionalHint')}
                  </span>
                </div>
              )}
            </div>
          )}

          {laravel && (
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-xs font-semibold">
                {t('driversTitle')}
              </legend>
              {REDIS_DRIVERS.map((driver) => (
                <div key={driver} className="flex items-start gap-3">
                  <Checkbox
                    id={`${id}-${driver}`}
                    checked={drivers.includes(driver)}
                    onCheckedChange={(checked) =>
                      toggleDriver(driver, checked === true)
                    }
                  />
                  <label
                    htmlFor={`${id}-${driver}`}
                    className="cursor-pointer text-xs"
                  >
                    {t(`drivers.${driver}`)}
                  </label>
                </div>
              ))}
            </fieldset>
          )}

          {formError && <ErrorInline message={formError} />}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setFormError('');
                setPassword('');
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
