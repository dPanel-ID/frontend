// @vitest-environment jsdom

import { useEffect } from 'react';

import {
  cleanup,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EventsProvider } from '@/shared/libs/events';

import type { DialogPayload } from '../rules/types';
import { useDialog } from '../usecase';

import DialogController from './DialogController';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations: () => (key: string) => key,
  useDevetekLocale: () => 'en',
}));

function Opener({ payload }: { payload: DialogPayload }) {
  const [openDialog] = useDialog();
  useEffect(() => {
    openDialog(payload);
  }, [openDialog, payload]);
  return null;
}

function renderDialog(payload: DialogPayload) {
  render(
    <EventsProvider>
      <DialogController />
      <Opener payload={payload} />
    </EventsProvider>,
  );
  return screen.getByRole('dialog');
}

afterEach(cleanup);

describe('DialogController actions', () => {
  it('keeps three actions inside the dialog, primary first, wrapping the row', () => {
    const dialog = renderDialog({
      title: 'Move to the new runtime?',
      content: 'body',
      variant: 'info',
      actions: [
        { label: 'Move to the new runtime', isPrimary: true },
        { label: 'Move back to the previous runtime' },
        { label: 'Cancel' },
      ],
    });

    const row = screen.getByTestId('dialog-actions');
    expect(dialog.contains(row)).toBe(true);
    const labels = Array.from(row.querySelectorAll('button')).map(
      (b) => b.textContent,
    );
    expect(labels).toEqual([
      'Move to the new runtime',
      'Move back to the previous runtime',
      'Cancel',
    ]);
    expect(row.className).toContain('flex-col');
    expect(row.className).toContain('sm:flex-wrap');
    expect(row.className).toContain('min-w-0');
  });

  it('keeps two-action dialogs on a single centered row', () => {
    renderDialog({
      title: 'Sure?',
      content: 'body',
      variant: 'warning',
      actions: { variant: 'OkCancel', ok: () => {} },
    });

    const row = screen.getByTestId('dialog-actions');
    expect(row.querySelectorAll('button')).toHaveLength(2);
    expect(row.className).not.toContain('flex-col');
    expect(row.className).not.toContain('flex-wrap');
  });
});
