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

import { ApplicationBuildEditModelProvider } from '../model';
import Actions from '../view/Actions';
import Forms from '../view/Forms';

import useFormSubmissionUsecase from './form-submission';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));

const { update } = vi.hoisted(() => ({ update: vi.fn() }));
vi.mock('@/services/toaster', () => ({ useToaster: () => [vi.fn()] }));
vi.mock('@/shared/api', () => ({
  ApiApplication: { Update: { $Id: { doPost: update } } },
}));

function Controller() {
  useFormSubmissionUsecase();
  return null;
}

beforeEach(() => {
  update.mockResolvedValue({ $status: 'success' });
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe('Build configuration, text mode', () => {
  it('saves the build variables written as text', async () => {
    render(
      <EventsProvider>
        <ApplicationBuildEditModelProvider
          applicationId="3"
          applicationName="site"
          rawAppDefinition={{}}
          steps={[{ name: 'Build', command: ['npm ci'] }]}
          envs={[
            { key: 'NODE_ENV', value: SECRET_MASK },
            { key: 'CI', value: SECRET_MASK },
          ]}
        >
          <Controller />
          <Forms />
          <Actions />
        </ApplicationBuildEditModelProvider>
      </EventsProvider>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'modeText' }));
    const box = screen.getByRole<HTMLTextAreaElement>('textbox', {
      name: 'Environment Variables',
    });
    expect(box.value).toBe(`NODE_ENV="${SECRET_MASK}"\nCI="${SECRET_MASK}"`);

    fireEvent.change(box, {
      target: { value: `NODE_ENV="${SECRET_MASK}"\nAPI_URL='https://x/#a'` },
    });
    await act(async () => {
      fireEvent.click(
        screen.getByRole('button', { name: 'common.actions.save' }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(
      update.mock.calls[0]?.[0].payload.app_definition.build.target.machine
        .environment,
    ).toEqual([
      { key: 'NODE_ENV', value: SECRET_MASK },
      { key: 'API_URL', value: 'https://x/#a' },
    ]);
  });
});
