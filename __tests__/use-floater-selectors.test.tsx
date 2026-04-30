/**
 * Tests for the narrowed selector hooks: `useFloaterApi`, `useFloaterOpen`.
 * The key claim is that `useFloaterApi` does NOT subscribe to state changes,
 * so consumers don't re-render when actions/options/open mutate.
 */
import { useRef } from 'react';
import { Text } from 'react-native';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { FloaterActionsProvider } from '../src/provider';
import {
  useFloaterApi,
  useFloaterOpen,
} from '../src/use-floater-actions';
import type { FloaterAction } from '../src/types';

function ApiOnly({ onRender }: { onRender: () => void }) {
  const renderCount = useRef(0);
  renderCount.current += 1;
  onRender();
  const { show, hide } = useFloaterApi();
  return (
    <>
      <Text testID="api-renders">{renderCount.current}</Text>
      <Text accessibilityRole="button" onPress={() => show([{ id: 'x', label: 'X', onSelect: () => {} }])}>
        api-show
      </Text>
      <Text accessibilityRole="button" onPress={hide}>
        api-hide
      </Text>
    </>
  );
}

function OpenWatcher() {
  const open = useFloaterOpen();
  return <Text testID="open-flag">{open ? 'yes' : 'no'}</Text>;
}

describe('useFloaterApi', () => {
  it('returns stable methods, does not re-render on state changes', () => {
    const renderCounter = jest.fn();
    render(
      <FloaterActionsProvider>
        <ApiOnly onRender={renderCounter} />
        <OpenWatcher />
      </FloaterActionsProvider>,
    );

    const initialRenders = renderCounter.mock.calls.length;
    // Sanity: open watcher reflects initial state.
    expect(screen.getByTestId('open-flag').props.children).toBe('no');

    // Trigger many state changes.
    fireEvent.press(screen.getByText('api-show'));
    fireEvent.press(screen.getByText('api-hide'));
    fireEvent.press(screen.getByText('api-show'));
    fireEvent.press(screen.getByText('api-hide'));

    // The OpenWatcher DID re-render (it observes `open`).
    expect(screen.getByTestId('open-flag').props.children).toBe('no');

    // The ApiOnly component should NOT have re-rendered for any of those —
    // it only consumes useFloaterApi which has no subscription.
    expect(renderCounter.mock.calls.length).toBe(initialRenders);
  });

  it('throws outside provider', () => {
    const original = console.error;
    console.error = jest.fn();
    function Bad() {
      useFloaterApi();
      return null;
    }
    expect(() => render(<Bad />)).toThrow(/must be used inside/);
    console.error = original;
  });
});

describe('useFloaterOpen', () => {
  it('updates when bar opens and closes', () => {
    function Trigger() {
      const { show, hide } = useFloaterApi();
      const actions: FloaterAction[] = [{ id: 'a', label: 'A', onSelect: () => {} }];
      return (
        <>
          <Text accessibilityRole="button" onPress={() => show(actions)}>
            o
          </Text>
          <Text accessibilityRole="button" onPress={hide}>
            c
          </Text>
        </>
      );
    }
    render(
      <FloaterActionsProvider>
        <Trigger />
        <OpenWatcher />
      </FloaterActionsProvider>,
    );
    expect(screen.getByTestId('open-flag').props.children).toBe('no');
    fireEvent.press(screen.getByText('o'));
    expect(screen.getByTestId('open-flag').props.children).toBe('yes');
    fireEvent.press(screen.getByText('c'));
    expect(screen.getByTestId('open-flag').props.children).toBe('no');
  });
});
