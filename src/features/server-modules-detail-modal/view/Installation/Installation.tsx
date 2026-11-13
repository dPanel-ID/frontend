import { useEffect, useMemo, useRef, useState } from 'react';

import { useDevetekTranslations } from '@/services/i18n';

import { ApiModule } from '@/shared/api';
import type { DTOs } from '@/shared/api';
import { Button } from '@/shared/presentation/atoms/Button';
import { Checkbox } from '@/shared/presentation/atoms/Checkbox';
import { ErrorInline } from '@/shared/presentation/atoms/ErrorInline';
import { Input } from '@/shared/presentation/atoms/Input';
import { PasswordInput } from '@/shared/presentation/atoms/PasswordInput';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/presentation/atoms/Select';
import { Spinner } from '@/shared/presentation/atoms/Spinner';
import { TextArea } from '@/shared/presentation/atoms/TextArea';
import type { ExplicitTarget } from '@/shared/rules/host-group';
import { FailedState } from '@/widgets/failed-state';

import { useBaseContext } from '../../config/base-context';
import useHandleInstallModule from '../../model/handle-install-module';

import {
  getAvailableModuleActions,
  isBlockedHostGroupAction,
} from './action-options';
import { isAcceptedValue } from './version-choice';
import { VersionChoiceField } from './VersionChoiceField';

type FieldValue = unknown;

function defaultFieldValue(input: DTOs.ModuleInputV1): FieldValue {
  if (input.type === 'hidden') return input.default ?? '';
  if (input.type === 'boolean') return Boolean(input.default);
  if (input.default == null) return '';
  if (input.type === 'object') {
    return JSON.stringify(input.default, null, 2);
  }
  return String(input.default);
}

function parseFieldValue(input: DTOs.ModuleInputV1, value: FieldValue) {
  if (input.type === 'hidden') return value === '' ? undefined : value;
  if (input.type === 'boolean') return Boolean(value);
  if (input.type === 'number') {
    if (value === '') return undefined;
    return Number(value);
  }
  if (input.type === 'object') {
    if (value === '') return undefined;
    return JSON.parse(String(value));
  }
  return value === '' ? undefined : value;
}

function buildVariables(
  inputs: DTOs.ModuleInputV1[],
  values: Record<string, FieldValue>,
) {
  return inputs.reduce<Record<string, unknown>>((acc, input) => {
    const value = values[input.name] ?? defaultFieldValue(input);
    const parsed = parseFieldValue(input, value);
    if (parsed !== undefined) {
      acc[input.name] = parsed;
    }
    return acc;
  }, {});
}

function isHiddenInput(input: DTOs.ModuleInputV1) {
  return input.type === 'hidden';
}

/** A secret the operator types, such as a database administrator password. */
function isSecretInput(input: DTOs.ModuleInputV1) {
  return Boolean(input.sensitive) && input.type !== 'boolean';
}

/**
 * Required fields the operator left empty. A password has no default to fall
 * back on, so the install would otherwise fail on the server minutes later.
 */
function missingRequiredInputs(
  inputs: DTOs.ModuleInputV1[],
  values: Record<string, FieldValue>,
) {
  return inputs.filter((input) => {
    if (!input.required || isHiddenInput(input)) return false;
    const value = values[input.name] ?? defaultFieldValue(input);
    if (input.type === 'boolean') return false;
    return String(value).trim() === '';
  });
}

export default function Installation() {
  const { moduleInfo, serverID, hostGroupTarget } = useBaseContext();
  const { installModule } = useHandleInstallModule();
  const [values, setValues] = useState<Record<string, FieldValue>>({});
  const t = useDevetekTranslations('page.serverDetail.modules.installForm');
  const [formError, setFormError] = useState('');
  // The fields scroll under a fixed Install button; an error is shown at the
  // top of them and the list scrolls back so it is seen.
  const fieldsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (formError) fieldsRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [formError]);
  const [targetMode, setTargetMode] = useState<'server' | 'hostgroup'>(
    serverID ? 'server' : 'hostgroup',
  );

  const [detail] = ApiModule.Detail.$Name.useGet({
    name: moduleInfo.id,
    ref: moduleInfo.refName,
    options: {
      skip: !moduleInfo.id,
    },
  });

  const moduleDetail =
    detail.$status === 'success'
      ? detail
      : detail.$status === 'loading'
        ? detail.prevData
        : undefined;

  const availableActions = useMemo(
    () =>
      getAvailableModuleActions(
        moduleDetail?.action_details,
        targetMode === 'hostgroup' && Boolean(hostGroupTarget),
      ),
    [hostGroupTarget, moduleDetail?.action_details, targetMode],
  );
  const action = availableActions.defaultAction;

  const visibleInputs =
    moduleDetail?.inputs.filter((input) => !isHiddenInput(input)) ?? [];
  const requiredInputs = visibleInputs.filter((input) => input.required);
  const advancedInputs = visibleInputs.filter((input) => !input.required);
  const activeTarget = useMemo((): ExplicitTarget | null => {
    if (targetMode === 'server' && serverID) {
      return {
        type: 'server',
        id: String(serverID),
      };
    }

    if (targetMode === 'hostgroup' && hostGroupTarget) {
      return {
        type: 'hostgroup',
        id: hostGroupTarget.id,
      };
    }

    return null;
  }, [hostGroupTarget, serverID, targetMode]);

  const handleChange = (name: string, value: FieldValue) => {
    setValues((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleClickInstall = () => {
    if (!activeTarget || !moduleDetail || !action) return;

    if (
      activeTarget.type === 'hostgroup' &&
      isBlockedHostGroupAction(action.name)
    ) {
      setFormError(t('singleServerOnly'));
      return;
    }

    const missing = missingRequiredInputs(moduleDetail.inputs, values);
    if (missing.length > 0) {
      setFormError(
        t('missing', {
          fields: missing.map((input) => input.label || input.name).join(', '),
        }),
      );
      return;
    }

    const malformed = moduleDetail.inputs.filter(
      (input) =>
        !isHiddenInput(input) &&
        typeof (values[input.name] ?? '') === 'string' &&
        !isAcceptedValue(input, String(values[input.name] ?? '')),
    );
    if (malformed.length > 0) {
      setFormError(
        t('malformed', {
          fields: malformed
            .map((input) => input.label || input.name)
            .join(', '),
        }),
      );
      return;
    }

    try {
      setFormError('');
      const variables = buildVariables(moduleDetail.inputs, values);
      installModule({
        action: action.name,
        actionTitle: action.title,
        target: activeTarget,
        targetLabel:
          activeTarget.type === 'hostgroup'
            ? (hostGroupTarget?.label ?? activeTarget.id)
            : `server ${activeTarget.id}`,
        snapshotCount:
          activeTarget.type === 'hostgroup'
            ? hostGroupTarget?.memberCount
            : undefined,
        variables,
        ref: {
          name: moduleDetail.input_catalog.ref_name,
          expected_commit: moduleDetail.resolved_commit,
        },
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('unreadable'));
    }
  };

  if (!serverID && !hostGroupTarget) {
    return (
      <div className="rounded-xl border bg-card p-4 text-sm text-primary/70">
        Select a server or explicit server group before installing this role.
      </div>
    );
  }

  if (detail.$status === 'loading' && !moduleDetail) {
    return (
      <div className="py-6 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (detail.$status === 'failed' && !moduleDetail) {
    return <FailedState.WallCentered />;
  }

  if (!moduleDetail || !action) {
    return (
      <p className="text-sm italic">
        {targetMode === 'hostgroup'
          ? 'No non-destructive action is available for this explicit server group.'
          : 'No installation action is available for this role.'}
      </p>
    );
  }

  const renderInputs = (inputs: DTOs.ModuleInputV1[]) => {
    const visible = inputs.filter((input) => !isHiddenInput(input));

    if (visible.length === 0) {
      return (
        <p className="text-sm text-primary/60">
          This role does not require additional options.
        </p>
      );
    }

    return visible.map((input) => {
      const value = values[input.name] ?? defaultFieldValue(input);

      return (
        <label key={input.name} className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-primary/80">
            {input.label || input.name}
            {input.required && (
              <span aria-hidden className="ml-0.5 font-bold text-red-500">
                *
              </span>
            )}
          </span>
          {input.description && (
            <span className="text-xs text-primary/55">{input.description}</span>
          )}

          {input.options?.length ? (
            <VersionChoiceField
              input={input}
              value={String(value)}
              onChange={(next) => handleChange(input.name, next)}
            />
          ) : input.type === 'boolean' ? (
            <div className="flex items-center gap-2 rounded-lg border bg-background px-3 py-2">
              <Checkbox
                checked={Boolean(value)}
                onCheckedChange={(checked) =>
                  handleChange(input.name, checked === true)
                }
              />
              <span className="text-sm text-primary/70">Enabled</span>
            </div>
          ) : input.type === 'object' ? (
            <TextArea
              className="h-56 min-h-28 resize-y overflow-auto font-mono text-xs [field-sizing:fixed]"
              value={String(value)}
              onChange={(event) => handleChange(input.name, event.target.value)}
            />
          ) : isSecretInput(input) ? (
            <PasswordInput
              value={String(value)}
              placeholder="Choose a password"
              onChange={(event) => handleChange(input.name, event.target.value)}
            />
          ) : (
            <Input
              type={input.type === 'number' ? 'number' : 'text'}
              value={String(value)}
              onChange={(event) => handleChange(input.name, event.target.value)}
            />
          )}
        </label>
      );
    });
  };

  return (
    <div className="flex min-h-0 w-full flex-col overflow-hidden rounded-xl border bg-background">
      <div className="shrink-0 flex items-start justify-between gap-4 px-4 py-3">
        <div>
          <h6 className="cursor-default text-sm font-bold text-primary">
            Install role
          </h6>
          <p className="mt-1 text-xs text-primary/55">
            dPanel will generate a workspace playbook and queue it for this
            server.
          </p>
        </div>

        <Button size="xs" variant="outline" onClick={handleClickInstall}>
          Install role
        </Button>
      </div>

      <div
        ref={fieldsRef}
        className="flex max-h-[clamp(18rem,calc(100svh-22rem),40rem)] min-h-0 flex-col gap-5 overflow-y-auto overscroll-contain border-t p-4"
      >
        {formError && <ErrorInline message={formError} />}
        {serverID && hostGroupTarget ? (
          <div className="rounded-lg border bg-card p-3">
            <h6 className="text-sm font-bold text-primary/80">Target</h6>
            <div className="mt-2">
              <Select
                value={targetMode}
                onValueChange={(value) =>
                  setTargetMode(value as 'server' | 'hostgroup')
                }
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Choose target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="server">Selected server</SelectItem>
                  <SelectItem value="hostgroup">
                    {hostGroupTarget.label} ({hostGroupTarget.memberCount}{' '}
                    members)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : null}

        <div className="rounded-lg border bg-card p-3">
          <h6 className="text-sm font-bold text-primary/80">Roles to run</h6>
          <div className="mt-2 flex flex-wrap gap-2">
            {(action.roles?.length
              ? action.roles
              : (moduleDetail.source.roles ?? [moduleDetail.id])
            ).map((role) => (
              <span
                key={role}
                className="rounded-md bg-background px-2 py-1 text-xs font-medium text-primary/70"
              >
                {role}
              </span>
            ))}
          </div>
        </div>

        {requiredInputs.length > 0 && (
          <div className="flex flex-col gap-3">
            <h6 className="text-sm font-bold text-primary/80">Required</h6>
            {renderInputs(requiredInputs)}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <h6 className="text-sm font-bold text-primary/80">
            Advanced options
          </h6>
          {renderInputs(advancedInputs)}
        </div>

        <div className="rounded-lg border bg-card p-3 text-xs text-primary/60">
          Source: {moduleDetail.input_catalog.ref_name} @{' '}
          {moduleDetail.resolved_commit.slice(0, 12)}
        </div>
      </div>
    </div>
  );
}
