import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';

export type ActionVariant = 'default' | 'danger';
export type FloaterLayout = 'row' | 'radial';
export type FloaterPosition = 'bottom' | 'top';

/**
 * One row in the floating bar.
 *
 * - With `label` only      → text-only button
 * - With `icon` only       → icon-only button (must supply `ariaLabel` for a11y)
 * - With both              → icon + label, side by side
 *
 * `ariaLabel` overrides the accessible name. Required when `label` is omitted.
 * (Internally mapped to RN's `accessibilityLabel`.)
 */
export type FloaterAction = {
  id: string;
  label?: string;
  icon?: ReactNode;
  ariaLabel?: string;
  onSelect: () => void;
  disabled?: boolean;
  variant?: ActionVariant;
};

export type ShowOptions = {
  maxVisible?: number;
  dismissOnSelect?: boolean;
};

export type FloaterState = {
  open: boolean;
  actions: FloaterAction[];
  options: ShowOptions;
};

export type FloaterTheme = {
  bg: string;
  fg: string;
  fgMuted: string;
  border: string;
  danger: string;
  radius: number;
  radiusInner: number;
  padding: number;
  gap: number;
  bottomInset: number;
  width: number | 'auto';
  actionH: number;
  actionPx: number;
  actionPy: number;
  actionFontSize: number;
  actionFontWeight: '400' | '500' | '600' | '700';
  actionBg: string;
  actionBgPressed: string;
  shadow: ViewStyle;
};

export type FloaterActionsProviderProps = {
  children: ReactNode;
  maxVisible?: number;
  closeOnOutsideTap?: boolean;
  closeOnBackPress?: boolean;
  theme?: Partial<FloaterTheme>;
  layout?: FloaterLayout;
  position?: FloaterPosition;
  /** Used by the `radial` layout — defaults to `actionH * 1.6`. */
  radius?: number;
};

export type FloaterApi = FloaterState & {
  show: (actions: FloaterAction[], options?: ShowOptions) => void;
  hide: () => void;
  toggle: (actions?: FloaterAction[]) => void;
};
