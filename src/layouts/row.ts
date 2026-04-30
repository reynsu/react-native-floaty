import type { ViewStyle } from 'react-native';

export const rowLayout = {
  barStyle: (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
  }),
  actionStyle: (): ViewStyle => ({}),
};
