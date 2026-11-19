// @vitest-environment jsdom

import {
  cleanup,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { ProviderContract } from '@/shared/api/domain.providers';

import type { DomainCreateForm } from '../-rules/form';

import { CredentialSection } from './SectionCredentials';
import { DomainIdentitySection } from './SectionDomain';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
}));

const provider = {
  provider: 'cloudflare',
  label: 'Cloudflare',
  credential_fields: [
    { key: 'token', label: 'API token', secret: true, required: true },
    { key: 'account', label: 'Account ID', type: 'text' },
  ],
} as unknown as ProviderContract;

function Harness() {
  const form = useForm<DomainCreateForm>({
    defaultValues: {
      domain: '',
      provider: 'cloudflare',
      credentials: {},
    },
  });

  // Both steps live in one form on the page, which is what made Chrome take
  // the domain and the token for a login.
  return (
    <form>
      <DomainIdentitySection form={form} isSubmitting={false} />
      <CredentialSection form={form} isSubmitting={false} provider={provider} />
    </form>
  );
}

afterEach(cleanup);

describe('domain create form autofill', () => {
  // Chrome filled a saved login: "dpanel01" in Domain and a saved password
  // in the API token, and the review said one credential was provided.
  it('marks the API token as a new secret, never a saved password', () => {
    render(<Harness />);

    const token = document.getElementById(
      'domain-create-credential-token',
    ) as HTMLInputElement;
    expect(token.type).toBe('password');
    expect(token.getAttribute('autocomplete')).toBe('new-password');
    expect(token.getAttribute('data-1p-ignore')).toBe('true');
    expect(token.getAttribute('data-lpignore')).toBe('true');
    // The field name is the provider's key, not a login name.
    expect(token.name).toBe('credentials.token');
  });

  it('keeps the domain and plain credential fields out of autofill', () => {
    render(<Harness />);

    const domain = screen.getByPlaceholderText(
      'page.domainCreate.fields.domain.placeholder',
    );
    expect(domain.getAttribute('autocomplete')).toBe('off');
    expect(domain.getAttribute('data-1p-ignore')).toBe('true');

    const account = document.getElementById(
      'domain-create-credential-account',
    ) as HTMLInputElement;
    expect(account.type).toBe('text');
    expect(account.getAttribute('autocomplete')).toBe('off');
    expect(account.getAttribute('data-lpignore')).toBe('true');
  });
});
