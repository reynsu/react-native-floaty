import { Text } from 'react-native';
import { render, fireEvent, screen, act } from '@testing-library/react-native';
import { FloaterActionsProvider } from '../src/provider';
import { useFloaterActions } from '../src/use-floater-actions';
import type { FloaterAction } from '../src/types';

function Harness({ actions }: { actions: FloaterAction[] }) {
  const { show, hide, toggle, open } = useFloaterActions();
  return (
    <>
      <Text accessibilityRole="button" onPress={() => show(actions)}>
        open
      </Text>
      <Text accessibilityRole="button" onPress={hide}>
        close
      </Text>
      <Text accessibilityRole="button" onPress={() => toggle(actions)}>
        toggle
      </Text>
      <Text testID="state">{open ? 'open' : 'closed'}</Text>
    </>
  );
}

describe('useFloaterActions', () => {
  it('throws helpful error when used outside provider', () => {
    const original = console.error;
    console.error = jest.fn();
    function Bad() {
      useFloaterActions();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(
      /useFloaterActions must be used inside <FloaterActionsProvider>/,
    );
    console.error = original;
  });

  it('show() opens the bar with provided actions', () => {
    render(
      <FloaterActionsProvider>
        <Harness actions={[{ id: 'a', label: 'A', onSelect: jest.fn() }]} />
      </FloaterActionsProvider>,
    );
    expect(screen.getByTestId('state').props.children).toBe('closed');
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByTestId('state').props.children).toBe('open');
  });

  it('hide() closes the bar', () => {
    render(
      <FloaterActionsProvider>
        <Harness actions={[{ id: 'a', label: 'A', onSelect: jest.fn() }]} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    fireEvent.press(screen.getByText('close'));
    expect(screen.getByTestId('state').props.children).toBe('closed');
  });

  it('toggle() flips open state', () => {
    render(
      <FloaterActionsProvider>
        <Harness actions={[{ id: 'a', label: 'A', onSelect: jest.fn() }]} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('toggle'));
    expect(screen.getByTestId('state').props.children).toBe('open');
    fireEvent.press(screen.getByText('toggle'));
    expect(screen.getByTestId('state').props.children).toBe('closed');
  });

  it('show() with empty array warns and does not open', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <FloaterActionsProvider>
        <Harness actions={[]} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('empty actions array'),
    );
    expect(screen.getByTestId('state').props.children).toBe('closed');
    warn.mockRestore();
  });

  it('warns when icon-only action lacks ariaLabel', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const actions: FloaterAction[] = [
      { id: 'mute', icon: <Text>X</Text>, onSelect: jest.fn() },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    act(() => {
      fireEvent.press(screen.getByText('open'));
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('icon-only — provide ariaLabel'),
    );
    warn.mockRestore();
  });

  it('warns when action has neither label nor icon', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const actions: FloaterAction[] = [{ id: 'empty', onSelect: jest.fn() }];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('neither label nor icon'),
    );
    warn.mockRestore();
  });
});
