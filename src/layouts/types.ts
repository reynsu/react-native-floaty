import type { ReactNode } from 'react';
import type { ViewStyle } from 'react-native';
import type { FloaterTheme } from '../types';

export type LayoutModule = {
  /**
   * If true, this layout requires icon-only actions. Labels are suppressed
   * at render time and a dev warning fires when an action carries one.
   */
  iconOnly?: boolean;
  /**
   * If true, each action button renders as a self-contained chip
   * (bg + border + shadow). Used by layouts that hide the bar's own
   * background.
   */
  floatingButtons?: boolean;
  barStyle: (theme: FloaterTheme, radius: number) => ViewStyle;
  actionStyle: (
    i: number,
    n: number,
    theme: FloaterTheme,
    radius: number,
  ) => ViewStyle;
  /**
   * Optional decorative content rendered behind the buttons (e.g. radial
   * reference rings).
   */
  ornament?: (theme: FloaterTheme, radius: number) => ReactNode;
};
