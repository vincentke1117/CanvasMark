import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useRovingFocus } from '../hooks/useRovingFocus';

const TestToolbar = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useRovingFocus(containerRef, { orientation: 'horizontal' });

  return (
    <div ref={containerRef}>
      <button type="button" data-roving-item>
        One
      </button>
      <button type="button" data-roving-item>
        Two
      </button>
      <button type="button" data-roving-item disabled>
        Disabled
      </button>
      <button type="button" data-roving-item>
        Three
      </button>
    </div>
  );
};

describe('useRovingFocus', () => {
  it('initialises tab order with the first focusable item active', async () => {
    render(<TestToolbar />);
    const first = screen.getByText('One');
    const second = screen.getByText('Two');
    const third = screen.getByText('Three');

    await waitFor(() => {
      expect(first.tabIndex).toBe(0);
      expect(second.tabIndex).toBe(-1);
      expect(third.tabIndex).toBe(-1);
    });
  });

  it('moves focus with arrow keys and skips disabled items', async () => {
    const user = userEvent.setup();
    render(<TestToolbar />);

    const first = screen.getByText('One');
    const second = screen.getByText('Two');
    const third = screen.getByText('Three');

    first.focus();
    await waitFor(() => expect(first.tabIndex).toBe(0));

    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(second).toHaveFocus());

    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(third).toHaveFocus());

    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(first).toHaveFocus());
  });

  it('supports Home and End keys to jump within the group', async () => {
    const user = userEvent.setup();
    render(<TestToolbar />);

    const first = screen.getByText('One');
    const third = screen.getByText('Three');

    first.focus();
    await waitFor(() => expect(first.tabIndex).toBe(0));

    await user.keyboard('{End}');
    await waitFor(() => expect(third).toHaveFocus());

    await user.keyboard('{Home}');
    await waitFor(() => expect(first).toHaveFocus());
  });
});
