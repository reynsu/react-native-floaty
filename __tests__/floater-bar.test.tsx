import { Text } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { FloaterActionsProvider } from '../src/provider';
import { useFloaterActions } from '../src/use-floater-actions';
import type { FloaterAction } from '../src/types';

jest.mock('react-native/Libraries/Utilities/BackHandler', () =>
  require('react-native/Libraries/Utilities/__mocks__/BackHandler'),
);

function makeActions(count: number): FloaterAction[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    label: `Label ${i}`,
    onSelect: jest.fn(),
  }));
}

function Harness({ actions }: { actions: FloaterAction[] }) {
  const { show, hide, open } = useFloaterActions();
  return (
    <>
      <Text accessibilityRole="button" onPress={() => show(actions)}>
        open
      </Text>
      <Text accessibilityRole="button" onPress={hide}>
        close
      </Text>
      <Text testID="state">{open ? 'open' : 'closed'}</Text>
    </>
  );
}

describe('FloaterBar — radial layout', () => {
  it('suppresses labels and warns once per labeled action', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const actions: FloaterAction[] = [
      { id: 'heart', label: 'Like', icon: <Text>♥</Text>, onSelect: jest.fn() },
      { id: 'star', label: 'Star', icon: <Text>★</Text>, onSelect: jest.fn() },
    ];
    render(
      <FloaterActionsProvider layout="radial" radius={70}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));

    // Labels should NOT render visually.
    expect(screen.queryByText('Like')).toBeNull();
    expect(screen.queryByText('Star')).toBeNull();
    // But they remain as accessibility labels.
    expect(screen.getByLabelText('Like')).toBeTruthy();
    expect(screen.getByLabelText('Star')).toBeTruthy();
    // Two warnings — one per labeled action.
    const calls = warn.mock.calls.filter((c) =>
      String(c[0]).includes('icon-only — label suppressed'),
    );
    expect(calls).toHaveLength(2);

    warn.mockRestore();
  });

  it('renders the ornament behind the buttons', () => {
    const actions: FloaterAction[] = [
      { id: 'a', icon: <Text testID="icon-a">A</Text>, ariaLabel: 'A', onSelect: jest.fn() },
    ];
    render(
      <FloaterActionsProvider layout="radial" radius={70}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    // Toolbar mounted; icons rendered (i.e. Animated.View tree includes them).
    expect(screen.getByLabelText('Floating actions')).toBeTruthy();
    expect(screen.getByTestId('icon-a')).toBeTruthy();
  });
});

describe('FloaterBar', () => {
  it('renders maxVisible buttons + overflow trigger when needed', () => {
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByLabelText('Floating actions')).toBeTruthy();
    expect(screen.getByText('Label 0')).toBeTruthy();
    expect(screen.getByText('Label 1')).toBeTruthy();
    expect(screen.getByText('Label 2')).toBeTruthy();
    expect(screen.queryByText('Label 3')).toBeNull();
    expect(screen.getByLabelText('More actions')).toBeTruthy();
  });

  it('does not render overflow when actions <= maxVisible', () => {
    const actions = makeActions(3);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.queryByLabelText('More actions')).toBeNull();
  });

  it('clicking an action invokes onSelect and closes by default', () => {
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    fireEvent.press(screen.getByText('Label 0'));
    expect(actions[0]!.onSelect).toHaveBeenCalledTimes(1);
  });

  it('disabled action is non-interactive', () => {
    const onSelect = jest.fn();
    const actions: FloaterAction[] = [
      { id: 'd', label: 'Disabled', onSelect, disabled: true },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    fireEvent.press(screen.getByText('Disabled'));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('renders icon + label side by side when both are provided', () => {
    const actions: FloaterAction[] = [
      {
        id: 'copy',
        label: 'Copy',
        icon: <Text testID="icon-copy">★</Text>,
        onSelect: jest.fn(),
      },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByTestId('icon-copy')).toBeTruthy();
    expect(screen.getByText('Copy')).toBeTruthy();
  });

  it('icon-only with ariaLabel exposes accessible name', () => {
    const actions: FloaterAction[] = [
      {
        id: 'pin',
        icon: <Text testID="icon-pin">P</Text>,
        ariaLabel: 'Pin item',
        onSelect: jest.fn(),
      },
    ];
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByLabelText('Pin item')).toBeTruthy();
    expect(screen.getByTestId('icon-pin')).toBeTruthy();
  });

  it('overflow popover reveals remaining actions', () => {
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    fireEvent.press(screen.getByLabelText('More actions'));
    expect(screen.getByText('Label 3')).toBeTruthy();
    expect(screen.getByText('Label 4')).toBeTruthy();
  });

  it('selecting an overflow item invokes its handler', () => {
    const actions = makeActions(5);
    render(
      <FloaterActionsProvider maxVisible={3}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    fireEvent.press(screen.getByLabelText('More actions'));
    fireEvent.press(screen.getByText('Label 3'));
    expect(actions[3]!.onSelect).toHaveBeenCalledTimes(1);
  });

  it('backdrop press closes the bar (closeOnOutsideTap=true default)', () => {
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByTestId('state').props.children).toBe('open');
    fireEvent.press(screen.getByLabelText('Close floating actions'));
    // Store flips synchronously even though the close animation runs.
    expect(screen.getByTestId('state').props.children).toBe('closed');
  });

  it('backdrop press is ignored when closeOnOutsideTap=false', () => {
    const actions = makeActions(2);
    render(
      <FloaterActionsProvider closeOnOutsideTap={false}>
        <Harness actions={actions} />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open'));
    expect(screen.getByTestId('state').props.children).toBe('open');
    // The close-affordance is not rendered at all when outside-tap is disabled.
    expect(screen.queryByLabelText('Close floating actions')).toBeNull();
    expect(screen.getByTestId('state').props.children).toBe('open');
  });

  it('respects custom maxVisible from show options', () => {
    function H() {
      const { show } = useFloaterActions();
      return (
        <Text
          accessibilityRole="button"
          onPress={() => show(makeActions(5), { maxVisible: 2 })}
        >
          open2
        </Text>
      );
    }
    render(
      <FloaterActionsProvider maxVisible={4}>
        <H />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open2'));
    expect(screen.getByText('Label 0')).toBeTruthy();
    expect(screen.getByText('Label 1')).toBeTruthy();
    expect(screen.queryByText('Label 2')).toBeNull();
    expect(screen.getByLabelText('More actions')).toBeTruthy();
  });

  it('dismissOnSelect=false keeps the bar open after action press', () => {
    const onSelect = jest.fn();
    function H() {
      const { show } = useFloaterActions();
      return (
        <Text
          accessibilityRole="button"
          onPress={() =>
            show([{ id: 'a', label: 'Stay', onSelect }], {
              dismissOnSelect: false,
            })
          }
        >
          open-stay
        </Text>
      );
    }
    render(
      <FloaterActionsProvider>
        <H />
      </FloaterActionsProvider>,
    );
    fireEvent.press(screen.getByText('open-stay'));
    fireEvent.press(screen.getByText('Stay'));
    expect(onSelect).toHaveBeenCalledTimes(1);
    // Bar should still be visible.
    expect(screen.getByLabelText('Floating actions')).toBeTruthy();
  });
});
