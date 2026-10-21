import type { useForm } from 'react-hook-form';

import type { ApiDomain } from '@/shared/api';
import type {
  ProviderContract,
  ProviderField,
} from '@/shared/api/domain.providers';

import type { DomainCreateForm } from '../-rules/form';


export function hasUsableCredential(
  values: Partial<DomainCreateForm>,
  provider?: ProviderContract,
) {
  if (!provider) return false;

  const credentials = values.credentials ?? {};

  const requiredFieldsSatisfied = getCredentialFields(provider)
    .filter((field) => field.required)
    .every((field) => isCredentialFieldFilled(credentials, field.key));

  if (!requiredFieldsSatisfied) return false;

  return (provider.credential_rules ?? []).every((rule) =>
    isCredentialRuleSatisfied(rule, credentials),
  );
}

export function getProviderContracts(
  response: ReturnType<typeof ApiDomain.Providers.useGet>[0],
) {
  if (response.$status === 'success') {
    return normalizeProviderContracts(response.providers);
  }

  if (response.$status === 'loading') {
    return normalizeProviderContracts(response.prevData?.providers);
  }

  return [];
}

export function normalizeProviderContracts(providers?: ProviderContract[]) {
  return (providers ?? []).filter((provider) => !!provider.provider);
}

export function getCredentialFields(provider?: ProviderContract) {
  return (provider?.credential_fields ?? []).filter((field) => !!field.key);
}

export function getProviderLabel(provider: ProviderContract) {
  return provider.label || provider.provider || 'Unknown provider';
}

export function shouldRenderTextarea(field: ProviderField) {
  const type = field.type?.toLowerCase();
  return type === 'textarea' || type === 'multiline';
}

export function buildCredentialPayload(
  provider: ProviderContract,
  values: DomainCreateForm,
) {
  const credentials = values.credentials;
  const payload: Record<string, string> = {};

  for (const field of getCredentialFields(provider)) {
    const fieldKey = field.key;
    if (!fieldKey) continue;

    const value = credentials[fieldKey]?.trim();
    if (value) payload[fieldKey] = value;
  }

  return payload;
}

export function validateCredentialRequirements(
  provider: ProviderContract,
  values: DomainCreateForm,
  form: ReturnType<typeof useForm<DomainCreateForm>>,
) {
  const credentials = values.credentials;
  let isValid = true;

  for (const field of getCredentialFields(provider)) {
    if (!field.required || isCredentialFieldFilled(credentials, field.key)) {
      continue;
    }

    form.setError(`credentials.${field.key}` as const, {
      type: 'required',
      message: 'formErrors.required',
    });
    isValid = false;
  }

  for (const rule of provider.credential_rules ?? []) {
    if (isCredentialRuleSatisfied(rule, credentials)) continue;

    for (const fieldKey of getCredentialRuleFieldKeys(rule)) {
      form.setError(`credentials.${fieldKey}` as const, {
        type: 'required',
        message: rule.message || 'Required',
      });
    }
    isValid = false;
  }

  return isValid;
}

export function isCredentialFieldFilled(
  credentials: Partial<Record<string, string | undefined>>,
  fieldKey?: string,
) {
  if (!fieldKey) return false;
  return Boolean(credentials[fieldKey]?.trim());
}

export function isCredentialRuleSatisfied(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
  credentials: Partial<Record<string, string | undefined>>,
) {
  if (rule.type !== 'one_of') return true;

  return (rule.fields ?? []).some((fieldGroup) =>
    fieldGroup
      .split('+')
      .map((field) => field.trim())
      .filter(Boolean)
      .every((field) => isCredentialFieldFilled(credentials, field)),
  );
}

export function getCredentialRuleFieldKeys(
  rule: NonNullable<ProviderContract['credential_rules']>[number],
) {
  return (rule.fields ?? [])
    .flatMap((fieldGroup) => fieldGroup.split('+'))
    .map((field) => field.trim())
    .filter(Boolean);
}
