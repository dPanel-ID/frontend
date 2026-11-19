// @vitest-environment jsdom
import { useEffect } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { FormProvider, useForm } from '../../-model';

import SectionLogin from './SectionLogin';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
  useDevetekLocale: () => 'en',
}));

let api: ReturnType<typeof useForm> | undefined;

function Probe(props: {
  provider: string;
  onReady: (value: ReturnType<typeof useForm>) => void;
}) {
  const current = useForm();
  const { onReady, provider } = props;
  useEffect(() => {
    current.form.setValue('provider', provider);
    onReady(current);
  }, [current, onReady, provider]);
  return null;
}

function renderSection(provider: string) {
  return render(
    <FormProvider>
      <Probe
        provider={provider}
        onReady={(value) => {
          api = value;
        }}
      />
      <SectionLogin />
    </FormProvider>,
  );
}

afterEach(() => {
  cleanup();
  api = undefined;
});

describe('SectionLogin', () => {
  it.each(['idcloudhost', 'biznetgio'])(
    'generates a %s password that passes the form rule',
    async (provider) => {
      await act(async () => {
        renderSection(provider);
        await Promise.resolve();
      });
      const field = screen.getByPlaceholderText<HTMLInputElement>(
        'passwordPlaceholder',
      );
      expect(field.value).toBe('');
      expect(field.type).toBe('password');

      await act(async () => {
        fireEvent.click(
          screen.getByRole('button', { name: /generatePassword/ }),
        );
        await Promise.resolve();
      });

      const value = api?.form.getValues('login.password') ?? '';
      expect(value).toMatch(/^[a-km-zA-HJ-NP-Z2-9]{24}$/);
      expect(value).toMatch(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{8,}$/);
      // Shown once, with a copy button and the save-it-now note.
      expect(field.value).toBe(value);
      expect(field.type).toBe('text');
      expect(screen.getByRole('button', { name: 'copyPassword' })).toBeTruthy();
      expect(screen.getByRole('status').textContent).toContain(
        'generatedPasswordNote',
      );
      expect(api?.form.formState.errors.login?.password).toBeUndefined();
    },
  );

  it('asks DigitalOcean for no password', async () => {
    await act(async () => {
      renderSection('digitalocean');
      await Promise.resolve();
    });
    expect(screen.queryByPlaceholderText('passwordPlaceholder')).toBeNull();
    expect(
      screen.queryByRole('button', { name: /generatePassword/ }),
    ).toBeNull();
  });
});
