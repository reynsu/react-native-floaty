import { useMemo, useRef } from 'react';
import { FloaterContext, type FloaterContextValue } from './context';
import { createStore, type Store } from './store';
import { FloaterBar } from './floater-bar';
import { mergeTheme } from './theme';
import type { FloaterActionsProviderProps } from './types';

export function FloaterActionsProvider({
  children,
  maxVisible = 3,
  closeOnOutsideTap = true,
  closeOnBackPress = true,
  theme,
  layout = 'row',
  position = 'bottom',
  radius,
}: FloaterActionsProviderProps) {
  const storeRef = useRef<Store | null>(null);
  if (storeRef.current === null) storeRef.current = createStore();

  const merged = useMemo(() => mergeTheme(theme), [theme]);
  const computedRadius = radius ?? merged.actionH * 1.6;

  const value = useMemo<FloaterContextValue>(
    () => ({
      store: storeRef.current!,
      config: {
        maxVisible,
        closeOnOutsideTap,
        closeOnBackPress,
        theme: merged,
        layout,
        position,
        radius: computedRadius,
      },
    }),
    [
      maxVisible,
      closeOnOutsideTap,
      closeOnBackPress,
      merged,
      layout,
      position,
      computedRadius,
    ],
  );

  return (
    <FloaterContext.Provider value={value}>
      {children}
      <FloaterBar />
    </FloaterContext.Provider>
  );
}
