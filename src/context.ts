import { createContext } from 'react';
import type { Store } from './store';
import type { FloaterTheme, FloaterLayout, FloaterPosition } from './types';

export type FloaterContextValue = {
  store: Store;
  config: {
    maxVisible: number;
    closeOnOutsideTap: boolean;
    closeOnBackPress: boolean;
    theme: FloaterTheme;
    layout: FloaterLayout;
    position: FloaterPosition;
    radius: number;
  };
};

export const FloaterContext = createContext<FloaterContextValue | null>(null);
