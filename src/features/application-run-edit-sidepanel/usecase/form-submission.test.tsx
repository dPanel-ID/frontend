// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { SECRET_MASK } from '@/entities/application/lib/secret-mask';

import { EventsProvider } from '@/shared/libs/events';

import { ApplicationRunEditModelProvider } from '../model';
import type { ApplicationRunEditSidepanelProps } from '../rules/types';
import Actions from '../view/Actions';
import Forms from '../view/Forms';

import useFormSubmissionUsecase from './form-submission';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));

const { update, reveal, toaster } = vi.hoisted(() => ({
  update: vi.fn(),
  reveal: vi.fn(),
  toaster: vi.fn(),
}));
vi.mock('@/services/toaster', () => ({ useToaster: () => [toaster] }));
vi.mock('@/shared/api', () => ({
  ApiApplication: {
    Update: { $Id: { doPost: update } },
    EnvironmentReveal: { $Id: { doPost: reveal } },
  },
}));

function Controller() {
  useFormSubmissionUsecase();
  return null;
}

const props: ApplicationRunEditSidepanelProps = {
  applicationId: '7',
  applicationName: 'shop',
  rawAppDefinition: { run: { command: 'npm start' } },
  command: 'npm start',
  envs: [
    { key: 'DB_PASSWORD', value: SECRET_MASK },
    { key: 'APP_KEY', value: SECRET_MASK },
    { key: 'OLD', value: SECRET_MASK },
  ],
};

function renderPanel() {
  return render(
    <EventsProvider>
      <ApplicationRunEditModelProvider {...props}>
        <Controller />
        <Forms />
        <Actions />
      </ApplicationRunEditModelProvider>
    </EventsProvider>,
  );
}

function textBox() {
  return screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: 'Environment Variables',
  });
}

function saveButton() {
  return screen.getByRole<HTMLButtonElement>('button', {
    name: 'common.actions.save',
  });
}

async function save() {
  await act(async () => {
    fireEvent.click(saveButton());
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

function savedEnvironment() {
  return update.mock.calls[0]?.[0].payload.app_definition.run.environment;
}

beforeEach(() => {
  update.mockResolvedValue({ $status: 'success' });
  reveal.mockResolvedValue({
    $status: 'success',
    build: [],
    run: [
      { key: 'DB_PASSWORD', value: 'db-secret' },
      { key: 'APP_KEY', value: 'base64:key' },
      { key: 'OLD', value: 'old-value' },
    ],
  });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Runtime configuration, text mode', () => {
  it('shows masked lines and saves adds, updates, deletes and kept values', async () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'modeText' }));
    expect(textBox().value).toBe(
      [
        `DB_PASSWORD="${SECRET_MASK}"`,
        `APP_KEY="${SECRET_MASK}"`,
        `OLD="${SECRET_MASK}"`,
      ].join('\n'),
    );

    fireEvent.change(textBox(), {
      target: {
        value: [
          `DB_PASSWORD="${SECRET_MASK}"`,
          'APP_KEY="new-key"',
          '# OLD is removed',
          'export NEW_ONE=added # comment',
        ].join('\n'),
      },
    });
    await save();

    expect(update).toHaveBeenCalledTimes(1);
    expect(savedEnvironment()).toEqual([
      // Left masked: the API keeps the stored value.
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'APP_KEY', value: 'new-key' },
      { key: 'NEW_ONE', value: 'added' },
    ]);
  });

  it('keeps Save disabled while a line is wrong', () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'modeText' }));
    fireEvent.change(textBox(), {
      target: { value: `DB_PASSWORD="${SECRET_MASK}"\nAPP_KEY new` },
    });
    expect(saveButton().disabled).toBe(true);
    expect(document.body.textContent).toContain('missingEquals {"line":2');

    fireEvent.change(textBox(), {
      target: { value: `DB_PASSWORD="${SECRET_MASK}"\nAPP_KEY=new` },
    });
    expect(saveButton().disabled).toBe(false);
  });

  it('shows the real values in text and hides unchanged ones again', async () => {
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'modeText' }));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'reveal' }));
      await Promise.resolve();
    });
    expect(textBox().value).toBe(
      'DB_PASSWORD="db-secret"\nAPP_KEY="base64:key"\nOLD="old-value"',
    );

    fireEvent.change(textBox(), {
      target: {
        value: 'DB_PASSWORD="db-secret"\nAPP_KEY="typed"\nOLD="old-value"',
      },
    });
    fireEvent.click(screen.getByRole('button', { name: 'hide' }));
    expect(textBox().value).toBe(
      `DB_PASSWORD="${SECRET_MASK}"\nAPP_KEY="typed"\nOLD="${SECRET_MASK}"`,
    );

    await save();
    expect(savedEnvironment()).toEqual([
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'APP_KEY', value: 'typed' },
      { key: 'OLD', value: SECRET_MASK },
    ]);
  });

  it('saves the same payload after editing in rows and switching modes', async () => {
    renderPanel();
    fireEvent.change(
      screen.getByRole('textbox', { name: 'rowValue {"index":2}' }),
      { target: { value: 'from-row' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'modeText' }));
    fireEvent.click(screen.getByRole('button', { name: 'modeRows' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'rowRemove {"index":3}' }),
    );
    await save();
    expect(savedEnvironment()).toEqual([
      { key: 'DB_PASSWORD', value: SECRET_MASK },
      { key: 'APP_KEY', value: 'from-row' },
    ]);
  });
});
