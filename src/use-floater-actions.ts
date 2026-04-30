import { useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { FloaterContext, type FloaterContextValue } from './context';
import type { FloaterAction, FloaterApi, FloaterState, ShowOptions } from './types';
import { warnDev } from './warn';

function useCtx(): FloaterContextValue {
  const ctx = useContext(FloaterContext);
  if (!ctx) {
    throw new Error(
      '[floaty] useFloaterActions must be used inside <FloaterActionsProvider>',
    );
  }
  return ctx;
}

/**
 * Stable imperative API — `show`, `hide`, `toggle`. Does NOT subscribe to
 * store updates, so consumers calling these methods never re-render when
 * `open`/`actions`/`options` change.
 *
 * Use this in components that only TRIGGER the bar (most call sites).
 */
export function useFloaterApi(): Pick<FloaterApi, 'show' | 'hide' | 'toggle'> {
  const { store } = useCtx();

  const show = useCallback(
    (actions: FloaterAction[], options?: ShowOptions) => {
      if (!Array.isArray(actions) || actions.length === 0) {
        warnDev('show() called with empty actions array — ignoring');
        return;
      }
      for (const a of actions) {
        const hasLabel = Boolean(a.label);
        const hasIcon = a.icon != null;
        if (!hasLabel && !hasIcon) {
          warnDev(
            `action "${a.id}" has neither label nor icon — it will render empty`,
          );
        } else if (!hasLabel && !a.ariaLabel) {
          warnDev(
            `action "${a.id}" is icon-only — provide ariaLabel for accessibility`,
          );
        }
      }
      store.setState({ open: true, actions, options: options ?? {} });
    },
    [store],
  );

  const hide = useCallback(() => {
    store.setState({ open: false });
  }, [store]);

  const toggle = useCallback(
    (actions?: FloaterAction[]) => {
      const current = store.getState();
      if (current.open) {
        store.setState({ open: false });
        return;
      }
      const nextActions = actions ?? current.actions;
      if (nextActions.length === 0) {
        warnDev('toggle() called with no actions and store is empty — ignoring');
        return;
      }
      store.setState({ open: true, actions: nextActions });
    },
    [store],
  );

  return useMemo(() => ({ show, hide, toggle }), [show, hide, toggle]);
}

/**
 * Subscribes to the boolean `open` flag only. Re-renders just when the bar
 * opens or closes, never when `actions`/`options` mutate.
 */
export function useFloaterOpen(): boolean {
  const { store } = useCtx();
  return useSyncExternalStore(
    store.subscribe,
    () => store.getState().open,
    () => store.getServerState().open,
  );
}

/**
 * Subscribes to the full state. Used internally by `<FloaterBar>`; rarely
 * needed by consumers — prefer `useFloaterApi()` + `useFloaterOpen()`.
 */
export function useFloaterState(): FloaterState {
  const { store } = useCtx();
  return useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getServerState,
  );
}

/**
 * Convenience hook returning the full API + state (back-compat with v0.1.0).
 *
 * **Performance note:** consumers re-render on every state change. For new
 * code, prefer `useFloaterApi()` (stable methods, no subscription) and read
 * state via `useFloaterOpen()` only when needed.
 */
export function useFloaterActions(): FloaterApi {
  const state = useFloaterState();
  const api = useFloaterApi();
  return useMemo(() => ({ ...state, ...api }), [state, api]);
}
