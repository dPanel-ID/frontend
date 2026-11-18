// @vitest-environment jsdom

import { useState } from 'react';

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PasswordInput } from './PasswordInput';

const NOTE = "Save this password now. dPanel doesn't show it again.";

function Harness(props: { generate?: () => string | undefined }) {
  const [value, setValue] = useState('');
  return (
    <PasswordInput
      aria-label="Password"
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onGenerate={
        props.generate
          ? () => {
              const next = props.generate?.();
              if (next) setValue(next);
              return next;
            }
          : undefined
      }
    />
  );
}

function field() {
  return screen.getByLabelText<HTMLInputElement>('Password');
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('PasswordInput', () => {
  it('has no Generate button unless asked', () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Generate' })).toBeNull();
    expect(field().type).toBe('password');
  });

  it('fills, reveals and offers to copy a generated password', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    render(<Harness generate={() => 'abcDEF234-_xyzabcDEF234x'} />);

    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(field().value).toBe('abcDEF234-_xyzabcDEF234x');
    expect(field().type).toBe('text');
    expect(screen.getByRole('status').textContent).toBe(NOTE);

    fireEvent.click(screen.getByRole('button', { name: 'Copy password' }));
    await act(() => Promise.resolve());
    expect(writeText).toHaveBeenCalledWith('abcDEF234-_xyzabcDEF234x');
    expect(screen.getByRole('button', { name: 'Copied' })).toBeTruthy();
  });

  it('drops the note and copy once the user types over it', () => {
    render(<Harness generate={() => 'abcDEF234-_xyzabcDEF234x'} />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    fireEvent.change(field(), { target: { value: 'my-own-password' } });

    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Copy password' })).toBeNull();
  });

  it('changes nothing when no password could be made', () => {
    render(<Harness generate={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));

    expect(field().value).toBe('');
    expect(field().type).toBe('password');
    expect(screen.queryByRole('status')).toBeNull();
  });
});
