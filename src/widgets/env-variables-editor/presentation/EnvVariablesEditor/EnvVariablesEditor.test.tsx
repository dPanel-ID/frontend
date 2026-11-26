// @vitest-environment jsdom
import { useState } from 'react';

import {
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react/dist/@testing-library/react.pure.esm.js';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { parseEnvText } from '@/entities/application/lib/env-text';

import type { EnvEditorMode } from '.';
import EnvVariablesEditor from '.';

vi.mock('@/services/i18n', () => ({
  useDevetekTranslations:
    () => (key: string, values?: Record<string, unknown>) =>
      values ? `${key} ${JSON.stringify(values)}` : key,
}));

let latestText = '';

function Harness(props: {
  initial: string;
  defaultMode?: EnvEditorMode;
  external?: string;
}) {
  const [text, setText] = useState(props.initial);
  return (
    <>
      <EnvVariablesEditor
        label="Runtime variables"
        text={text}
        onTextChange={(next) => {
          latestText = next;
          setText(next);
        }}
        defaultMode={props.defaultMode}
      />
      {props.external !== undefined && (
        <button type="button" onClick={() => setText(props.external!)}>
          external
        </button>
      )}
    </>
  );
}

function textBox() {
  return screen.getByRole<HTMLTextAreaElement>('textbox', {
    name: 'Runtime variables',
  });
}

function modeButton(name: 'modeRows' | 'modeText') {
  return screen.getByRole<HTMLButtonElement>('button', { name });
}

function input(name: string) {
  return screen.getByRole<HTMLInputElement>('textbox', { name });
}

afterEach(() => {
  cleanup();
  latestText = '';
});

describe('EnvVariablesEditor', () => {
  it('keeps edits when switching between rows and text', () => {
    render(<Harness initial={'A="1"\nB="2"'} />);

    expect(modeButton('modeRows').getAttribute('aria-pressed')).toBe('true');
    fireEvent.change(input('rowValue {"index":2}'), {
      target: { value: 'two "quoted"' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'add' }));
    fireEvent.change(input('rowKey {"index":3}'), {
      target: { value: 'NEW-KEY' },
    });
    // Characters a name cannot hold are dropped as they are typed.
    expect(input('rowKey {"index":3}').value).toBe('NEWKEY');
    fireEvent.change(input('rowValue {"index":3}'), {
      target: { value: 'x' },
    });

    fireEvent.click(modeButton('modeText'));
    expect(textBox().value).toBe('A="1"\nB="two \\"quoted\\""\nNEWKEY="x"');

    // In text: change a line, delete a line, add a line.
    fireEvent.change(textBox(), {
      target: { value: 'A="one"\nNEWKEY=x\nexport C=3 # added' },
    });
    fireEvent.click(modeButton('modeRows'));

    expect(input('rowKey {"index":1}').value).toBe('A');
    expect(input('rowValue {"index":1}').value).toBe('one');
    expect(input('rowKey {"index":2}').value).toBe('NEWKEY');
    expect(input('rowKey {"index":3}').value).toBe('C');
    expect(input('rowValue {"index":3}').value).toBe('3');
    expect(screen.queryByRole('textbox', { name: 'rowKey {"index":4}' })).toBe(
      null,
    );
    expect(parseEnvText(latestText).variables).toEqual([
      { key: 'A', value: 'one' },
      { key: 'NEWKEY', value: 'x' },
      { key: 'C', value: '3' },
    ]);
  });

  it('removing a row removes its variable', () => {
    render(<Harness initial={'A="1"\nB="2"'} />);
    fireEvent.click(
      screen.getByRole('button', { name: 'rowRemove {"index":1}' }),
    );
    expect(parseEnvText(latestText).variables).toEqual([
      { key: 'B', value: '2' },
    ]);
  });

  it('lists text errors by line and keeps rows closed until fixed', () => {
    render(<Harness initial={'A=1\nB 2\nA=3'} defaultMode="text" />);

    expect(textBox().getAttribute('aria-invalid')).toBe('true');
    const text = document.body.textContent;
    expect(text).toContain('missingEquals {"line":2');
    expect(text).toContain('duplicateKey {"line":3,"first":1,"key":"A"}');
    expect(text).toContain('errorCount {"count":2}');
    expect(modeButton('modeRows').disabled).toBe(true);

    fireEvent.change(textBox(), { target: { value: 'A=1\nB=2' } });
    expect(textBox().getAttribute('aria-invalid')).toBeNull();
    expect(modeButton('modeRows').disabled).toBe(false);
  });

  it('marks the line numbers of bad lines', () => {
    render(<Harness initial={'A=1\noops'} defaultMode="text" />);
    const numbers = Array.from(
      document.querySelectorAll('[aria-hidden="true"] div div'),
    );
    expect(numbers.map((node) => node.textContent)).toEqual(['1', '2']);
    expect(numbers[0]!.className).not.toContain('text-destructive');
    expect(numbers[1]!.className).toContain('text-destructive');
  });

  it('shows row errors for a missing, invalid or repeated name', () => {
    render(<Harness initial={'A="1"\n="x"\n1A="2"\nA="3"'} />);
    const text = document.body.textContent;
    expect(text).toContain('rowMissingKey');
    expect(text).toContain('rowInvalidKey');
    expect(text).toContain('rowDuplicateKey {"line":4,"first":1,"key":"A"}');
  });

  it('does not flag a row just added', () => {
    render(<Harness initial="" />);
    fireEvent.click(screen.getByRole('button', { name: 'add' }));
    expect(input('rowKey {"index":1}').getAttribute('aria-invalid')).toBe(null);
    expect(parseEnvText(latestText).errors).toEqual([]);
    expect(parseEnvText(latestText).variables).toEqual([]);
  });

  it('rebuilds the rows when the text changes outside (values shown)', () => {
    render(
      <Harness initial={'TOKEN="••••••••"'} external={'TOKEN="s3cret"'} />,
    );
    expect(input('rowValue {"index":1}').value).toBe('••••••••');
    fireEvent.click(screen.getByRole('button', { name: 'external' }));
    expect(input('rowValue {"index":1}').value).toBe('s3cret');
  });

  it('stays quick with hundreds of variables', () => {
    const many = Array.from(
      { length: 500 },
      (_, index) => `KEY_${index}="value ${index}"`,
    ).join('\n');
    render(<Harness initial={many} defaultMode="text" />);
    const started = performance.now();
    for (let round = 0; round < 20; round += 1) {
      fireEvent.change(textBox(), { target: { value: `${many}\nX=${round}` } });
    }
    expect(performance.now() - started).toBeLessThan(5000);
    fireEvent.click(modeButton('modeRows'));
    expect(input('rowKey {"index":500}').value).toBe('KEY_499');
    expect(input('rowKey {"index":501}').value).toBe('X');
  });
});
