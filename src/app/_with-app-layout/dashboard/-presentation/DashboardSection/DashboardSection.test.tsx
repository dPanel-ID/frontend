// @vitest-environment jsdom

import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import DashboardSection from './DashboardSection';

const HELP_TEXT = 'How hard your servers are working.';

function renderWithHelp() {
  return render(
    <DashboardSection
      title="Resource usage"
      help={{ text: HELP_TEXT, label: 'About resource usage' }}
      action={<button type="button">24 hours</button>}
    >
      <p>charts</p>
    </DashboardSection>,
  );
}

describe('DashboardSection help', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('keeps the explanation off the card and behind a labelled button', () => {
    renderWithHelp();

    const button = screen.getByRole('button', { name: 'About resource usage' });
    expect(button.getAttribute('type')).toBe('button');
    expect(screen.queryByRole('tooltip')).toBeNull();
    // Screen readers still get the text, through the button's description.
    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy!)?.textContent).toBe(HELP_TEXT);
  });

  it('reveals the explanation on keyboard focus and hides it on Escape', () => {
    renderWithHelp();
    const button = screen.getByRole('button', { name: 'About resource usage' });

    act(() => {
      button.focus();
      vi.runAllTimers();
    });
    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.textContent).toBe(HELP_TEXT);
    expect(tooltip.className).toContain('opacity-100');

    act(() => {
      fireEvent.keyDown(button, { key: 'Escape' });
      vi.runAllTimers();
    });
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('reveals the explanation on hover', () => {
    renderWithHelp();
    const button = screen.getByRole('button', { name: 'About resource usage' });

    act(() => {
      fireEvent.mouseEnter(button);
      vi.runAllTimers();
    });
    expect(screen.getByRole('tooltip').textContent).toBe(HELP_TEXT);
  });

  it('opens on tap by focusing the button', () => {
    renderWithHelp();
    const button = screen.getByRole('button', { name: 'About resource usage' });

    act(() => {
      fireEvent.click(button);
      vi.runAllTimers();
    });
    expect(document.activeElement).toBe(button);
    expect(screen.getByRole('tooltip').textContent).toBe(HELP_TEXT);
  });

  it('shows a plain description when no help is given', () => {
    render(
      <DashboardSection title="Recent activity" description="Latest jobs.">
        <p>list</p>
      </DashboardSection>,
    );

    expect(screen.getByText('Latest jobs.')).toBeTruthy();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
