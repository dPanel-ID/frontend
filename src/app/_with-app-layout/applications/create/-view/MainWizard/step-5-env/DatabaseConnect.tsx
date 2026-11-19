import { useMemo, useState } from 'react';

import { CheckCircle2Icon, DatabaseIcon } from 'lucide-react';

import { useDialog } from '@/services/dialog';
import { useDevetekTranslations } from '@/services/i18n';
import { useToaster } from '@/services/toaster';

import { ApiModule, ApiServer } from '@/shared/api';
import { getApiErrorDetail } from '@/shared/libs/api-client/lib/error';
import { generatePassword } from '@/shared/libs/browser/password';
import { Button } from '@/shared/presentation/atoms/Button';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';

import {
  DATABASE_ENGINES,
  DATABASE_ENV_STYLES,
  databaseEnvEntries,
  existingDatabaseNames,
  guessDatabaseEnvStyle,
  installedDatabaseEngines,
  suggestDatabaseName,
  upsertEnvText,
} from '../../../-lib/database-env';
import type {
  DatabaseEngine,
  DatabaseEnvStyle,
} from '../../../-lib/database-env';
import { useFormStore } from '../../../-model/store/form';

const ENGINE_LABELS: Record<DatabaseEngine, string> = {
  mariadb: 'MariaDB',
  postgresql: 'PostgreSQL',
};

/**
 * Creates a database and its user on the application's server and writes
 * the connection settings, password included, into the runtime variables,
 * so nobody types or pastes a database password. The password is generated
 * here, sent once with the database's install request and kept only in the
 * application's variables (masked once saved) and on the server.
 */
export default function DatabaseConnect() {
  const t = useDevetekTranslations(
    'page.applicationsCreate.wizard.step5.env.database',
  );
  const [openDialog] = useDialog();
  const [openToaster] = useToaster();
  const [hostedServerID, appName, repository, runtimeEnvText] = useFormStore(
    (s) => [
      s.hostedServerID,
      s.appName,
      s.appSourceGithubRepo,
      s.runtimeEnvText,
    ],
  );
  const setRuntimeEnvText = useFormStore((s) => s.setRuntimeEnvText);
  const serverId = hostedServerID ? String(hostedServerID) : '';

  const [inventory, refetchInventory] = ApiServer.Modules.$Id.useGet({
    serverId,
    options: { skip: !serverId },
  });
  const modules =
    inventory.$status === 'success' ? inventory.modules : undefined;
  const engines = useMemo(() => installedDatabaseEngines(modules), [modules]);

  const [chosenEngine, setChosenEngine] = useState<DatabaseEngine>();
  const engine =
    chosenEngine && engines.includes(chosenEngine) ? chosenEngine : engines[0];
  const [name, setName] = useState<string>();
  const [user, setUser] = useState<string>();
  const [chosenStyle, setChosenStyle] = useState<DatabaseEnvStyle>();
  const [formError, setFormError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [created, setCreated] = useState<{ name: string; keys: string[] }>();

  const childModule = engine ? DATABASE_ENGINES[engine].childModule : '';
  const [detail] = ApiModule.Detail.$Name.useGet({
    name: childModule,
    options: { skip: !childModule || !isOpen },
  });

  if (!serverId || engines.length === 0 || !engine) {
    if (!serverId || inventory.$status !== 'success') return null;
    return (
      <p className="flex items-start gap-2 rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
        <DatabaseIcon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        <span>{t('noDatabaseServer')}</span>
      </p>
    );
  }

  const suggested = suggestDatabaseName(appName);
  const databaseName = name ?? suggested;
  const databaseUser = user ?? name ?? suggested;
  const style =
    chosenStyle ?? guessDatabaseEnvStyle(runtimeEnvText, repository);
  const rules = DATABASE_ENGINES[engine];
  const moduleDetail = detail.$status === 'success' ? detail : undefined;
  const installAction = moduleDetail?.action_details.find(
    (action) => action.name === 'install',
  );

  const validate = () => {
    if (!rules.namePattern.test(databaseName)) return t('badName');
    if (!rules.userPattern.test(databaseUser)) return t('badUser');
    if (existingDatabaseNames(modules, engine).has(databaseName)) {
      return t('nameTaken', { name: databaseName });
    }
    if (!moduleDetail || !installAction) return t('notReady');
    return '';
  };

  const create = async () => {
    if (!moduleDetail || !installAction) return;
    // Generated here and only kept in this request and the variables.
    const password = generatePassword();
    setIsSubmitting(true);
    try {
      const response = await ApiModule.Action.$Name.$Action.Run.doPost({
        name: moduleDetail.id,
        action: installAction.name,
        payload: {
          server_id: serverId,
          variables: {
            database_name: databaseName,
            database_user: databaseUser,
            database_password: password,
          },
          ref: {
            name: moduleDetail.input_catalog.ref_name,
            expected_commit: moduleDetail.resolved_commit,
          },
        },
      });
      if (response.$status === 'failed') {
        openToaster({
          variant: 'error',
          title: t('failed'),
          message: getApiErrorDetail(response.error),
        });
        return;
      }
      const entries = databaseEnvEntries(style, {
        engine,
        name: databaseName,
        user: databaseUser,
        password,
      });
      setRuntimeEnvText(upsertEnvText(runtimeEnvText, entries));
      setCreated({ name: databaseName, keys: entries.map(([key]) => key) });
      setIsOpen(false);
      refetchInventory();
      openToaster({
        variant: 'success',
        message: t('queued', { name: databaseName }),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = () => {
    const error = validate();
    setFormError(error);
    if (error) return;
    openDialog({
      title: t('confirmTitle'),
      content: t('confirmBody', {
        engine: ENGINE_LABELS[engine],
        name: databaseName,
        user: databaseUser,
      }),
      variant: 'info',
      actions: { variant: 'YesNo', yes: create },
    });
  };

  return (
    <div className="grid gap-3 rounded-md border bg-muted/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="grid gap-0.5">
          <span className="flex items-center gap-2 text-sm font-semibold">
            <DatabaseIcon className="size-4" aria-hidden />
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
            onClick={() => setIsOpen(true)}
          >
            {created ? t('openAnother') : t('open')}
          </Button>
        )}
      </div>

      {created && !isOpen && (
        <p
          role="status"
          className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs leading-relaxed text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2Icon className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          <span>
            {t('created', {
              name: created.name,
              keys: created.keys.join(', '),
            })}
          </span>
        </p>
      )}

      {isOpen && (
        <div className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {engines.length > 1 && (
              <label className="grid gap-1.5">
                <span className="text-xs font-semibold">{t('engine')}</span>
                <Select
                  value={engine}
                  onValueChange={(next) =>
                    setChosenEngine(next as DatabaseEngine)
                  }
                >
                  <SelectTrigger className="bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {engines.map((item) => (
                      <SelectItem key={item} value={item}>
                        {ENGINE_LABELS[item]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            )}
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold">{t('style')}</span>
              <Select
                value={style}
                onValueChange={(next) =>
                  setChosenStyle(next as DatabaseEnvStyle)
                }
              >
                <SelectTrigger className="bg-card" aria-label={t('style')}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATABASE_ENV_STYLES.map((item) => (
                    <SelectItem key={item} value={item}>
                      {t(`styles.${item}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold">{t('name')}</span>
              <Input
                className="bg-card font-mono"
                value={databaseName}
                onChange={(event) => setName(event.target.value.trim())}
              />
            </label>
            <label className="grid gap-1.5">
              <span className="text-xs font-semibold">{t('user')}</span>
              <Input
                className="bg-card font-mono"
                value={databaseUser}
                onChange={(event) => setUser(event.target.value.trim())}
              />
            </label>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {t('passwordNote')}
          </p>
          {formError && <ErrorInline message={formError} />}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setIsOpen(false);
                setFormError('');
              }}
            >
              {t('cancel')}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSubmitting || detail.$status === 'loading'}
              onClick={handleCreate}
            >
              {isSubmitting ? t('creating') : t('create')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
